import WebSocket from 'ws'
import type { EventWrapper } from '../api/events'
import type { BlockActionsData } from '../api/interactive/block_actions'
import type { SlashCommandData } from '../api/slash'
import type { App } from '../client'
import {
	DEFAULT_CONNECT_TIMEOUT,
	DEFAULT_MAX_RECONNECT_DELAY,
	reconnectDelay,
	sleep,
} from '../utils'
import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'
import type { BlockSuggestionData } from '../api/interactive/block_suggestion'

export interface SocketEventsReceiverOptions {
	appToken: string
	client: App
	/** How long to wait for the websocket handshake before giving up. Defaults to 30s. */
	connectTimeout?: number
	/** Ceiling for the reconnect backoff. Defaults to 30s. */
	maxReconnectDelay?: number
}

export class SocketEventsReceiver
	extends AsyncEventEmitter<ReceiverEventMap>
	implements EventsReceiver
{
	#appToken: string
	public client: App
	#ws?: WebSocket
	#shouldConnect: boolean = false
	#connecting: boolean = false
	#connectTimeout: number
	#maxReconnectDelay: number

	constructor({
		appToken,
		client,
		connectTimeout = DEFAULT_CONNECT_TIMEOUT,
		maxReconnectDelay = DEFAULT_MAX_RECONNECT_DELAY,
	}: SocketEventsReceiverOptions) {
		super()
		this.#appToken = appToken
		this.client = client
		this.#connectTimeout = connectTimeout
		this.#maxReconnectDelay = maxReconnectDelay
	}

	async start() {
		this.#shouldConnect = true
		return this._connect()
	}

	async stop() {
		this.#shouldConnect = false
		return new Promise<void>((resolve, reject) => {
			const ws = this.#ws
			this.#ws = undefined

			if (!ws || ws.readyState === WebSocket.CLOSED) {
				return resolve()
			}
			if (ws.readyState !== WebSocket.OPEN) {
				// aborting a handshake that never completed emits neither close nor error,
				// so waiting on either one here would hang
				ws.terminate()
				return resolve()
			}

			ws.once('close', () => resolve())
			ws.once('error', (error) => reject(error))
			ws.close()
		})
	}

	private async _connect() {
		if (!this.#shouldConnect) return

		const { url } = await this.client.request('apps.connections.open', { token: this.#appToken })

		return new Promise<void>((resolve, reject) => {
			this.#ws = new WebSocket(url)

			// a handshake that stalls emits neither open nor error, so without this the
			// receiver goes quiet for good while the process stays healthy
			const timer = setTimeout(() => {
				console.error('[socket-mode] connection attempt timed out')
				this.#ws?.terminate()
				reject(new Error('Timed out opening the socket mode websocket'))
			}, this.#connectTimeout)

			this.#ws.addEventListener('open', this.#onOpen.bind(this))
			this.#ws.addEventListener('message', this.#onMessage.bind(this))
			this.#ws.addEventListener('close', this.#onClose.bind(this))
			this.#ws.addEventListener('error', this.#onError.bind(this))
			this.#ws.once('open', () => {
				clearTimeout(timer)
				resolve()
			})
			this.#ws.once('error', (error) => {
				clearTimeout(timer)
				reject(error)
			})
		})
	}

	/**
	 * Drives reconnection with backoff. Reconnect attempts can fail too, and before this a
	 * single failed attempt would end them for good.
	 */
	private async _reconnect(): Promise<void> {
		// a single owner keeps overlapping close and error events from racing two
		// connections, each with its own backoff
		if (this.#connecting) return
		this.#connecting = true

		try {
			let attempt = 0
			while (this.#shouldConnect) {
				try {
					await this._connect()
					return
				} catch (error) {
					const delay = reconnectDelay(attempt++, this.#maxReconnectDelay)
					console.error(`[socket-mode] connection failed, retrying in ${delay}ms`)
					console.error(error)
					await sleep(delay)
				}
			}
		} finally {
			this.#connecting = false
		}
	}

	#onOpen() {
		console.debug('[socket-mode] websocket connected')
	}

	#onMessage(event: WebSocket.MessageEvent) {
		if (typeof event.data === 'string') {
			try {
				const data = JSON.parse(event.data) as AnySocketPayload
				if (data.type === 'events_api') {
					this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id }))
					this.emit('event', data.payload)
				} else if (data.type === 'interactive') {
					if (data.payload.type === 'block_suggestion') {
						this.emit(data.payload.type, data.payload, async (options) => {
							this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id, payload: options }))
						})
					} else {
						this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id }))
						this.emit(data.payload.type, data.payload)
					}
				} else if (data.type === 'slash_commands') {
					this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id }))
					this.emit('slash_command', data.payload)
				} else if (data.type === 'hello') {
					console.debug('[socket-mode] received server hello, app id', data.connection_info.app_id)
				} else {
					console.warn('[socket-mode] unknown message:', data)
				}
			} catch (error) {
				console.error(
					'[socket-mode] failed to parse message:',
					error instanceof Error ? error.message : error,
				)
			}
		}
	}

	#onClose(event: WebSocket.CloseEvent) {
		console.debug('[socket-mode] websocket closed with code', event.code, event.reason)
		this._reconnect()
	}

	#onError(event: { message: string }) {
		console.debug('[socket-mode] websocket error', event.message)
		// closing here fires #onClose, which is what reconnects
		this.#ws?.close()
	}
}

interface SocketPayloadWrapper {
	payload: unknown
	envelope_id: string
	type: string
	accepts_response_payload: boolean
	retry_attempt?: number
	retry_reason?: string
}

interface SocketEventPayload extends SocketPayloadWrapper {
	type: 'events_api'
	payload: EventWrapper
	accepts_response_payload: false
}

interface SocketInteractivePayload extends SocketPayloadWrapper {
	type: 'interactive'
	payload: BlockActionsData | BlockSuggestionData
	accepts_response_payload: false
}

interface SocketSlashCommandPayload extends SocketPayloadWrapper {
	type: 'slash_commands'
	payload: SlashCommandData
	accepts_response_payload: true
}

interface SocketHelloPayload {
	type: 'hello'
	num_connections: number
	debug_info: { host: string; build_number: number; approximate_connection_time: number }
	connection_info: { app_id: string }
}

type AnySocketPayload =
	| SocketEventPayload
	| SocketInteractivePayload
	| SocketSlashCommandPayload
	| SocketHelloPayload

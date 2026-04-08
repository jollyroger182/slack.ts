import WebSocket from 'ws'
import type { EventWrapper } from '../api/events'
import type { BlockActions } from '../api/interactive/block_actions'
import type { SlashCommandPayload } from '../api/slash'
import type { App } from '../client'
import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'

export interface SocketEventsReceiverOptions {
	appToken: string
	client: App
}

export class SocketEventsReceiver
	extends AsyncEventEmitter<ReceiverEventMap>
	implements EventsReceiver
{
	#appToken: string
	public client: App
	#ws?: WebSocket

	constructor({ appToken, client }: SocketEventsReceiverOptions) {
		super()
		this.#appToken = appToken
		this.client = client
	}

	#onEventError(error: any) {
		console.error('[socket-mode] error occurred handling event')
		console.error(error)
	}

	async start() {
		await this._connect()
	}

	private async _connect() {
		const { url } = await this.client.request('apps.connections.open', { token: this.#appToken })

		this.#ws = new WebSocket(url)
		this.#ws.addEventListener('open', this.#onOpen.bind(this))
		this.#ws.addEventListener('message', this.#onMessage.bind(this))
		this.#ws.addEventListener('close', this.#onClose.bind(this))
		this.#ws.addEventListener('error', this.#onError.bind(this))
	}

	#onOpen() {
		console.debug('[socket-mode] websocket connected')
	}

	#onMessage(event: WebSocket.MessageEvent) {
		console.debug('[socket-mode] message received')
		if (typeof event.data === 'string') {
			try {
				const data = JSON.parse(event.data) as AnySocketPayload
				if (data.type === 'events_api') {
					this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id }))
					this.emit('event', data.payload)
				} else if (data.type === 'interactive') {
					this.#ws?.send(JSON.stringify({ envelope_id: data.envelope_id }))
					this.emit(data.payload.type, data.payload)
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
		this._connect()
	}

	#onError(event: WebSocket.ErrorEvent) {
		console.debug('[socket-mode] websocket error', event.message)
		this.#ws?.close()
		this._connect()
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
	payload: BlockActions // TODO other interactions
	accepts_response_payload: false
}

interface SocketSlashCommandPayload extends SocketPayloadWrapper {
	type: 'slash_commands'
	payload: SlashCommandPayload
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

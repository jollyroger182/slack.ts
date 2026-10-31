import { once } from 'node:events'

import type { Client } from '../client'
import type { RTMEvent } from '../types/events'
import { timeoutError } from '../utils/time'
import { BaseReceiver, type ReceiverEventMap } from './base'

export interface RTMReceiverOptions {
	reconnectDelayMs?: number
	pingTimeoutMs?: number
}

export class RTMReceiver extends BaseReceiver<RTMReceiverEventMap> {
	/** An open or opening {@link WebSocket} connection with Slack. */
	public socket?: WebSocket

	constructor(private options?: RTMReceiverOptions) {
		super()
	}

	#running: boolean = false
	#client?: Client
	#reconnectURL?: string
	#reconnectTimeout?: ReturnType<typeof setTimeout>
	#resolveOpen?: () => void
	#id = 1

	async start(client: Client) {
		if (client) this.#client = client
		if (!this.#client) {
			throw new Error('Client is required for the RTM receiver')
		}

		this.#running = true

		if (!this.socket) {
			return new Promise<void>((resolve, reject) => {
				this.#resolveOpen = () => resolve()
				this.#connect().catch((e) => {
					this.#running = false
					reject(e)
				})
			})
		}
	}

	stop() {
		this.#running = false
		this.socket?.close()
		this.socket = undefined
		if (this.#reconnectTimeout) {
			clearTimeout(this.#reconnectTimeout)
			this.#reconnectTimeout = undefined
		}
		this.#reconnectURL = undefined
	}

	async #connect() {
		let url
		if (this.#reconnectURL) {
			url = new URL(this.#reconnectURL)
			this.#reconnectURL = undefined
		} else {
			const { primary_websocket_url } = await this.#client!.request('client.getWebSocketURL')
			url = new URL(primary_websocket_url as string)
			url.searchParams.set('token', (await this.#client!.token).token)
		}

		if (this.socket || !this.#running) return
		this.socket = new WebSocket(url)
		this.socket.addEventListener('open', this.#onOpen.bind(this), { once: true })
		this.socket.addEventListener('close', this.#onClose.bind(this), { once: true })
		this.socket.addEventListener('error', this.#onError.bind(this), { once: true })
		this.socket.addEventListener('message', this.#onMessage.bind(this))
	}

	#onOpen() {
		this.#resolveOpen?.()
		this.#resolveOpen = undefined
	}

	async #onClose(event: CloseEvent) {
		if (event.target !== this.socket) return
		this.socket = undefined
		this.#reconnect()
	}

	async #onError(event: ErrorEvent) {
		console.error('[rtm] websocket error', event.error)
	}

	async #reconnect() {
		if (this.#reconnectTimeout || !this.#running) return
		this.#reconnectTimeout = setTimeout(() => {
			this.#reconnectTimeout = undefined
			this.#connect().catch((e) => {
				console.error('[rtm] error in reconnect', e)
				this.#reconnect()
			})
		}, this.options?.reconnectDelayMs ?? 1000)
	}

	async #onMessage(event: MessageEvent) {
		if (event.target !== this.socket) return
		if (typeof event.data !== 'string') return

		let payload
		try {
			payload = JSON.parse(event.data.replace(/\0/g, '')) as RTMPayload
		} catch (e) {
			console.error('[rtm] error receiving message', e)
			return
		}

		// TODO: parse payload
	}

	async #ping(socket: WebSocket): Promise<void> {
		const id = this.#id++
		const pingTimeoutMs = this.options?.pingTimeoutMs ?? 60_000
		const promise = once(this, `replied:${id}`)
		socket.send(JSON.stringify({ type: 'ping', id }))
		try {
			await Promise.race([promise, timeoutError(pingTimeoutMs)])
		} catch {
			console.error(`[rtm] ping timed out after ${pingTimeoutMs}ms`)
			socket.close()
		}
		return this.#ping(socket)
	}
}

export type RTMReceiverEventMap = ReceiverEventMap & {
	[K in `replied.${number}`]: []
}

interface PongPayload {
	type: 'pong'
	reply_to: number
}

interface ErrorPayload {
	type: 'error'
	error: { msg: string; code: number; source: string }
}

type RTMPayload = RTMEvent | PongPayload | ErrorPayload

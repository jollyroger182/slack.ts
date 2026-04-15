import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http'
import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'
import { HttpFetchReceiver, type HttpFetchReceiverOptions } from './fetch'

export interface HttpServerReceiverOptions extends Omit<HttpFetchReceiverOptions, 'signingSecret'> {
	signingSecret: string
	port?: number
	path?: string
}

/**
 * HTTP server receiver using Node.js built-in http module.
 *
 * This receiver starts its own HTTP server and listens for Slack events on a specified port and
 * path.
 *
 * Example usage:
 *
 * ```typescript
 * const app = new App({
 * 	token: process.env.SLACK_BOT_TOKEN,
 * 	receiver: {
 * 		type: 'http',
 * 		signingSecret: process.env.SLACK_SIGNING_SECRET,
 * 		port: 3000,
 * 		path: '/slack/events',
 * 	},
 * })
 *
 * await app.start()
 * console.log('Server listening on port 3000 at /slack/events')
 * ```
 */
export class HttpServerReceiver
	extends AsyncEventEmitter<ReceiverEventMap>
	implements EventsReceiver
{
	#fetchReceiver: HttpFetchReceiver
	#server?: Server
	#port: number
	#path: string

	constructor({
		signingSecret,
		client,
		port = 3000,
		path = '/slack/events',
	}: HttpServerReceiverOptions) {
		super()

		this.#fetchReceiver = new HttpFetchReceiver({ signingSecret, client })
		this.#port = port
		this.#path = path

		this.#fetchReceiver.on('event', (payload) => this.emit('event', payload))
		this.#fetchReceiver.on('block_actions', (payload) => this.emit('block_actions', payload))
		this.#fetchReceiver.on('block_suggestion', (payload, responder) =>
			this.emit('block_suggestion', payload, responder),
		)
		this.#fetchReceiver.on('view_submission', (payload) => this.emit('view_submission', payload))
		this.#fetchReceiver.on('slash_command', (payload) => this.emit('slash_command', payload))
	}

	async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.#server = createServer(this.#onRequest.bind(this))

			this.#server.on('error', reject)

			this.#server.listen(this.#port, () => {
				console.debug(`[http-server] listening on port ${this.#port} at ${this.#path}`)
				resolve()
			})
		})
	}

	async stop(): Promise<void> {
		if (!this.#server) return

		return new Promise((resolve, reject) => {
			this.#server!.close((err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}

	async #onRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
		if (req.method !== 'POST' || req.url !== this.#path) {
			res.writeHead(404, { 'Content-Type': 'text/plain' })
			res.end('Not Found')
			return
		}

		try {
			const headers = new Headers()
			for (const [key, value] of Object.entries(req.headers)) {
				if (typeof value === 'string') {
					headers.set(key, value)
				} else if (Array.isArray(value)) {
					headers.set(key, value.join(', '))
				}
			}

			const chunks: Buffer[] = []
			for await (const chunk of req) {
				chunks.push(chunk)
			}
			const body = Buffer.concat(chunks)

			const webRequest = new Request('http://localhost/', {
				method: 'POST',
				headers,
				body: body.length > 0 ? body : undefined,
			})

			const response = await this.#fetchReceiver.fetch(webRequest)

			res.writeHead(response.status, Object.fromEntries(response.headers.entries()))

			if (response.body) {
				res.end(await response.text())
			} else {
				res.end()
			}
		} catch (error) {
			console.error('[http-server] error handling request:', error)
			res.writeHead(500, { 'Content-Type': 'text/plain' })
			res.end('Internal Server Error')
		}
	}
}

import { once } from 'node:events'
import http from 'node:http'

import { parseHTTPPayload, RequestParsingError } from '../utils/http'
import { BaseReceiver } from './base'

export interface HTTPReceiverOptions {
	/** Slack signing secret, obtained from the developer portal. */
	signingSecret: string

	/**
	 * Port to listen on.
	 *
	 * @default 8000
	 */
	port?: number

	/**
	 * Host to listen on.
	 *
	 * @default '0.0.0.0'
	 */
	host?: string

	/**
	 * Path to respond on. Other paths will return 404.
	 *
	 * @default '/slack/events'
	 */
	path?: string

	/**
	 * Maximum size of a request to handle.
	 *
	 * @default 1_000_000
	 */
	maxRequestSize?: number
}

export class HTTPReceiver extends BaseReceiver {
	public readonly server: http.Server

	constructor(private options: HTTPReceiverOptions) {
		super()

		this.server = http.createServer(async (req, res) => {
			try {
				await this._handleRequest(req, res)
			} catch (error) {
				console.error('Error handling HTTP request', error)
				if (!res.headersSent) res.writeHead(500)
				res.end()
			}
		})
	}

	/** @internal */
	async _handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
		const end = (status: number, chunk?: string) => {
			res.writeHead(status)
			res.end(chunk)
		}

		const url = new URL(req.url!, 'http://localhost')
		if (url.pathname !== (this.options.path ?? '/slack/events')) {
			return end(404)
		}

		const maxRequestSize = this.options.maxRequestSize ?? 1_000_000

		let chunks: Buffer[] = []
		let size = 0
		for await (const chunk of req) {
			size += chunk.length
			if (size > maxRequestSize) {
				return end(400)
			}
			chunks.push(chunk)
		}

		const body = Buffer.concat(chunks).toString('utf8')

		let data
		try {
			data = parseHTTPPayload(body, this.options.signingSecret, (name) => {
				const header = req.headers[name.toLowerCase()]
				return Array.isArray(header) ? header.join(', ') : header
			})
		} catch (e) {
			console.error('[http] Error parsing Slack request', e)
			if (e instanceof RequestParsingError) return end(400)
			return end(500)
		}

		if (!data) {
			return end(400)
		}

		switch (data.type) {
			case 'event_callback':
				this.emit('event', data.payload)
				end(200)
				break

			case 'url_verification':
				end(200, data.payload.challenge)
				break

			case 'block_actions':
				this.emit('actions', data.payload)
				end(200)
				break

			default:
				data satisfies never
				end(500)
				throw new Error('unreachable')
		}
	}

	async start() {
		this.server.listen(this.options.port ?? 8000, this.options.host ?? '0.0.0.0')
		await once(this.server, 'listening')
	}

	async stop() {
		await new Promise<void>((resolve) => {
			this.server.close(() => resolve())
			this.server.closeIdleConnections()
		})
	}
}

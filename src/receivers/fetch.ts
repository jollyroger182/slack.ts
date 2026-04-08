import type { App } from '../client'
import { AsyncEventEmitter } from '../utils/events'
import { parseSlackRequest, type SlackHttpPayload } from '../utils/http'
import type { EventsReceiver, ReceiverEventMap } from './base'

export interface HttpFetchReceiverOptions {
	signingSecret: string
	client: App
}

/**
 * Stateless HTTP receiver that exposes a fetch() method.
 *
 * This receiver is designed for serverless and other environments where the user manages their HTTP
 * server. It handles a single request at a time without maintaining server state.
 *
 * Example usage:
 *
 * ```typescript
 * const receiver = new HttpFetchReceiver({
 * 	signingSecret: process.env.SLACK_SIGNING_SECRET,
 * 	client: app,
 * })
 *
 * // For Cloudflare Workers, Deno, etc.:
 * export default {
 * 	fetch: (request) => receiver.fetch(request),
 * }
 *
 * // For Express:
 * app.post('/slack/events', async (req, res) => {
 * 	const response = await receiver.fetch(
 * 		new Request('http://localhost/', {
 * 			method: req.method,
 * 			headers: req.headers,
 * 			body: req.body,
 * 		}),
 * 	)
 * 	res.status(response.status).send(await response.text())
 * })
 * ```
 */
export class HttpFetchReceiver
	extends AsyncEventEmitter<ReceiverEventMap>
	implements EventsReceiver
{
	#signingSecret: string
	#client: App

	constructor({ signingSecret, client }: HttpFetchReceiverOptions) {
		super()
		this.#signingSecret = signingSecret
		this.#client = client
	}

	#onError(error: any) {
		console.error('[http-fetch] error occurred handling event')
		console.error(error)
	}

	/**
	 * Handles an incoming HTTP request from Slack.
	 *
	 * @param request The incoming HTTP request
	 * @returns An HTTP response to send back to Slack
	 */
	async fetch(request: Request): Promise<Response> {
		try {
			const payload = await parseSlackRequest(request, this.#signingSecret)
			return this.#handlePayload(payload)
		} catch (error) {
			console.error(
				'[http-fetch] error parsing request:',
				error instanceof Error ? error.message : error,
			)

			if (error instanceof Error && error.message.includes('Invalid signature')) {
				return new Response('Unauthorized', { status: 403 })
			}

			return new Response('Bad Request', { status: 400 })
		}
	}

	async #handlePayload(payload: SlackHttpPayload): Promise<Response> {
		switch (payload.type) {
			case 'url_verification':
				return new Response(JSON.stringify({ challenge: payload.challenge }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})

			case 'event':
				await this.emit('event', payload.payload)
				return new Response(null, { status: 200 })

			case 'block_actions':
				await this.emit('block_actions', payload.payload)
				return new Response(null, { status: 200 })

			case 'view_submission':
				await this.emit('view_submission', payload.payload)
				return new Response(null, { status: 200 })

			case 'slash_command':
				await this.emit('slash_command', payload.payload)
				return new Response(null, { status: 200 })

			default:
				const _exhaustive: never = payload
				return new Response(null, { status: 200 })
		}
	}

	async start(): Promise<void> {}
}

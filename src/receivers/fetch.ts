import { parseHTTPPayload } from '../utils/http'
import { BaseReceiver } from './base'

export interface FetchReceiverOptions {
	/** Slack signing secret, obtained from the developer portal. */
	signingSecret: string

	/**
	 * Custom function to call for each promise that would be left dangling. This is mostly useful in
	 * serverless environments, such as Vercel and Cloudflare Workers. Refer to your provider's
	 * documentation for what to pass into this parameter.
	 */
	waitUntil?: (promise: Promise<unknown>) => void
}

/**
 * Fetch receiver. Exposes a standard `fetch` function that takes a {@link Request} and returns a
 * {@link Response}. This can be used e.g. in serverless environments.
 *
 * @remarks
 *   This receiver does NOT check the request size. You're responsible for configuring that in your
 *   request handler / framework before this.
 * @example
 * 	const receiver = new FetchReceiver({ signingSecret })
 * 	Bun.serve({ routes: { '/slack/events': receiver.fetch } })
 */
export class FetchReceiver extends BaseReceiver {
	constructor(private options: FetchReceiverOptions) {
		super()
		this.fetch = this.fetch.bind(this)
	}

	start() {}

	stop() {}

	#waitUntil(promise: Promise<unknown>) {
		this.options.waitUntil?.(promise)
	}

	/** Handle a Slack request and returns a Response object. */
	async fetch(request: Request): Promise<Response> {
		let data
		try {
			data = parseHTTPPayload(
				await request.text(),
				this.options.signingSecret,
				(name) => request.headers.get(name) ?? undefined,
			)
		} catch (e) {
			console.error('[fetch] Error parsing Slack request', e)
			return new Response(null, { status: 500 })
		}

		if (!data) {
			return new Response(null, { status: 400 })
		}

		switch (data.type) {
			case 'event_callback':
				this.#waitUntil(this.emit('event', data.payload))
				return new Response()

			case 'url_verification':
				return new Response(String(data.payload.challenge))

			default:
				data satisfies never
				throw new Error('unreachable')
		}
	}
}

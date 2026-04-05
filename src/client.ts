import { sleep } from './utils'
import { ChannelRef } from './resources/channel'
import { SlackWebAPIError, SlackWebAPIPlatformError } from './error'
import {
	POST_METHODS,
	type SlackAPIMethod,
	type SlackAPIParams,
	type SlackAPIResponse,
} from './api'
import { SocketEventsReceiver, type SocketEventsReceiverOptions } from './events/receivers/socket'
import type { DistributiveOmit } from './utils/typing'
import type { EventsReceiver, EventWrapper } from './events/types'
import { DummyReceiver } from './events/receivers/dummy'

type ReceiverOptions =
	| ({
			type: 'socket'
	  } & DistributiveOmit<SocketEventsReceiverOptions, 'client'>)
	| {
			type: 'dummy'
			options?: never
	  }

interface AppOptions {
	token?: string
	receiver?: ReceiverOptions
}

export class App {
	#token?: string
	#receiver: EventsReceiver

	constructor({ token, receiver = { type: 'dummy' } }: AppOptions = {}) {
		this.#token = token
		switch (receiver.type) {
			case 'socket':
				this.#receiver = new SocketEventsReceiver({ ...receiver, client: this })
				break
			default:
				this.#receiver = new DummyReceiver()
		}
		this.#receiver.on('event', this.#onEvent.bind(this))
	}

	async #onEvent(event: EventWrapper) {
		console.log('event received:', event)
	}

	/**
	 * Starts the event receiver. If you don't use the events, interactions, and slash command APIs,
	 * you don't need to call this function.
	 */
	async start() {
		await this.#receiver.start()
	}

	/**
	 * Gets a channel reference object. You can use this object to call API methods, or `await` it to
	 * fetch channel details.
	 *
	 * @param id Channel ID
	 * @returns A channel reference object
	 */
	channel(id: string) {
		return new ChannelRef(this, id)
	}

	/**
	 * Makes a Slack Web API request.
	 *
	 * @param endpoint The Slack Web API method to call
	 * @param params The parameters for the method
	 * @param [method='GET'] The HTTP method for the request. Default is `'GET'`
	 * @returns The response from the API call
	 */
	async request<Method extends SlackAPIMethod>(
		endpoint: Method,
		params: SlackAPIParams<Method>,
		method: 'GET' | 'POST' = POST_METHODS.includes(endpoint) ? 'POST' : 'GET',
	): Promise<SlackAPIResponse<Method> & { ok: true }> {
		const body = method !== 'GET' ? JSON.stringify(params) : undefined

		const url = new URL(`https://slack.com/api/${endpoint}`)
		if (method === 'GET' && params) {
			for (const [key, value] of Object.entries(params)) {
				if (value instanceof Array) {
					for (const item of value) {
						url.searchParams.append(key, item)
					}
				} else if (value !== undefined && value !== null) {
					url.searchParams.set(key, String(value))
				}
			}
		}

		const headers = new Headers()
		if (body) {
			headers.append('Content-Type', 'application/json; charset=utf-8')
		}
		if (params.token || this.#token) {
			headers.set('Authorization', `Bearer ${params.token || this.#token}`)
		}

		const res = await request<SlackAPIResponse<Method>>(url.toString(), { method, body, headers })

		if (!res.ok) {
			throw new SlackWebAPIPlatformError(url.toString(), res, res.error)
		}

		return res
	}
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
	const res = await fetch(url, options)

	if (res.status === 429) {
		const retryAfter = Number(res.headers.get('Retry-After') ?? 2)
		await sleep(retryAfter * 1000)
		return request(url, options)
	}

	if (!res.ok) throw new SlackWebAPIError(url, await res.json())

	return (await res.json()) as T
}

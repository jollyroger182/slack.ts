import { sleep } from './utils'
import { ChannelRef } from './resources/channel'
import { SlackWebAPIError, SlackWebAPIPlatformError } from './error'
import {
	POST_METHODS,
	type SlackAPIMethod,
	type SlackAPIParams,
	type SlackAPIResponse,
} from './api'

interface AppOptions {
	token?: string
}

export class App {
	#token?: string

	constructor({ token }: AppOptions) {
		this.#token = token
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

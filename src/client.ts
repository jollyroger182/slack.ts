import { sleep } from 'bun'
import { ChannelRef } from './resources/channel'
import { SlackWebAPIError } from './error'

interface AppOptions {
	token?: string
}

export class App {
	#token?: string

	constructor({ token }: AppOptions) {
		this.#token = token
	}

	channel(id: string) {
		return new ChannelRef(this, id)
	}

	/** @internal */
	request<T>(endpoint: string, params?: object, method = 'GET'): Promise<T> {
		const body = method !== 'GET' ? JSON.stringify(params) : undefined

		const url = new URL(`https://slack.com/api/${endpoint}`)
		if (method === 'GET' && params) {
			for (const [key, value] of Object.entries(params)) {
				if (typeof value === 'string') {
					url.searchParams.set(key, value)
				} else if (value instanceof Array) {
					for (const item of value) {
						url.searchParams.append(key, item)
					}
				}
			}
		}

		const headers = new Headers()
		if (body) {
			headers.append('Content-Type', 'application/json; charset=utf-8')
		}
		if (this.#token) {
			headers.append('Authorization', `Bearer ${this.#token}`)
		}

		return request<T>(url.toString(), { method, body, headers })
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

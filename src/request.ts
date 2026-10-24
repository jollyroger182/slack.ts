import { delay } from './utils'

export interface RequestOptions extends RequestInit {
	/**
	 * Number of times to retry a request.
	 *
	 * @default 3
	 */
	retries?: number

	/**
	 * Base delay to wait when a request fails with a 429 without a `Retry-After` header, in
	 * milliseconds.
	 *
	 * @default 1000
	 */
	baseDelayMs?: number

	/**
	 * Whether to use a full jitter on the backoff, and an added jitter if the `Retry-After` header is
	 * sent.
	 *
	 * @default true
	 */
	jitter?: boolean

	/**
	 * Maximum jitter amount to add on top of `Retry-After`.
	 *
	 * @default 1000
	 */
	maxJitterMs?: number
}

/** Like `fetch`, but handles exponential backoff. */
export async function request(url: string | URL, options?: RequestOptions) {
	return _request(url, { ...options, retry: 0 })
}

async function _request(url: string | URL, options: RequestOptions & { retry: number }) {
	const { retry, ...requestOptions } = options
	const {
		retries = 3,
		baseDelayMs = 1000,
		jitter = true,
		maxJitterMs = 1000,
		...init
	} = requestOptions

	const response = await fetch(url, init)

	if (response.status === 429) {
		if (retry >= retries) {
			throw new RequestError(`Failed to fetch ${url} after ${retries} tries`, requestOptions)
		}

		const retryAfterHeader = Number(response.headers.get('Retry-After'))

		const retryAfter = retryAfterHeader
			? retryAfterHeader * 1000 + (jitter ? Math.random() * maxJitterMs : 0)
			: baseDelayMs * (jitter ? Math.random() : 1) * 2 ** retry

		await delay(retryAfter)

		return _request(url, { ...options, retry: retry + 1 })
	}

	return response
}

export class RequestError extends Error {
	constructor(
		message: string,
		public options: RequestOptions,
	) {
		super(message)
	}
}

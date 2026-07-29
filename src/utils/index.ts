export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export const DEFAULT_CONNECT_TIMEOUT = 30_000
export const DEFAULT_MAX_RECONNECT_DELAY = 30_000
const INITIAL_RECONNECT_DELAY = 1_000

/** Doubles the delay per consecutive failure, settling at `maxDelay`. */
export function reconnectDelay(attempt: number, maxDelay = DEFAULT_MAX_RECONNECT_DELAY) {
	return Math.min(maxDelay, INITIAL_RECONNECT_DELAY * 2 ** attempt)
}

export function makeProxy(object: any, getter: () => any) {
	return new Proxy(object, {
		get(target, prop) {
			if (prop in target) {
				const value = (target as any)[prop]
				if (typeof value === 'function') return value.bind(target)
				return value
			}
			return getter()[prop]
		},
	})
}

export type AnyToken = string | { cookie: string; token: string }

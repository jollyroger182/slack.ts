export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
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

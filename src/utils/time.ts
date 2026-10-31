export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

export function timeoutError(ms: number, signal?: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => reject(), ms)
		signal?.addEventListener('abort', () => {
			clearTimeout(timeout)
			resolve()
		})
	})
}

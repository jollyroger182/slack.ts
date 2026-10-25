export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function timeout<T>(
	ms: number,
	func: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), ms)

	try {
		return await Promise.race([
			func(controller.signal),
			new Promise<never>((_, reject) =>
				controller.signal.addEventListener(
					'abort',
					() => reject(new TimeoutError(`Timed out after ${ms}ms`)),
					{ once: true },
				),
			),
		])
	} finally {
		clearTimeout(timeout)
	}
}

export class TimeoutError extends Error {}

export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

export function timeoutError(ms: number) {
	return new Promise((_, reject) => setTimeout(reject, ms))
}

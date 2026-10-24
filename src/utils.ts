/**
 * Ensure the provided text (URL encoded or not) is URL encoded exactly once.
 *
 * @param text The text to URL encode.
 * @returns URL encoded text
 */
export function ensureUrlEncoded(text: string) {
	return encodeURIComponent(decodeURIComponent(text))
}

export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms))
}

export type Equals<A, B> = A extends B ? (B extends A ? true : false) : false

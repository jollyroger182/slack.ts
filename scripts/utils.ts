import { resolve } from 'node:path'

export async function cachedRequest(input: string, init?: RequestInit) {
	const url = new URL(input)
	const path = url.pathname.substring(1)
	const cacheFile = Bun.file(resolve('scripts/tmp_cache', url.host, path))

	if (await cacheFile.exists()) {
		return await cacheFile.text()
	}

	const resp = await fetch(url, init)
	if (!resp.ok) {
		throw new Error(`Failed to fetch ${url}: ${resp.status}\n${await resp.text()}`)
	}

	const text = await resp.text()

	Bun.write(cacheFile, text, { createPath: true })

	return text
}

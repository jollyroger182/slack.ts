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

export function generateInterface(obj: any, name: string) {
	function _generateType(obj: any, indent = ''): string {
		if (Array.isArray(obj)) {
			if (obj.length) return _generateType(obj[0], indent) + '[]'
			return 'unknown[]'
		}
		if (obj === null || obj === undefined) return 'unknown'
		if (typeof obj === 'object') {
			return [
				'{',
				...Object.entries(obj).map(
					([k, v]) => `${indent}\t"${k}": ${_generateType(v, indent + '\t')}`,
				),
				`${indent}}`,
			].join('\n')
		}
		return typeof obj
	}

	return `export interface ${name} ${_generateType(obj)}`
}

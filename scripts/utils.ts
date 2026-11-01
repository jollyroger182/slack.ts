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

export interface GenerateInterfaceOptions {
	isOptional?: (path: string[]) => unknown
}

export function generateInterface(obj: any, name: string, options: GenerateInterfaceOptions = {}) {
	function _generateType(obj: any, indent = '', path: string[] = []): string {
		if (Array.isArray(obj)) {
			if (obj.length) return _generateType(obj[0], indent, [...path, '0']) + '[]'
			return 'unknown[]'
		}
		if (obj === null || obj === undefined) return 'unknown'
		if (typeof obj === 'object') {
			return [
				'{',
				...Object.entries(obj).map(
					([k, v]) =>
						`${indent}\t"${k}"${options.isOptional?.([...path, k]) ? '?' : ''}: ${_generateType(v, indent + '\t', [...path, k])}`,
				),
				`${indent}}`,
			].join('\n')
		}
		return typeof obj
	}

	return `export interface ${name} ${_generateType(obj)}`
}

import { describe, expect, it } from 'bun:test'

import { resolveFile } from './file'

describe('resolveFile', () => {
	it('resolves File objects', () => {
		const file = new File(['hello world'], 'file.txt')
		const resolved = resolveFile(file)

		expect(resolved).toEqual({ name: 'file.txt', length: file.size, value: file })
	})

	it('resolves wrapped Blobs', () => {
		const blob = new Blob(['hello world'])
		const resolved = resolveFile({ name: 'file.txt', value: blob })

		expect(resolved).toEqual({ name: 'file.txt', length: blob.size, value: blob })
	})

	it('resolves wrapped TypedArrays', () => {
		const blob = new TextEncoder().encode('hello world')
		const resolved = resolveFile({ name: 'file.txt', value: blob })

		expect(resolved).toEqual({ name: 'file.txt', length: blob.byteLength, value: blob })
	})
})

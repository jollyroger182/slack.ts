import { describe, expect, it } from 'bun:test'
import { sleep, makeProxy } from '../../src/utils'

describe('Utilities', () => {
	describe('sleep', () => {
		it('returns a promise', () => {
			const result = sleep(10)
			expect(result).toBeInstanceOf(Promise)
		})

		it('resolves after specified time', async () => {
			const start = Date.now()
			await sleep(50)
			const elapsed = Date.now() - start
			expect(elapsed).toBeGreaterThanOrEqual(40)
		})

		it('resolves with undefined', async () => {
			const result = await sleep(10)
			expect(result).toBeUndefined()
		})

		it('can sleep for 0ms', async () => {
			const result = await sleep(0)
			expect(result).toBeUndefined()
		})

		it('sleep can be chained', async () => {
			await sleep(10)
			await sleep(10)
			expect(true).toBeTrue()
		})
	})

	describe('makeProxy', () => {
		it('returns a proxy object', () => {
			const target = { a: 1 }
			const proxy = makeProxy(target, () => ({ b: 2 }))
			expect(proxy).toBeDefined()
		})

		it('can access direct properties', () => {
			const target = { a: 1, b: 2 }
			const proxy = makeProxy(target, () => ({ c: 3 }))
			expect(proxy.a).toBe(1)
			expect(proxy.b).toBe(2)
		})

		it('can access getter properties', () => {
			const target = { a: 1 }
			const getter = () => ({ b: 2, c: 3 })
			const proxy = makeProxy(target, getter)
			expect(proxy.b).toBe(2)
			expect(proxy.c).toBe(3)
		})

		it('target properties take precedence', () => {
			const target = { a: 1 }
			const getter = () => ({ a: 999, b: 2 })
			const proxy = makeProxy(target, getter)
			expect(proxy.a).toBe(1)
		})

		it('binds methods from target', () => {
			const target = {
				value: 42,
				getValue() {
					return this.value
				},
			}
			const proxy = makeProxy(target, () => ({}))
			expect(proxy.getValue()).toBe(42)
		})

		it('binds methods from getter', () => {
			const target = {}
			const getterObj = {
				value: 42,
				getValue() {
					return this.value
				},
			}
			const proxy = makeProxy(target, () => getterObj)
			expect(proxy.getValue()).toBe(42)
		})

		it('does not interfere with property assignment', () => {
			const target = { a: 1 }
			const proxy = makeProxy(target, () => ({ b: 2 }))
			proxy.a = 10
			expect(target.a).toBe(10)
		})

		it('handles undefined access', () => {
			const target = { a: 1 }
			const proxy = makeProxy(target, () => ({ b: 2 }))
			expect(proxy.nonexistent).toBeUndefined()
		})
	})
})

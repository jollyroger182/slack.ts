import { describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { DummyReceiver } from '../../src/receivers/dummy'

describe('DummyReceiver', () => {
	it('can be instantiated', () => {
		const receiver = new DummyReceiver()
		expect(receiver).toBeDefined()
	})

	it('is an EventEmitter', () => {
		const receiver = new DummyReceiver()
		expect(receiver).toHaveProperty('on')
		expect(receiver).toHaveProperty('emit')
		expect(receiver).toHaveProperty('off')
	})

	it('can be used with App', () => {
		const app = new App({ receiver: { type: 'dummy' } })
		expect(app).toBeDefined()
	})

	it('start method succeeds', async () => {
		const receiver = new DummyReceiver()
		const result = await receiver.start()
		expect(result).toBeUndefined()
	})

	it('has EventEmitter methods', () => {
		const receiver = new DummyReceiver()

		expect(typeof receiver.on).toBe('function')
		expect(typeof receiver.once).toBe('function')
		expect(typeof receiver.off).toBe('function')
		expect(typeof receiver.emit).toBe('function')
	})
})

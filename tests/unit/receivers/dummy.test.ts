import { describe, it, expect } from 'bun:test'
import { DummyReceiver } from '../../../src/receivers/dummy'

describe('DummyReceiver', () => {
	it('creates a dummy receiver', () => {
		const receiver = new DummyReceiver()
		expect(receiver).toBeDefined()
	})

	it('can start', async () => {
		const receiver = new DummyReceiver()
		// Should not throw
		await receiver.start()
	})

	it('can stop', async () => {
		const receiver = new DummyReceiver()
		// Should not throw
		await receiver.stop()
	})
})

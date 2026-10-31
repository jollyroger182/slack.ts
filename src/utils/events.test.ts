import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AsyncEventEmitter, once } from './events'

interface EmitterMap {
	message: [text: string]
	pong: [id: number]
}

describe('AsyncEventEmitter', () => {
	let emitter: AsyncEventEmitter<EmitterMap>

	beforeEach(() => {
		emitter = new AsyncEventEmitter()
	})

	it('calls registered listener', async () => {
		const handler = mock()

		emitter.on('message', handler)
		await emitter.emit('message', 'hello world')

		expect(handler).toBeCalledTimes(1)
		expect(handler).toBeCalledWith('hello world')
	})

	it('calls registered once listener only once', async () => {
		const handler = mock()

		emitter.once('message', handler)
		await emitter.emit('message', 'hello world')
		await emitter.emit('message', 'test')

		expect(handler).toBeCalledTimes(1)
		expect(handler).toBeCalledWith('hello world')
	})

	it('off unregisters handlers', async () => {
		const handler = mock()

		emitter.on('message', handler)
		await emitter.emit('message', 'hello world')
		emitter.off('message', handler)
		await emitter.emit('message', 'test')

		expect(handler).toBeCalledTimes(1)
		expect(handler).toBeCalledWith('hello world')
	})

	it('off unregisters once handlers', async () => {
		const handler = mock()

		emitter.once('message', handler)
		emitter.off('message', handler)
		await emitter.emit('message', 'test')

		expect(handler).toBeCalledTimes(0)
	})

	describe('events.once', () => {
		it('waits for an event once', async () => {
			const promise = once(emitter, 'message')
			await emitter.emit('message', 'hello world')
			const result = await promise

			expect(result).toEqual(['hello world'])
		})
	})
})

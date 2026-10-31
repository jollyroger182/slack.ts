import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	jest,
	type Mock,
	spyOn,
} from 'bun:test'

import { delay, timeoutError } from './time'

describe('delay', () => {
	let setTimeoutSpy: Mock<typeof setTimeout>

	beforeAll(() => {
		setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
			callback: () => unknown,
		) => {
			callback()
			return -1 as unknown as ReturnType<typeof setTimeout>
		}) as typeof setTimeout)
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('delays a given number of milliseconds', async () => {
		await delay(1000)

		expect(setTimeoutSpy).toBeCalledTimes(1)
		const args = setTimeoutSpy.mock.lastCall!
		expect(args[1]).toBe(1000)
	})
})

describe('timeoutError', () => {
	it('throws an error after a given amount of time', async () => {
		const start = Date.now()

		expect(timeoutError(50)).rejects.toThrow()

		const end = Date.now()

		expect(end - start).toBeGreaterThanOrEqual(50)
	})

	it('aborts with the signal', async () => {
		const start = Date.now()

		const controller = new AbortController()
		const promise = timeoutError(50, controller.signal)
		await delay(25)
		controller.abort()
		const result = await promise

		expect(result).toBeUndefined()

		const end = Date.now()

		expect(end - start).toBeWithin(25, 50)
	})
})

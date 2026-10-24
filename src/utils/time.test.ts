import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	jest,
	spyOn,
	type Mock,
} from 'bun:test'
import { delay } from './time'

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

import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	jest,
	type Mock,
	spyOn,
} from 'bun:test'

import { request, RequestError } from './request'
import * as time from './time'

describe('request', () => {
	let fetchSpy: Mock<typeof fetch>
	let randomSpy: Mock<typeof Math.random>
	let delaySpy: Mock<typeof time.delay>

	beforeAll(() => {
		fetchSpy = spyOn(globalThis, 'fetch')
		randomSpy = spyOn(Math, 'random')
		delaySpy = spyOn(time, 'delay')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('makes requests with no body', async () => {
		const mockResponse = new Response('{"ok":true}', {
			headers: { 'Content-Type': 'application/json' },
		})
		fetchSpy.mockResolvedValueOnce(mockResponse)

		const resp = await request('https://example.com')

		expect(resp).toBe(mockResponse)
		expect(fetchSpy).toBeCalledTimes(1)
		expect(fetchSpy).toBeCalledWith('https://example.com', {})
	})

	it('makes requests with FormData body', async () => {
		const mockResponse = new Response('{"ok":true}', {
			headers: { 'Content-Type': 'application/json' },
		})
		fetchSpy.mockResolvedValueOnce(mockResponse)

		const body = new FormData()
		body.set('key', 'value')
		body.set('file', new Blob(['hello world']))
		await request('https://example.com', { method: 'POST', body })

		expect(fetchSpy).toBeCalledWith('https://example.com', { method: 'POST', body })
	})

	describe('429 with Retry-After', () => {
		let mockResponse1, mockResponse2

		beforeEach(() => {
			mockResponse1 = new Response('{"ok":false,"error":"rate_limit_exceeded"}', {
				status: 429,
				headers: { 'Content-Type': 'application/json', 'Retry-After': '1' },
			})
			mockResponse2 = new Response('{"ok":true}', {
				headers: { 'Content-Type': 'application/json' },
			})
			fetchSpy.mockResolvedValueOnce(mockResponse1)
			fetchSpy.mockResolvedValueOnce(mockResponse2)
		})

		it('honors Retry-After on 429', async () => {
			await request('https://example.com', { jitter: false })

			expect(fetchSpy).toBeCalledTimes(2)
			expect(delaySpy).toBeCalledTimes(1)
			expect(delaySpy).toBeCalledWith(1000)
		})

		it('adds jitter to Retry-After', async () => {
			randomSpy.mockReturnValueOnce(0.5)

			await request('https://example.com')

			expect(delaySpy).toBeCalledTimes(1)
			expect(delaySpy).toBeCalledWith(1500)
		})
	})

	describe('429 with no Retry-After', () => {
		let mockResponse1, mockResponse2

		beforeEach(() => {
			mockResponse1 = new Response('{"ok":false,"error":"rate_limit_exceeded"}', {
				status: 429,
				headers: { 'Content-Type': 'application/json' },
			})
			mockResponse2 = new Response('{"ok":true}', {
				headers: { 'Content-Type': 'application/json' },
			})
			fetchSpy.mockResolvedValueOnce(mockResponse1)
			fetchSpy.mockResolvedValueOnce(mockResponse2)
		})

		it('delays before retrying', async () => {
			await request('https://example.com', { jitter: false })

			expect(fetchSpy).toBeCalledTimes(2)
			expect(delaySpy).toBeCalledTimes(1)
			expect(delaySpy).toBeCalledWith(1000)
		})

		it('full jitters', async () => {
			randomSpy.mockReturnValueOnce(0.5)

			await request('https://example.com')

			expect(fetchSpy).toBeCalledTimes(2)
			expect(delaySpy).toBeCalledTimes(1)
			expect(delaySpy).toBeCalledWith(500)
		})
	})

	it('fails after 3 retries', async () => {
		const mockResponse = new Response('{"ok":false,"error":"rate_limit_exceeded"}', {
			status: 429,
			headers: { 'Content-Type': 'application/json' },
		})
		fetchSpy.mockResolvedValue(mockResponse)

		randomSpy.mockReturnValue(1)

		expect(request('https://example.com')).rejects.toThrow(
			'Failed to fetch https://example.com after 3 tries',
		)
		expect(fetchSpy).toBeCalledTimes(4)
		expect(delaySpy).toBeCalledTimes(3)
		expect(delaySpy).toHaveBeenNthCalledWith(1, 1000)
		expect(delaySpy).toHaveBeenNthCalledWith(2, 2000)
		expect(delaySpy).toHaveBeenNthCalledWith(3, 4000)
	})

	it("doesn't expose the token in an error", async () => {
		const mockResponse = new Response('{"ok":false,"error":"rate_limit_exceeded"}', {
			status: 429,
			headers: { 'Content-Type': 'application/json' },
		})
		fetchSpy.mockResolvedValue(mockResponse)

		randomSpy.mockReturnValue(0)

		try {
			await request('https://slack.com/api/auth.test', {
				headers: { cookie: 'd=xoxd-1234', authorization: 'Bearer xoxc-1234' },
			})
		} catch (e) {
			expect(e).toBeInstanceOf(RequestError)
			const re = e as RequestError
			expect(JSON.stringify(re.options)).not.toInclude('xoxd-1234')
			expect(JSON.stringify(re.options)).not.toInclude('xoxc-1234')
			return
		}

		expect('').toBe('Should have thrown an error')
	})
})

import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	jest,
	spyOn,
	type Mock,
} from 'bun:test'
import { Client } from './client'

describe('Client', () => {
	let client: Client

	describe('using xoxb/xoxp token', () => {
		beforeEach(() => {
			client = new Client('xoxb-test')
		})
	})

	describe('using xoxd token', () => {
		let fetchSpy: Mock<typeof fetch>

		beforeAll(() => {
			fetchSpy = spyOn(globalThis, 'fetch')
		})

		beforeEach(() => {
			client = new Client('xoxd-test')
		})

		afterAll(() => {
			jest.restoreAllMocks()
		})

		it('fetches xoxc correctly', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(
					'sessionStorage.incomingConfig = JSON.stringify({"teams":{"T1234":{"id":"T1234","token":"xoxc-test"}}});',
				),
			)

			const token = await client.token

			expect(token).toEqual({ cookie: 'd=xoxd-test', token: 'xoxc-test' })
			expect(fetchSpy).toBeCalledTimes(1)
			const [input, init] = fetchSpy.mock.lastCall!
			expect(input instanceof URL || typeof input === 'string').toBeTrue()
			const url = new URL(input as string | URL)
			expect(url.origin).toBe('https://app.slack.com')
			expect(url.pathname).toBe('/auth')
			expect(url.searchParams.get('iframe')).toBeTruthy()
			expect(url.searchParams.get('app')).toBe('client')
			expect(init).toBeDefined()
			expect(init!.headers).toBeDefined()
			const headers = new Headers(init!.headers!)
			expect(headers.get('cookie')).toBe('d=xoxd-test')
		})

		it('throws on multiple teams', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(
					'sessionStorage.incomingConfig = JSON.stringify({"teams":{"T1234":{"id":"T1234","token":"xoxc-test"},"T5678":{"id":"T5678","token":"xoxc-1234"}}});',
				),
			)

			expect(client.token).rejects.toThrow(
				'The provided token is signed in to multiple Slack workspaces',
			)
		})

		it('finds team from multiple by id', async () => {
			client = new Client('xoxd-test', { team: 'T1234' })

			fetchSpy.mockResolvedValueOnce(
				new Response(
					'sessionStorage.incomingConfig = JSON.stringify({"teams":{"T1234":{"id":"T1234","token":"xoxc-test"},"T5678":{"id":"T5678","token":"xoxc-1234"}}});',
				),
			)

			expect(client.token).toBeObject()
		})

		it('rejects unknown team id', async () => {
			client = new Client('xoxd-test', { team: 'TUNKN' })

			fetchSpy.mockResolvedValueOnce(
				new Response(
					'sessionStorage.incomingConfig = JSON.stringify({"teams":{"T1234":{"id":"T1234","token":"xoxc-test"},"T5678":{"id":"T5678","token":"xoxc-1234"}}});',
				),
			)

			expect(client.token).rejects.toThrow('The specified team ID is not found')
		})
	})
})

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

import { Client } from './client'

describe('Client', () => {
	let client: Client

	let fetchSpy: Mock<typeof fetch>

	beforeAll(() => {
		fetchSpy = spyOn(globalThis, 'fetch')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('rejects invalid string tokens', () => {
		expect(() => new Client('invalid-token')).toThrow()
	})

	it('rejects invalid object tokens', () => {
		expect(() => new Client({ token: 'xoxc-1234', cookie: 'invalid-token' })).toThrow()
		expect(() => new Client({ token: 'invalid-token', cookie: 'xoxd-1234' })).toThrow()
		expect(() => new Client({ token: 'xoxc-1234', cookie: 'xoxc-1234' })).toThrow()
		expect(() => new Client({ token: 'xoxd-1234', cookie: 'xoxd-1234' })).toThrow()
	})

	it('can override with string token', async () => {
		fetchSpy.mockResolvedValueOnce(
			new Response('{"ok":true}', {
				headers: { 'Content-Type': 'application/json' },
			}),
		)

		const client = new Client('xoxb-1234')

		await client.request('method.name', { token: 'xoxb-5678' })

		expect(fetchSpy).toBeCalledTimes(1)
		const [, init] = fetchSpy.mock.lastCall!
		expect(init!.headers).toBeDefined()
		const headers = new Headers(init!.headers!)
		expect(headers.get('Authorization')).toBe(`Bearer xoxb-5678`)
	})

	it('can override with object token', async () => {
		fetchSpy.mockResolvedValueOnce(
			new Response('{"ok":true}', {
				headers: { 'Content-Type': 'application/json' },
			}),
		)

		const client = new Client('xoxb-1234')

		await client.request('method.name', { token: { token: 'xoxc-1234', cookie: 'xoxd-1234' } })

		const [, init] = fetchSpy.mock.lastCall!
		const headers = new Headers(init!.headers!)
		expect(headers.get('Authorization')).toBe(`Bearer xoxc-1234`)
		expect(headers.get('Cookie')).toBe('d=xoxd-1234')
	})

	it('rejects invalid override tokens', async () => {
		const client = new Client('xoxb-1234')

		expect(client.request('method.name', { token: 'invalid-token' })).rejects.toThrow(
			'String tokens can only start with xoxb- or xoxp-',
		)
		expect(client.request('method.name', { token: 'xoxd-token' })).rejects.toThrow(
			'String tokens can only start with xoxb- or xoxp-',
		)
		expect(
			client.request('method.name', { token: { cookie: 'xoxd-token', token: 'invalid-token' } }),
		).rejects.toThrow('Object tokens must be of the shape')
		expect(
			client.request('method.name', { token: { cookie: 'invalid-token', token: 'xoxc-token' } }),
		).rejects.toThrow('Object tokens must be of the shape')
	})

	describe('using xoxb/xoxp token', () => {
		beforeEach(() => {
			client = new Client('xoxb-test')
		})

		it('makes slack requests with no params', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true,"channel":"C123"}', {
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			const resp = await client.request('method.name', {})

			expect(resp).toEqual({ ok: true, channel: 'C123' })
			expect(fetchSpy).toBeCalledTimes(1)
			const [input, init] = fetchSpy.mock.lastCall!
			expect(input.toString()).toBe('https://slack.com/api/method.name')
			expect(init).toBeDefined()
			expect(init!.headers).toBeDefined()
			const headers = new Headers(init!.headers!)
			expect(headers.get('Authorization')).toBe(`Bearer xoxb-test`)
			if (init!.body) {
				expect(init!.body).toBeInstanceOf(FormData)
				const body = init!.body! as FormData
				expect(Array.from(body.keys())).toBeEmpty()
			}
		})

		it('makes slack requests with omitted params parameter', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
			)

			const resp = await client.request('method.name')

			expect(resp).toEqual({ ok: true })
		})

		it('makes slack requests with string params', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true,"channel":"C123"}', {
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			await client.request('method.name', { key: 'value' })

			expect(fetchSpy).toBeCalledTimes(1)
			const [, init] = fetchSpy.mock.lastCall!
			expect(init?.body).toBeInstanceOf(FormData)
			const body = init!.body! as FormData
			expect(Array.from(body.entries())).toEqual([['key', 'value']])
		})

		it('makes slack requests with string and json params', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true,"channel":"C123"}', {
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			await client.request('method.name', {
				channel: 'C123',
				blocks: [{ type: 'section', text: { type: 'plain_text', text: 'Hello World' } }],
			})

			expect(fetchSpy).toBeCalledTimes(1)
			const [, init] = fetchSpy.mock.lastCall!
			expect(init?.body).toBeInstanceOf(FormData)
			const body = init!.body! as FormData
			expect(Array.from(body.entries())).toHaveLength(2)
			expect(body.get('channel')).toBe('C123')
			expect(body.get('blocks')).toBeString()
			expect(JSON.parse(body.get('blocks') as string)).toEqual([
				{ type: 'section', text: { type: 'plain_text', text: 'Hello World' } },
			])
		})

		it('throws APIError on non-200 response', async () => {
			fetchSpy.mockResolvedValueOnce(new Response('Internal server error', { status: 500 }))

			const promise = client.request('method.name', {})

			expect(promise).rejects.toThrow('Received 500 status code for method.name')
			expect(promise).rejects.toMatchObject({ error: 'slack_ts_unknown_error' })
		})

		it('throws APIError on non-200 response with json body', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":false,"error":"internal_server_error"}', {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			const promise = client.request('method.name', {})

			expect(promise).rejects.toMatchObject({
				response: { ok: false, error: 'internal_server_error' },
			})
		})

		it('throws APIError on 200 response with ok: false', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":false,"error":"internal_server_error"}', {
					headers: { 'Content-Type': 'application/json' },
				}),
			)

			const promise = client.request('method.name', {})

			expect(promise).rejects.toThrow('Error for method.name')
			expect(promise).rejects.toMatchObject({
				response: { ok: false, error: 'internal_server_error' },
			})
		})
	})

	describe('using xoxd token', () => {
		beforeEach(() => {
			client = new Client('xoxd-test')
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

		it('makes request correctly', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(
					'sessionStorage.incomingConfig = JSON.stringify({"teams":{"T1234":{"id":"T1234","token":"xoxc-test"}}});',
				),
			)
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
			)

			await client.request('method.name', {})

			expect(fetchSpy).toBeCalledTimes(2)
			const [, init] = fetchSpy.mock.lastCall!
			expect(init?.headers).toBeDefined()
			const headers = new Headers(init!.headers!)
			expect(headers.get('cookie')).toBe('d=xoxd-test')
			expect(headers.get('authorization')).toBe('Bearer xoxc-test')
		})

		it('throws on non-200 /auth response', async () => {
			fetchSpy.mockResolvedValueOnce(new Response('Not found', { status: 404 }))

			expect(client.token).rejects.toThrow('Failed to fetch xoxc token')
		})

		it('throws on incorrectly formatted /auth response', async () => {
			fetchSpy.mockResolvedValueOnce(new Response('success'))

			expect(client.token).rejects.toThrow('Failed to fetch xoxc token')
		})

		it('throws on incorrectly formatted /auth json data', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('sessionStorage.incomingConfig = JSON.stringify({});'),
			)

			expect(client.token).rejects.toThrow('Failed to fetch xoxc token')
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

	describe('using object token', () => {
		beforeEach(() => {
			client = new Client({ cookie: 'xoxd-1234', token: 'xoxc-1234' })
		})

		it('sends credentials correctly', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
			)

			await client.request('method.name', {})

			expect(fetchSpy).toBeCalledTimes(1)
			const [, init] = fetchSpy.mock.lastCall!
			expect(init?.headers).toBeDefined()
			const headers = new Headers(init!.headers!)
			expect(headers.get('cookie')).toBe('d=xoxd-1234')
			expect(headers.get('authorization')).toBe('Bearer xoxc-1234')
		})

		it('quotes xoxd tokens', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
			)

			client = new Client({ cookie: 'xoxd-123=', token: 'xoxc-1234' })

			await client.request('method.name', {})
			const [, init] = fetchSpy.mock.lastCall!
			const headers = new Headers(init!.headers!)
			expect(headers.get('cookie')).toBe('d=xoxd-123%3D')
		})

		it('detects already quoted xoxd tokens', async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
			)

			client = new Client({ cookie: 'xoxd-123%3D', token: 'xoxc-1234' })

			await client.request('method.name', {})
			const [, init] = fetchSpy.mock.lastCall!
			const headers = new Headers(init!.headers!)
			expect(headers.get('cookie')).toBe('d=xoxd-123%3D')
		})
	})
})

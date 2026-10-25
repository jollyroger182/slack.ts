import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { createMocks, type MockRequest, type MockResponse } from 'node-mocks-http'

import { ContentType } from '../tests/fixtures.test'
import { calculateSignature } from '../utils/http'
import { HTTPReceiver } from './http'

const PORT = 14814
const SIGNING_SECRET = 'secret1234'

describe('HTTPReceiver', () => {
	let receiver: HTTPReceiver
	let timestamp: number
	let req: MockRequest<IncomingMessage>
	let res: MockResponse<ServerResponse>

	beforeEach(() => {
		timestamp = Math.floor(Date.now() / 1000)
		receiver = new HTTPReceiver({ signingSecret: SIGNING_SECRET, port: PORT })
		;({ req, res } = createMocks({
			method: 'POST',
			path: '/slack/events',
			headers: { 'x-slack-request-timestamp': timestamp.toString() },
		}))
	})

	const handleRequest = (body: string, contentType?: keyof typeof ContentType) => {
		req.headers['x-slack-signature'] = calculateSignature(body, timestamp, SIGNING_SECRET)
		if (contentType) req.headers['content-type'] = ContentType[contentType]

		const promise = receiver._handleRequest(req, res)

		req.send(body)

		return promise
	}

	it('handles url verification requests', async () => {
		await handleRequest(JSON.stringify({ type: 'url_verification', challenge: '1234abcd' }), 'json')

		expect(res.statusCode).toBe(200)
		expect(res._getData()).toBe('1234abcd')
	})

	it('handles events', async () => {
		let event: any
		receiver.once('event', (e) => (event = e))

		await handleRequest(JSON.stringify({ type: 'event_callback', key: 'value' }), 'json')

		expect(event).toEqual({ type: 'event_callback', key: 'value' })
	})

	it('returns 404 on other paths', async () => {
		req._setURL('/')

		await receiver._handleRequest(req, res)

		expect(res.statusCode).toBe(404)
	})

	it('rejects missing timestamp', async () => {
		delete req.headers['x-slack-request-timestamp']

		await handleRequest('{}', 'json')

		expect(res.statusCode).toBe(401)
	})

	it('rejects missing signature', async () => {
		await receiver._handleRequest(req, res)

		expect(res.statusCode).toBe(401)
	})

	it('rejects large bodies', async () => {
		await handleRequest(
			JSON.stringify({ type: 'url_verification', challenge: 'a'.repeat(1_000_000) }),
			'form',
		)

		expect(res.statusCode).toBe(400)
	})

	it('rejects unknown payloads', async () => {
		await handleRequest(JSON.stringify({ type: 'does_not_exist' }), 'form')

		expect(res.statusCode).toBe(400)
	})

	describe('running server', () => {
		beforeEach(async () => {
			await receiver.start()
		})

		afterEach(async () => {
			await receiver.stop()
		})

		const sendRequest = (
			body: string,
			contentType?: keyof typeof ContentType,
			options?: RequestInit,
		) => {
			const signature = calculateSignature(body, timestamp, SIGNING_SECRET)

			const headers: Record<string, string> = {
				'x-slack-request-timestamp': timestamp.toString(),
				'x-slack-signature': signature,
			}
			if (contentType) headers['content-type'] = ContentType[contentType]

			return fetch(`http://localhost:${PORT}/slack/events`, {
				method: 'POST',
				body,
				...options,
				headers: {
					...headers,
					...options?.headers,
				},
			})
		}

		it('responds to requests', async () => {
			const resp = await sendRequest('{"type":"url_verification","challenge":"1234abcd"}', 'json')

			expect(resp.status).toBe(200)

			const text = await resp.text()

			expect(text).toBe('1234abcd')
		})

		it('responds gracefully and logs on error', async () => {
			const errorSpy = spyOn(console, 'error').mockImplementationOnce(() => {})

			const resp = await sendRequest('{"type":"url_verification","challenge":"1234abcd"}', 'json', {
				headers: { 'x-slack-signature': 'invalid' },
			})

			expect(resp.status).toBe(500)

			expect(errorSpy).toBeCalledTimes(1)
			const args = errorSpy.mock.lastCall!
			expect(args[0]).toBe('Error handling HTTP request')
			expect(args[1]).toBeInstanceOf(Error)
			expect(args[1]).toMatchObject({ message: 'Slack signature length mismatch' })

			errorSpy.mockRestore()
		})
	})
})

import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	jest,
	type Mock,
	mock,
	spyOn,
} from 'bun:test'

import { ContentType } from '../tests/fixtures.test'
import { calculateSignature } from '../utils/http'
import { FetchReceiver } from './fetch'

const XOXB_TOKEN = 'xoxb-1234abcdefg'
const SIGNING_SECRET = '1234abcd'

describe('FetchReceiver', () => {
	let receiver: FetchReceiver
	let waitUntil: Mock<(promise: Promise<unknown>) => void>

	beforeAll(() => {
		waitUntil = mock(() => {})
	})

	beforeEach(() => {
		jest.clearAllMocks()
		receiver = new FetchReceiver({ signingSecret: SIGNING_SECRET, waitUntil })
	})

	function createRequest(
		body: string,
		contentType?: keyof typeof ContentType,
		headers: Record<string, string> = {},
	) {
		const timestamp = Math.floor(Date.now() / 1000)

		headers = {
			'x-slack-signature': calculateSignature(body, timestamp, SIGNING_SECRET),
			'x-slack-request-timestamp': timestamp.toString(),
			...headers,
		}

		if (contentType) headers['content-type'] = ContentType[contentType]

		return new Request('http://localhost/slack/events', {
			method: 'POST',
			headers,
			body,
		})
	}

	it("start and stop don't throw", () => {
		receiver.start()
		receiver.stop()
	})

	it('handles url_verification', async () => {
		const request = createRequest(
			JSON.stringify({ type: 'url_verification', challenge: 'abababa' }),
			'json',
		)

		const response = await receiver.fetch(request)
		const data = await response.text()

		expect(response).toBeInstanceOf(Response)
		expect(response.status).toBe(200)
		expect(data).toBe('abababa')
	})

	it('handles event_callback requests', async () => {
		let listener = mock()
		receiver.once('event', listener)

		const request = createRequest(JSON.stringify({ type: 'event_callback', key: 'value' }), 'json')

		const response = await receiver.fetch(request)

		expect(response.status).toBe(200)
		expect(listener).toBeCalledTimes(1)
		expect(listener).toHaveBeenCalledWith({ type: 'event_callback', key: 'value' })
	})

	it('handles block_actions requests', async () => {
		let listener = mock()
		receiver.once('actions', listener)

		const payload = { type: 'block_actions', key: 'value' }

		const request = createRequest(`payload=${encodeURIComponent(JSON.stringify(payload))}`, 'form')

		const response = await receiver.fetch(request)

		expect(response.status).toBe(200)
		expect(listener).toBeCalledTimes(1)
		expect(listener).toHaveBeenCalledWith(payload)
	})

	it('handles unknown payloads', async () => {
		const request = createRequest(JSON.stringify({ type: 'unknown_thing', key: 'value' }), 'json')

		const response = await receiver.fetch(request)

		expect(response.status).toBeGreaterThanOrEqual(400)
	})

	it('returns error response gracefully on parsing error', async () => {
		const request = createRequest('{"', 'json')

		const response = await receiver.fetch(request)

		expect(response.status).toBeGreaterThanOrEqual(500)
	})
})

import { beforeEach, describe, expect, it } from 'bun:test'
import { createHmac } from 'crypto'
import { App } from '../../../src/client'
import { HttpFetchReceiver } from '../../../src/receivers/fetch'
import { MESSAGE_EVENT } from '../../fixtures'

const SIGNING_SECRET = '9973309e5bddf914572f508d4c661a61'

function createSignedRequest(
	body: string,
	signingSecret: string = SIGNING_SECRET,
): { method: 'POST'; headers: Headers; body: string } {
	const timestamp = Math.floor(Date.now() / 1000).toString()
	const baseString = `v0:${timestamp}:${body}`
	const signature = 'v0=' + createHmac('sha256', signingSecret).update(baseString).digest('hex')

	const headers = new Headers({
		'x-slack-request-timestamp': timestamp,
		'x-slack-signature': signature,
		'content-type': 'application/json',
	})

	return { method: 'POST', headers, body }
}

describe('HttpFetchReceiver', () => {
	let app: App
	let receiver: HttpFetchReceiver

	beforeEach(() => {
		app = new App()
		receiver = receiver = new HttpFetchReceiver({ signingSecret: SIGNING_SECRET, client: app })
	})

	it('creates receiver with signing secret', () => {
		expect(receiver).toBeDefined()
	})

	it('responds to url_verification challenge', async () => {
		const body = JSON.stringify({
			type: 'url_verification',
			challenge: 'test-challenge-123',
		})

		const request = new Request('http://localhost/', createSignedRequest(body))

		const response = await receiver.fetch(request)
		expect(response.status).toBe(200)

		const responseBody = JSON.parse(await response.text())
		expect(responseBody.challenge).toBe('test-challenge-123')
	})

	it('handles event payloads', async () => {
		const waitingPromises: Promise<unknown>[] = []
		const waitUntil = (promise: Promise<unknown>) => {
			waitingPromises.push(promise)
		}

		app = new App({ receiver: { type: 'fetch', signingSecret: SIGNING_SECRET, waitUntil } })
		receiver = app.receiver as HttpFetchReceiver

		let eventReceived = false
		receiver.on('event', () => {
			eventReceived = true
		})

		const body = JSON.stringify(MESSAGE_EVENT)

		const request = new Request('http://localhost/', createSignedRequest(body))
		await receiver.fetch(request)
		await Promise.all(waitingPromises)

		expect(eventReceived).toBeTrue()
	})

	it('rejects invalid signature', async () => {
		const body = JSON.stringify({ type: 'event_callback' })

		const request = new Request('http://localhost/', createSignedRequest(body, 'xyz'))

		const response = await receiver.fetch(request)
		expect(response.status).toBeGreaterThanOrEqual(400)
	})

	it('rejects missing headers', async () => {
		const body = JSON.stringify({ type: 'event_callback' })
		const headers = new Headers({
			'content-type': 'application/json',
		})

		const request = new Request('http://localhost/', {
			method: 'POST',
			headers,
			body,
		})

		const response = await receiver.fetch(request)
		expect(response.status).toBeGreaterThanOrEqual(400)
	})

	it('can start and stop', async () => {
		await receiver.start()
		await receiver.stop()
	})
})

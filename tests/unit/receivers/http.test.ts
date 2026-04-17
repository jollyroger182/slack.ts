import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createHmac } from 'crypto'
import type { EventWrapper } from '../../../src/api/events'
import { App } from '../../../src/client'
import { HttpServerReceiver } from '../../../src/receivers/http'
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

describe('HttpServerReceiver', () => {
	let app: App
	let receiver: HttpServerReceiver

	beforeEach(() => {
		app = new App()
		receiver = new HttpServerReceiver({
			signingSecret: SIGNING_SECRET,
			client: app,
			port: 3001,
			path: '/test/events',
		})
	})

	afterEach(async () => {
		try {
			await receiver.stop()
		} catch (e: any) {
			if (e?.code !== 'ERR_SERVER_NOT_RUNNING') {
				throw e
			}
		}
	})

	it('creates receiver with config', () => {
		expect(receiver).toBeDefined()
	})

	it('can start and stop server', async () => {
		await receiver.start()
		await receiver.stop()
	})

	it('can receive events', async () => {
		const body = JSON.stringify(MESSAGE_EVENT)

		let eventReceived: EventWrapper | undefined
		receiver.on('event', (event) => {
			eventReceived = event
		})

		await receiver.start()

		const resp = await fetch('http://localhost:3001/test/events', createSignedRequest(body))
		expect(resp.status).toBe(200)

		await new Promise((resolve) => setTimeout(resolve, 0))
		expect(eventReceived).toBeDefined()
		expect(eventReceived).toEqual(MESSAGE_EVENT)
	})

	it('rejects incorrect paths', async () => {
		const body = JSON.stringify(MESSAGE_EVENT)

		await receiver.start()

		const resp = await fetch('http://localhost:3001/invalid/path', createSignedRequest(body))
		expect(resp.status).toBeGreaterThanOrEqual(400)
	})

	it('uses default port and path if not specified', async () => {
		const defaultReceiver = new HttpServerReceiver({
			signingSecret: SIGNING_SECRET,
			client: app,
		})
		const body = JSON.stringify(MESSAGE_EVENT)

		await defaultReceiver.start()

		try {
			const resp = await fetch('http://localhost:3000/slack/events', createSignedRequest(body))
			expect(resp.status).toBe(200)
		} catch (e) {
			await defaultReceiver.stop()
			throw e
		}
	})
})

import { beforeEach, describe, expect, it } from 'bun:test'
import { createHmac } from 'crypto'
import { App } from '../../src'
import { HttpFetchReceiver } from '../../src/receivers/fetch'

const SIGNING_SECRET = 'test-secret'

describe('HttpFetchReceiver', () => {
	let app: App
	let receiver: HttpFetchReceiver

	beforeEach(() => {
		app = new App()
		receiver = new HttpFetchReceiver({ signingSecret: SIGNING_SECRET, client: app })
	})

	describe('initialization', () => {
		it('creates receiver with signing secret and client', () => {
			expect(receiver).toBeDefined()
		})

		it('receiver is EventEmitter', () => {
			expect(receiver).toHaveProperty('on')
			expect(receiver).toHaveProperty('emit')
		})

		it('receiver has fetch method', () => {
			expect(typeof receiver.fetch).toBe('function')
		})
	})

	describe('error handling', () => {
		it('returns 400 for missing timestamp header', async () => {
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Signature': 'v0=invalid',
				},
				body: '{}',
			})

			const response = await receiver.fetch(request)
			expect(response.status).toBe(400)
		})

		it('returns 400 for missing signature header', async () => {
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': Math.floor(Date.now() / 1000).toString(),
				},
				body: '{}',
			})

			const response = await receiver.fetch(request)
			expect(response.status).toBe(400)
		})

		it('returns 403 for invalid signature with valid headers', async () => {
			const timestamp = Math.floor(Date.now() / 1000)
			const body = '{}'
			const baseString = `v0:${timestamp}:${body}`
			const badSignature = 'v0=invalidsignaturevalue'

			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': timestamp.toString(),
					'X-Slack-Signature': badSignature,
				},
				body,
			})

			const response = await receiver.fetch(request)
			expect(response.status).toBe(403)
		})
	})

	describe('start method', () => {
		it('start method returns successfully', async () => {
			const result = await receiver.start()
			expect(result).toBeUndefined()
		})
	})
})

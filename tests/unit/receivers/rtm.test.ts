import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	spyOn,
	type Mock,
} from 'bun:test'
import { App } from '../../../src/client'
import { RTMReceiver } from '../../../src/receivers/rtm'

describe('RTMReceiver', () => {
	let app: App
	let receiver: RTMReceiver

	beforeEach(() => {
		app = new App({ token: { cookie: 'xoxd-test-cookie', token: 'xoxc-test-token' } })
		receiver = new RTMReceiver({
			client: app,
			token: { cookie: 'xoxd-test-cookie', token: 'xoxc-test-token' },
		})
	})

	it('creates rtm receiver with browser token', () => {
		expect(receiver).toBeDefined()
	})

	it('has stop method that is callable', async () => {
		await receiver.stop()
	})

	describe('mocking socket connection', () => {
		let server: Bun.Server<never>

		let requestSpy: Mock<typeof app.request>
		let websocket: Bun.ServerWebSocket | undefined

		const mockWebSocketUrl = () =>
			requestSpy.mockResolvedValueOnce({
				ok: true,
				primary_websocket_url: `ws://localhost:${server.port}`,
			})

		beforeAll(async () => {
			server = Bun.serve({
				fetch(req, server) {
					if (server.upgrade(req)) return
					return Response.json({ ok: false, error: 'unknown_error' }, { status: 500 })
				},
				websocket: {
					open(ws) {
						websocket = ws
					},
					message() {},
					close() {
						websocket = undefined
					},
				},
				port: 0,
			})
		})

		afterAll(() => {
			server.stop(true)
		})

		beforeEach(async () => {
			requestSpy = spyOn(app, 'request')
			mockWebSocketUrl()
			await receiver.start()
		})

		afterEach(async () => {
			await receiver.stop()
			requestSpy.mockReset()
		})

		it('establishes a WebSocket connection', async () => {
			expect(requestSpy).toHaveBeenCalledTimes(1)
			expect(websocket).toBeDefined()
		})

		it('reconnects', async () => {
			expect(requestSpy).toHaveBeenCalledTimes(1)

			mockWebSocketUrl()
			websocket?.close()
			await new Promise((resolve) => setTimeout(resolve, 10))

			expect(requestSpy).toHaveBeenCalledTimes(2)
			expect(websocket).toBeDefined()
		})

		it('renegotiates a fresh url when a reconnect url is refused', async () => {
			websocket!.send(JSON.stringify({ type: 'reconnect_url', url: 'ws://localhost:1/expired' }))
			await new Promise((resolve) => setTimeout(resolve, 10))

			mockWebSocketUrl()
			websocket?.close()
			await new Promise((resolve) => setTimeout(resolve, 50))

			// the stale reconnect url must not be retried forever
			expect(requestSpy).toHaveBeenCalledTimes(2)
			expect(websocket).toBeDefined()
		})

		it('does not reconnect after stop', async () => {
			expect(requestSpy).toHaveBeenCalledTimes(1)

			await receiver.stop()
			await new Promise((resolve) => setTimeout(resolve, 50))

			expect(requestSpy).toHaveBeenCalledTimes(1)
			expect(websocket).toBeUndefined()
		})
	})
})

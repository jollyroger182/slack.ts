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
			maxReconnectDelay: 10,
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

	describe('connection failures', () => {
		let stalled: Bun.Server<never>
		let requestSpy: Mock<typeof app.request>

		beforeAll(() => {
			// accepts the tcp connection then never completes the upgrade, so the client
			// sees neither open nor error
			stalled = Bun.serve({
				fetch: () => new Promise<Response>(() => {}),
				port: 0,
			})
		})

		afterAll(() => {
			stalled.stop(true)
		})

		afterEach(async () => {
			await receiver.stop()
			requestSpy?.mockReset()
		})

		it('gives up on a stalled handshake rather than waiting forever', async () => {
			receiver = new RTMReceiver({
				client: app,
				token: { cookie: 'xoxd-test-cookie', token: 'xoxc-test-token' },
				connectTimeout: 40,
				maxReconnectDelay: 10,
			})
			requestSpy = spyOn(app, 'request').mockResolvedValue({
				ok: true,
				primary_websocket_url: `ws://localhost:${stalled.port}`,
			})

			// start() only settles once a connection opens, so it stays floating here
			void receiver.start()
			await new Promise((resolve) => setTimeout(resolve, 220))

			// each attempt times out and the next one renegotiates, so a stalled handshake
			// keeps the receiver moving instead of silently parking it
			expect(requestSpy.mock.calls.length).toBeGreaterThan(1)
		})

		it('spaces out repeated failures', async () => {
			receiver = new RTMReceiver({
				client: app,
				token: { cookie: 'xoxd-test-cookie', token: 'xoxc-test-token' },
				maxReconnectDelay: 60,
			})

			const attemptedAt: number[] = []
			requestSpy = spyOn(app, 'request').mockImplementation(async () => {
				attemptedAt.push(Date.now())
				// nothing listens on port 1, so the attempt fails promptly
				return { ok: true, primary_websocket_url: 'ws://localhost:1' } as never
			})

			void receiver.start()
			await new Promise((resolve) => setTimeout(resolve, 300))

			expect(attemptedAt.length).toBeGreaterThan(1)
			const gaps = attemptedAt.slice(1).map((at, i) => at - attemptedAt[i]!)
			for (const gap of gaps) {
				expect(gap).toBeGreaterThanOrEqual(40)
			}
		})
	})
})

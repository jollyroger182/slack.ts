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
import type { EventWrapper } from '../../../src/api/events'
import type { AppsConnectionsOpenResponse } from '../../../src/api/web/apps'
import { App } from '../../../src/client'
import { SocketEventsReceiver } from '../../../src/receivers/socket'

const EVENT_PAYLOAD: EventWrapper = {
	type: 'event_callback',
	token: 'test',
	team_id: 'T123',
	api_app_id: 'A123',
	event: {
		type: 'message',
		text: 'hello',
		channel: 'C123',
		user: 'U123',
		ts: '123456.789',
		event_ts: '123456.789',
		team: 'T123',
	},
	event_id: 'Ev123',
	event_time: 1234567890,
	event_context: 'ctx123',
	authorizations: [],
	is_ext_shared_channel: false,
	context_team_id: 'T123',
	context_enterprise_id: null,
}

describe('SocketEventsReceiver', () => {
	let app: App
	let receiver: SocketEventsReceiver

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		receiver = new SocketEventsReceiver({
			appToken: 'xapp-test-token',
			client: app,
		})
	})

	it('creates socket receiver with app token', () => {
		expect(receiver).toBeDefined()
	})

	it('has start and stop methods', () => {
		expect(receiver.start).toBeFunction()
		expect(receiver.stop).toBeFunction()
	})

	it('implements EventsReceiver interface', () => {
		expect(receiver.on).toBeFunction()
		expect(receiver.emit).toBeFunction()
	})

	it('has stop method that is callable', async () => {
		await receiver.stop()
	})

	describe('mocking socket connection', () => {
		let server: Bun.Server<never>

		let requestSpy: Mock<typeof app.request>
		let websocket: Bun.ServerWebSocket | undefined
		let messagesReceived: string[]

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
					message(ws, message) {
						if (typeof message === 'string') {
							messagesReceived.push(message)
						}
					},
					close() {
						websocket = undefined
					},
				},
				port: 0,
			})
		})

		afterAll(async () => {
			await server.stop(true)
		})

		beforeEach(async () => {
			requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
				ok: true,
				url: `ws://localhost:${server.port}`,
			} satisfies AppsConnectionsOpenResponse & {
				ok: true
			})
			messagesReceived = []
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

		it('can receive and responds to events', async () => {
			let eventReceived: EventWrapper | undefined
			receiver.on('event', (event) => {
				eventReceived = event
			})

			const wrapped = {
				type: 'events_api',
				envelope_id: 'event001',
				payload: EVENT_PAYLOAD,
				accepts_response_payload: false,
			}
			const message = JSON.stringify(wrapped)

			expect(websocket).toBeDefined()
			websocket!.send(message)

			await new Promise((resolve) => setTimeout(resolve, 10))

			expect(eventReceived).toEqual(EVENT_PAYLOAD)

			expect(messagesReceived).toHaveLength(1)
			const response = JSON.parse(messagesReceived[0]!)
			expect(response).toMatchObject({ envelope_id: 'event001' })
		})
	})
})

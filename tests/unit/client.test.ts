import { beforeEach, describe, expect, it } from 'bun:test'
import {
	App,
	DummyReceiver,
	HttpFetchReceiver,
	HttpServerReceiver,
	SocketEventsReceiver,
} from 'slack.ts'

describe('App client', () => {
	let app: App

	beforeEach(() => {
		app = new App()
	})

	it('creates app with default dummy receiver', () => {
		expect(app.receiver).toBeInstanceOf(DummyReceiver)
	})

	it('creates app with token', () => {
		const appWithToken = new App({ token: 'xoxb-test-token' })
		expect(appWithToken).toBeDefined()
	})

	it('creates app with dummy receiver', () => {
		const appWithDummy = new App({ receiver: { type: 'dummy' } })
		expect(appWithDummy.receiver).toBeInstanceOf(DummyReceiver)
	})

	it('creates app with socket receiver', () => {
		const appWithSocket = new App({ receiver: { type: 'socket', appToken: 'xoxa-123' } })
		expect(appWithSocket.receiver).toBeInstanceOf(SocketEventsReceiver)
	})

	it('creates app with fetch receiver', () => {
		const appWithFetch = new App({ receiver: { type: 'fetch', signingSecret: 'abcdef' } })
		expect(appWithFetch.receiver).toBeInstanceOf(HttpFetchReceiver)
	})

	it('creates app with http receiver', () => {
		const appWithHTTP = new App({ receiver: { type: 'http', signingSecret: 'abcdef' } })
		expect(appWithHTTP.receiver).toBeInstanceOf(HttpServerReceiver)
	})

	it('provides channel factory method', () => {
		const channel = app.channel('C123456')
		expect(channel).toBeDefined()
		expect(channel.id).toBe('C123456')
	})

	it('provides user factory method', () => {
		const user = app.user('U123456')
		expect(user).toBeDefined()
		expect(user.id).toBe('U123456')
	})

	it('provides channel list method', () => {
		expect(app.channels).toBeFunction()
	})

	it('provides user list method', () => {
		expect(app.users).toBeFunction()
	})

	it('provides request method', () => {
		expect(app.request).toBeFunction()
	})

	it('provides wait helper with action method', () => {
		expect(app.wait).toBeDefined()
		expect(app.wait.timeout).toBeFunction()
		expect(app.wait.action).toBeFunction()
	})

	it('emits events on app', async () => {
		let eventFired = false
		app.on('event', () => {
			eventFired = true
		})

		await app.receiver.emit('event', {
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
		})

		expect(eventFired).toBeTrue()
	})

	it('has start and stop lifecycle methods', async () => {
		expect(app.start).toBeFunction()
		expect(app.stop).toBeFunction()
	})

	it('can create multiple apps independently', () => {
		const app1 = new App({ token: 'token1' })
		const app2 = new App({ token: 'token2' })

		expect(app1).not.toBe(app2)
		expect(app1.receiver).not.toBe(app2.receiver)
	})
})

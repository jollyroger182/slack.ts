import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import {
	Action,
	App,
	button,
	Channel,
	DummyReceiver,
	HttpFetchReceiver,
	HttpServerReceiver,
	SlackWebAPIPlatformError,
	SocketEventsReceiver,
	User,
	type ChannelInstance,
	type SlackAPIResponse,
	type UserInstance,
} from 'slack.ts'
import type { IM, PublicChannel } from '../../src/api/types/conversation'
import { blockActions, MESSAGE_EVENT, PUBLIC_CHANNEL_DATA, USER_DATA } from '../fixtures'
import type { BlockActions, ButtonAction } from '../../src/api/interactive/block_actions'
import type { EventWrapper } from '../../src/api/events'

describe('App client', () => {
	let app: App
	let originalFetch: typeof fetch

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		originalFetch = globalThis.fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
	})

	it('creates app with default dummy receiver', () => {
		expect(app.receiver).toBeInstanceOf(DummyReceiver)
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

	it('can start and stop receiver', async () => {
		const startSpy = spyOn(app.receiver, 'start')
		const stopSpy = spyOn(app.receiver, 'stop')

		await app.start()
		expect(startSpy).toHaveBeenCalledTimes(1)

		await app.stop()
		expect(stopSpy).toHaveBeenCalledTimes(1)
	})

	it('can wait for actions', async () => {
		const btn = button('press me').id('test_button')
		const actionPayload = {
			type: 'button',
			block_id: '12345',
			action_id: 'test_button',
			action_ts: '123456.789',
			text: { type: 'plain_text', text: 'press me' },
		} as const
		const payload: BlockActions = blockActions(actionPayload)
		setTimeout(() => app.receiver.emit('block_actions', payload), 0)

		const action = await app.wait.timeout(10).action(btn)
		expect(action).toBeInstanceOf(Action)
		expect(action.raw).toEqual(actionPayload)
		expect(action.action_id).toBe('test_button')
	})

	it('wait can time out', () => {
		const btn = button('press me').id('test_button')
		const time = Date.now()
		expect(app.wait.timeout(10).action(btn)).rejects.toThrow('Timed out waiting for action')
		expect(Date.now() - time).toBeGreaterThanOrEqual(10)
	})

	it('wait with timeout 0 disables timeout', async () => {
		const btn = button('press me').id('test_button')
		const actionPayload = {
			type: 'button',
			block_id: '12345',
			action_id: 'test_button',
			action_ts: '123456.789',
			text: { type: 'plain_text', text: 'press me' },
		} as const
		const payload: BlockActions = blockActions(actionPayload)
		setTimeout(() => app.receiver.emit('block_actions', payload), 10)

		const action = await app.wait.timeout(0).action(btn)
		expect(action).toBeInstanceOf(Action)
	})

	it('provides channel factory method', () => {
		const channel = app.channel('C123456')
		expect(channel.id).toBe('C123456')
	})

	it('provides user factory method', () => {
		const user = app.user('U123456')
		expect(user.id).toBe('U123456')
	})

	it('iterates over channels', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channels: [PUBLIC_CHANNEL_DATA],
			has_more: false,
		} satisfies SlackAPIResponse<'conversations.list'>)

		const channels: ChannelInstance[] = []
		for await (const channel of app.channels()) {
			channels.push(channel)
		}

		expect(requestSpy).toHaveBeenCalledWith('conversations.list', {
			types: 'public_channel,private_channel,mpim,im',
		})
		expect(channels[0]).toBeInstanceOf(Channel)
		expect(channels[0]?.name).toBe(PUBLIC_CHANNEL_DATA.name)
	})

	it('iterates over certain types of channels', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channels: [PUBLIC_CHANNEL_DATA],
			has_more: false,
		} satisfies SlackAPIResponse<'conversations.list'>)

		const channels: ChannelInstance<PublicChannel | IM>[] = []
		for await (const channel of app.channels('public_channel', 'im')) {
			channels.push(channel)
		}

		expect(requestSpy).toHaveBeenCalledWith('conversations.list', {
			types: 'public_channel,im',
		})
	})

	it('iterates over users', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			cache_ts: 1234567890,
			members: [USER_DATA],
			has_more: false,
		} satisfies SlackAPIResponse<'users.list'>)

		const users: UserInstance[] = []
		for await (const user of app.users()) {
			users.push(user)
		}

		expect(requestSpy).toHaveBeenCalledWith('users.list', {})
		expect(users[0]).toBeInstanceOf(User)
		expect(users[0]?.name).toBe(USER_DATA.name)
	})

	it('can make web API requests', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true } satisfies SlackAPIResponse<'conversations.leave'>), {
				headers: { 'Content-Type': 'application/json' },
			}),
		)

		const resp = await app.request('conversations.leave', { channel: 'C123' })
		expect(resp).toEqual({ ok: true })
		expect(fetchSpy).toHaveBeenCalledTimes(1)
		const [url, options] = fetchSpy.mock.calls[0]!
		expect(url).toEqual('https://slack.com/api/conversations.leave')
		expect(options?.method).toBe('POST')
		expect(options?.body).toBeInstanceOf(FormData)
		expect(Object.fromEntries((options?.body as FormData).entries())).toEqual({ channel: 'C123' })
		expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer xoxb-test-token')
	})

	it('retries requests on 429', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(new Response(null, { status: 429, headers: { 'Retry-After': '0' } }))
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ ok: true } satisfies SlackAPIResponse<'conversations.leave'>),
					{ headers: { 'Content-Type': 'application/json' } },
				),
			)

		await app.request('conversations.leave', { channel: 'C123' })
		expect(fetchSpy).toHaveBeenCalledTimes(2)
	})

	it('can make requests with cookie auth', async () => {
		const cookieApp = new App({ token: { cookie: 'xoxd-ab%2Fcd', token: 'xoxc-1234' } })
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true } satisfies SlackAPIResponse<'conversations.leave'>), {
				headers: { 'Content-Type': 'application/json' },
			}),
		)

		await cookieApp.request('conversations.leave', { channel: 'C123' })
		const [url, options] = fetchSpy.mock.calls[0]!
		const headers = new Headers(options?.headers)
		expect(headers.get('Cookie')).toBe('d=xoxd-ab%2Fcd')
		expect(headers.get('Authorization')).toBe('Bearer xoxc-1234')
	})

	it('request throws when ok is false', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: false, error: 'unknown_error' }), {
				headers: { 'Content-Type': 'application/json' },
			}),
		)

		const promise = app.request('conversations.leave', { channel: 'C123' })
		expect(promise).rejects.toThrow(SlackWebAPIPlatformError)
		expect(promise).rejects.toThrow('Fetch https://slack.com/api/conversations.leave failed')
		expect(promise).rejects.toMatchObject({ error: 'unknown_error' })
	})

	it('emits events on app', async () => {
		let eventFired: EventWrapper | undefined
		app.on('event', (event) => {
			eventFired = event
		})

		await app.receiver.emit('event', MESSAGE_EVENT)

		expect(eventFired).toEqual(MESSAGE_EVENT)
	})

	it('can create multiple apps independently', () => {
		const app1 = new App({ token: 'token1' })
		const app2 = new App({ token: 'token2' })

		expect(app1).not.toBe(app2)
		expect(app1.receiver).not.toBe(app2.receiver)
	})
})

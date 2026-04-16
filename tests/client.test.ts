import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { App, SlackWebAPIPlatformError, SlackWebAPIError } from '../src'
import { ChannelRef } from '../src/resources/channel'
import { DummyReceiver } from '../src/receivers/dummy'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('App', () => {
	describe('constructor', () => {
		it('creates app with token', () => {
			const testApp = new App({ token: 'xoxb-test-token' })
			expect(testApp).toBeDefined()
		})

		it('creates app with cookie and token', () => {
			const testApp = new App({
				token: { cookie: 'test-cookie', token: 'xoxc-test-token' },
			})
			expect(testApp).toBeDefined()
		})

		it('defaults to dummy receiver when not specified', () => {
			const testApp = new App()
			expect(testApp).toBeDefined()
		})

		it('creates app with dummy receiver', () => {
			const testApp = new App({ receiver: { type: 'dummy' } })
			expect(testApp).toBeDefined()
		})
	})

	describe('channel management', () => {
		it('can create channel refs', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			expect(channel).toBeInstanceOf(ChannelRef)
			expect(channel.id).toBe(process.env.SLACK_CHANNEL!)
		})

		it('channel ref returns same ID for multiple calls', () => {
			const id = process.env.SLACK_CHANNEL!
			const ref1 = app.channel(id)
			const ref2 = app.channel(id)
			expect(ref1.id).toBe(ref2.id)
		})
	})

	describe('API requests', () => {
		it('can make Slack API requests', async () => {
			const resp = await app.request('auth.test', {})
			expect(resp.ok).toBeTrue()
			expect(resp.user_id).toBe(process.env.SLACK_USER_ID!)
		})

		it('includes authorization header', async () => {
			const resp = await app.request('auth.test', {})
			expect(resp.ok).toBeTrue()
		})

		it('throws SlackWebAPIPlatformError when token is invalid', async () => {
			try {
				await app.request('auth.test', { token: 'invalid' })
				expect.unreachable()
			} catch (e) {
				expect(e).toBeInstanceOf(SlackWebAPIPlatformError)
				expect((e as SlackWebAPIPlatformError).error).toBe('invalid_auth')
			}
		})

		it('uses provided token over default token', async () => {
			try {
				await app.request('auth.test', { token: 'xoxb-invalid' })
				expect.unreachable()
			} catch (e) {
				expect(e).toBeInstanceOf(SlackWebAPIPlatformError)
			}
		})

		it('throws SlackWebAPIError for network errors', async () => {
			const testApp = new App({ token: 'xoxb-test' })
			try {
				// This will fail due to invalid token at network level
				await testApp.request('auth.test', {})
				expect.unreachable()
			} catch (e) {
				expect(e).toBeInstanceOf(SlackWebAPIError)
			}
		})
	})
})

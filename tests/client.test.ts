import { beforeEach, describe, expect, it } from 'bun:test'
import { App, SlackWebAPIPlatformError } from '../src'
import { ChannelRef } from '../src/resources/channel'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('App', () => {
	it('can create channel refs', async () => {
		const channel = app.channel(process.env.SLACK_CHANNEL!)
		expect(channel).toBeInstanceOf(ChannelRef)
		expect(channel.id).toBe(process.env.SLACK_CHANNEL!)
	})
	it('can make Slack API requests', async () => {
		const resp = await app.request('auth.test', {})
		expect(resp.ok).toBeTrue()
		expect(resp.user_id).toBe(process.env.SLACK_USER_ID!)
	})
	it('throws when token is invalid', async () => {
		try {
			await app.request('auth.test', { token: 'invalid' })
			expect.unreachable()
		} catch (e) {
			expect(e).toBeInstanceOf(SlackWebAPIPlatformError)
			expect((e as SlackWebAPIPlatformError).error).toBe('invalid_auth')
		}
	})
})

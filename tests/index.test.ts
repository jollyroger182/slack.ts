import { describe, expect, it } from 'bun:test'
import { App } from '../src'

describe('slack.js', () => {
	it('works', async () => {
		const app = new App({ token: process.env.SLACK_TOKEN! })
		const channel = await app.channel(process.env.SLACK_CHANNEL!)
		expect(channel.name).toBe(process.env.SLACK_CHANNEL_NAME!)
	})
})

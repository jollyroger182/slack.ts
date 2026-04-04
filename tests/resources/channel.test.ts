import type { SectionBlock } from '@slack/types'
import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Message, MessageRef } from '../../src/resources/message'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('ChannelRef', () => {
	it('can fetch channel details', async () => {
		const channel = await app.channel(process.env.SLACK_CHANNEL!)
		expect(channel.id).toBe(process.env.SLACK_CHANNEL!)
		expect(channel.name).toBe(process.env.SLACK_CHANNEL_NAME!)
	})
	it('can send plain messages', async () => {
		const channel = app.channel(process.env.SLACK_CHANNEL!)
		const message = await channel.send('_test plain messages_')
		expect(message).toBeInstanceOf(Message)
		expect(message.channel.id).toBe(process.env.SLACK_CHANNEL!)
		expect(message.text).toBe('_test plain messages_')
	})
	it('can send block kit messages', async () => {
		const channel = app.channel(process.env.SLACK_CHANNEL!)
		const message = await channel.send({
			text: 'fallback text',
			blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'block text' } }],
		})
		expect(message).toBeInstanceOf(Message)
		expect(message.channel.id).toBe(process.env.SLACK_CHANNEL!)
		expect(message.text).toBe('fallback text')
		expect(message.blocks).toHaveLength(1)
		expect(message.blocks![0]!.type).toBe('section')
		expect((message.blocks![0]! as SectionBlock).text?.type).toBe('mrkdwn')
		expect((message.blocks![0]! as SectionBlock).text?.text).toBe('block text')
	})
	it('can get a message reference', async () => {
		const channel = app.channel(process.env.SLACK_CHANNEL!)
		const message = await channel.send('test channel.message')
		const ref = channel.message(message.ts)
		expect(ref).toBeInstanceOf(MessageRef)
	})
})

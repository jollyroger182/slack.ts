import type { SectionBlock } from '@slack/types'
import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Message, MessageRef } from '../../src/resources/message'
import { ChannelRef } from '../../src/resources/channel'

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

	it('can be created from app.channel()', () => {
		const channel = app.channel(process.env.SLACK_CHANNEL!)
		expect(channel).toBeInstanceOf(ChannelRef)
		expect(channel.id).toBe(process.env.SLACK_CHANNEL!)
	})

	it('has correct id property', () => {
		const id = process.env.SLACK_CHANNEL!
		const channel = app.channel(id)
		expect(channel.id).toEqual(id)
	})

	describe('sending messages', () => {
		it('can send plain text messages', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('_test plain messages_')
			expect(message).toBeInstanceOf(Message)
			expect(message.channel.id).toBe(process.env.SLACK_CHANNEL!)
			expect(message.text).toBe('_test plain messages_')
		})

		it('plain text message uses markdown formatting', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('*bold* _italic_ `code`')
			expect(message).toBeTruthy()
			expect(message.text).toContain('bold')
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

		it('can send messages with multiple blocks', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send({
				text: 'fallback',
				blocks: [
					{ type: 'section', text: { type: 'mrkdwn', text: 'Section 1' } },
					{ type: 'section', text: { type: 'mrkdwn', text: 'Section 2' } },
				],
			})
			expect(message.blocks).toHaveLength(2)
		})

		it('can send messages without blocks', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('Simple message')
			expect(message).toBeTruthy()
			expect(message.text).toBe('Simple message')
		})

		it('messages contain proper channel reference', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test message')
			expect(message.channel.id).toBe(process.env.SLACK_CHANNEL!)
		})
	})

	describe('message references', () => {
		it('can get a message reference', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test channel.message')
			const ref = channel.message(message.ts)
			expect(ref).toBeInstanceOf(MessageRef)
		})

		it('message reference has correct timestamp', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test')
			const ref = channel.message(message.ts)
			expect(ref.ts).toBe(message.ts)
		})

		it('message reference has correct channel', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test')
			const ref = channel.message(message.ts)
			expect(ref.channel.id).toBe(channel.id)
		})
	})

	describe('await behavior', () => {
		it('can await channel to get full details', async () => {
			const channel = await app.channel(process.env.SLACK_CHANNEL!)
			expect(channel.id).toBe(process.env.SLACK_CHANNEL!)
			expect(channel.name).toBeDefined()
		})

		it('awaited channel has all properties', async () => {
			const channel = await app.channel(process.env.SLACK_CHANNEL!)
			expect(channel.id).toBeTruthy()
			expect(channel.name).toBeTruthy()
		})
	})
})

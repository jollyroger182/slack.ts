import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Message, MessageRef } from '../../src/resources/message'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('Message', () => {
	describe('Message properties', () => {
		it('has channel property', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test message')

			expect(message).toHaveProperty('channel')
			expect(message.channel).toBeDefined()
		})

		it('has ts (timestamp) property', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test message')

			expect(message).toHaveProperty('ts')
			expect(message.ts).toBeTruthy()
		})

		it('message text can be accessed via proxy', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test message with text')

			// Message proxies to the raw message data
			expect(message.text).toBe('test message with text')
		})

		it('message created with blocks has blocks', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send({
				text: 'fallback',
				blocks: [{ type: 'section', text: { type: 'plain_text', text: 'test' } }],
			})

			// Message proxies to the raw message data
			expect(message.blocks).toBeDefined()
		})
	})

	describe('MessageRef', () => {
		it('can be created from channel.message()', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test')
			const ref = channel.message(message.ts)

			expect(ref).toBeInstanceOf(MessageRef)
		})

		it('has correct ts and channel', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('test')
			const ref = channel.message(message.ts)

			expect(ref.ts).toBe(message.ts)
			expect(ref.channel.id).toBe(message.channel.id)
		})

		it('can be awaited to fetch full message', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const sent = await channel.send('test message')
			const ref = channel.message(sent.ts)

			const fetched = await ref
			expect(fetched).toBeInstanceOf(Message)
			expect(fetched.ts).toBe(sent.ts)
		})

		it('can reply with message', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('parent message')
			const ref = channel.message(message.ts)

			const reply = await ref.reply('thread reply')
			expect(reply).toBeInstanceOf(Message)
			expect(reply.ts).toBeTruthy()
		})

		it('reply includes thread_ts', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('parent message')
			const ref = channel.message(message.ts)

			const reply = await ref.reply('thread reply')
			expect(reply.thread_ts).toBe(message.ts)
		})
	})

	describe('message methods', () => {
		it('message object has reply method', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('original message')

			expect(message).toHaveProperty('reply')
			expect(typeof message.reply).toBe('function')
		})

		it('message object has replies method', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('message with replies')

			expect(message).toHaveProperty('replies')
			expect(typeof message.replies).toBe('function')
		})

		it('message object has wait property', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send('message to wait for')

			expect(message).toHaveProperty('wait')
		})
	})

	describe('message with special properties', () => {
		it('can send message with thread_ts', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const parent = await channel.send('parent')
			const reply = await channel.send({
				text: 'reply',
				thread_ts: parent.ts,
			})

			expect(reply.thread_ts).toBe(parent.ts)
		})

		it('can send message with reply_broadcast', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const parent = await channel.send('parent')
			const broadcast = await channel.send({
				text: 'broadcast reply',
				thread_ts: parent.ts,
				reply_broadcast: true,
			})

			expect(broadcast).toBeTruthy()
		})

		it('can send message with metadata', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const message = await channel.send({
				text: 'message with metadata',
				metadata: {
					event_type: 'test_event',
					event_payload: { test: true },
				},
			})

			expect(message).toBeTruthy()
		})
	})

	describe('message iteration', () => {
		it('can iterate through replies', async () => {
			const channel = app.channel(process.env.SLACK_CHANNEL!)
			const parent = await channel.send('parent message')
			await parent.reply('reply 1')

			let replyCount = 0
			for await (const msg of parent.replies()) {
				replyCount++
				if (replyCount >= 2) break
			}
			expect(replyCount).toBeGreaterThan(0)
		})
	})
})

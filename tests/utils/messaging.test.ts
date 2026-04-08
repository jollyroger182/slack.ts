import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { sendMessage } from '../../src/utils/messaging'
import { randomUUID } from 'crypto'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('sendMessage', () => {
	it('can send plain text messages', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Hello, World!',
		})
		expect(message).toBeTruthy()
		expect(message!.channel).toBe(process.env.SLACK_CHANNEL!)
		expect(message!.message.text).toBe('Hello, World!')
	})

	it('can send non-file messages', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Hello, World!',
		})
		expect(message).toBeTruthy()
		expect(message!.channel).toBe(process.env.SLACK_CHANNEL!)
		expect(message!.message.text).toBe('Hello, World!')
	})

	it('can send messages with thread_ts', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Parent message',
		})
		const thread_message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Thread reply',
			thread_ts: message!.message.ts,
		})
		expect(thread_message).toBeTruthy()
		expect(thread_message!.message.thread_ts).toBe(message!.message.ts)
	})

	it('can send file messages', async () => {
		const file = Buffer.from('Hello, World!')
		const uuid = randomUUID()
		const filename = `${uuid}.txt`
		const result = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			files: [{ file, filename }],
		})
		expect(result).toBeUndefined()
	})

	it('can send messages with metadata', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Test message',
			metadata: {
				event_type: 'test',
				event_payload: { test: true },
			},
		})
		expect(message).toBeTruthy()
	})

	it('can send messages with blocks', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Fallback text',
			blocks: [
				{
					type: 'section',
					text: { type: 'mrkdwn', text: '*Bold text*' },
				},
			],
		})
		expect(message).toBeTruthy()
	})

	it('can send messages with reply_broadcast', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Parent message',
		})
		const broadcast = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Broadcast reply',
			thread_ts: message!.message.ts,
			reply_broadcast: true,
		})
		expect(broadcast).toBeTruthy()
	})
})

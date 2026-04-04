import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { sendMessage } from '../../src/utils/messaging'
import { randomUUID } from 'crypto'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('sendMessage', () => {
	it('can send non-file messages', async () => {
		const message = await sendMessage(app, {
			channel: process.env.SLACK_CHANNEL!,
			text: 'Hello, World!',
		})
		expect(message).toBeTruthy()
		expect(message!.channel).toBe(process.env.SLACK_CHANNEL!)
		expect(message!.message.text).toBe('Hello, World!')
	})
	it('can send file messages', async () => {
		const file = Buffer.from('Hello, World!')
		const uuid = randomUUID()
		const filename = `${uuid}.txt`
		await sendMessage(app, { channel: process.env.SLACK_CHANNEL!, files: [{ file, filename }] })
	})
})

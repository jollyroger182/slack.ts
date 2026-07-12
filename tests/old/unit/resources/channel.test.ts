import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { MessageImpl, type AnyMessage, type Message, type SlackAPIResponse } from 'slack.ts'
import type { PublicChannelData } from '../../../../src/old/api/types/conversation'
import { App } from '../../../../src/old/client'
import { ChannelImpl, type Channel } from '../../../../src/old/resources/channel'
import { PUBLIC_CHANNEL_DATA as DATA } from '../../../fixtures'
import type { AnyBlock } from '@slack/types'

describe('Channel', () => {
	let app: App
	let channel: Channel<PublicChannelData, true>

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		channel = ChannelImpl.create(app, DATA.id, DATA)
	})

	it('provides id property', () => {
		expect(channel.id).toBe(DATA.id)
	})

	it('proxies raw data', () => {
		expect(channel.name).toBe(DATA.name)
	})

	it('provides raw property', () => {
		expect(channel.raw).toEqual(DATA)
	})

	it('provides creator property', () => {
		const creator = channel.creator
		expect(creator).toBeDefined()
		expect(creator.id).toBe(DATA.creator)
	})

	it('sends non-file messages', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: 'C123',
			ts: '123456.789',
			message: {
				type: 'message',
				ts: '123456.789',
				text: 'test message',
				user: 'U123',
				team: 'T123',
			},
		} satisfies SlackAPIResponse<'chat.postMessage'>)

		await channel.send('test message')

		expect(requestSpy).toHaveBeenCalledWith('chat.postMessage', {
			channel: 'C123',
			text: 'test message',
		})
	})

	it('creates message ref with the correct ts', () => {
		const messageRef = channel.message('123456.789')
		expect(messageRef).toBeInstanceOf(MessageImpl)
		expect(messageRef.channel.id).toBe(DATA.id)
		expect(messageRef.ts).toBe('123456.789')
	})

	it('iterates through channel messages', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			pin_count: 0,
			messages: [
				{ type: 'message', ts: '123456.789', text: 'test message', user: 'U123', team: 'T123' },
			],
			has_more: false,
		} satisfies SlackAPIResponse<'conversations.history'>)

		const messages: Message<AnyMessage, AnyBlock[], true>[] = []
		for await (const message of channel.messages()) {
			messages.push(message)
		}

		expect(requestSpy).toHaveBeenCalledTimes(1)
		expect(requestSpy.mock.calls[0]![0]).toBe('conversations.history')
		expect(requestSpy.mock.calls[0]![1]).toMatchObject({ channel: DATA.id })
		expect(messages).toHaveLength(1)
		expect(messages[0]!).toBeInstanceOf(MessageImpl)
		expect(messages[0]!.channel.id).toBe(DATA.id)
		expect(messages[0]!.ts).toBe('123456.789')
		expect(messages[0]!.text).toBe('test message')
	})

	it('joins the channel', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: DATA,
		} satisfies SlackAPIResponse<'conversations.join'>)

		const joinedChannel = await channel.join()

		expect(requestSpy).toHaveBeenCalledWith('conversations.join', { channel: 'C123' })
		expect(joinedChannel).toBeInstanceOf(ChannelImpl)
		expect(joinedChannel.name).toBe(DATA.name)
	})

	it('leaves the channel', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
		} satisfies SlackAPIResponse<'conversations.leave'>)

		const leftChannel = await channel.leave()

		expect(requestSpy).toHaveBeenCalledWith('conversations.leave', { channel: 'C123' })
		expect(leftChannel).toBeTrue()
	})

	it('invites users to the channel', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: DATA,
		} satisfies SlackAPIResponse<'conversations.invite'>)

		const invitedChannel = await channel.invite('U123', app.user('U456'))

		expect(requestSpy).toHaveBeenCalledWith('conversations.invite', {
			channel: 'C123',
			users: 'U123,U456',
		})
		expect(invitedChannel).toBeInstanceOf(ChannelImpl)
		expect(invitedChannel.name).toBe(DATA.name)
	})
})

describe('Channel<Fetched=false>', () => {
	let app: App
	let ref: Channel<PublicChannelData>

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		ref = ChannelImpl.create(app, DATA.id)
	})

	it('can fetch channel details', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: DATA,
		} satisfies SlackAPIResponse<'conversations.info'>)

		const channel = await ref.fetch()
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.info', { channel: 'C123' })
		expect(channel).toBeInstanceOf(ChannelImpl)
		expect(channel.id).toBe('C123')
		expect(channel.raw).toEqual(DATA)
		expect(channel.name).toBe(DATA.name)
	})
})

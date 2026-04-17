import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { Message, MessageRef, type MessageInstance, type SlackAPIResponse } from 'slack.ts'
import type { PublicChannel } from '../../../src/api/types/conversation'
import { App } from '../../../src/client'
import { Channel, type ChannelInstance } from '../../../src/resources/channel'

const DATA: PublicChannel = {
	id: 'C123',
	name: 'general',
	is_channel: true,
	is_group: false,
	is_im: false,
	created: 1234567890,
	updated: 1234567890000,
	creator: 'U123',
	is_archived: false,
	is_general: true,
	unlinked: 0,
	name_normalized: 'general',
	is_shared: false,
	is_ext_shared: false,
	is_org_shared: false,
	pending_shared: [],
	is_pending_ext_shared: false,
	is_member: true,
	is_private: false,
	is_mpim: false,
	topic: { value: 'General channel', creator: 'U123', last_set: 1234567890 },
	purpose: { value: 'General discussion', creator: 'U123', last_set: 1234567890 },
	previous_names: [],
	locale: 'en-US',
	context_team_id: 'T123',
}

describe('Channel', () => {
	let app: App
	let channel: ChannelInstance<PublicChannel>

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		channel = new Channel(app, DATA.id, DATA) as ChannelInstance<PublicChannel>
	})

	it('creates a channel', () => {
		expect(channel).toBeDefined()
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
		expect(messageRef).toBeInstanceOf(MessageRef)
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

		const messages: MessageInstance[] = []
		for await (const message of channel.messages()) {
			messages.push(message)
		}

		expect(requestSpy).toHaveBeenCalledTimes(1)
		expect(requestSpy.mock.calls[0]![0]).toBe('conversations.history')
		expect(requestSpy.mock.calls[0]![1]).toMatchObject({ channel: DATA.id })
		expect(messages).toHaveLength(1)
		expect(messages[0]!).toBeInstanceOf(Message)
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
		expect(joinedChannel).toBeInstanceOf(Channel)
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
		expect(invitedChannel).toBeInstanceOf(Channel)
		expect(invitedChannel.name).toBe(DATA.name)
	})
})

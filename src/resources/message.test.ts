import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
	type Mock,
	spyOn,
} from 'bun:test'

import { NotFoundError, type Types } from '..'
import { APIError, Client } from '../client'
import { ConversationRef } from './conversation'
import { Message, type MessageRef } from './message'
import { UserRef } from './user'

describe('MessageRef', () => {
	let client: Client
	let message: MessageRef
	let requestSpy: Mock<Client['request']>

	beforeEach(() => {
		client = new Client('xoxb-test')
		message = client.message('C123', '123456789.123456')
		requestSpy = spyOn(client, 'request')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('gets the correct conversation', () => {
		const channel = message.conversation

		expect(channel).toBeInstanceOf(ConversationRef)
		expect(channel.id).toBe('C123')
	})

	it('replies to the message', async () => {
		requestSpy.mockResolvedValueOnce({
			ok: true,
			channel: 'C123',
			message: { ts: '123456789.123457', text: 'hello world' },
		})

		const msg = await message.reply({ text: 'hello world' })

		expect(msg).toBeInstanceOf(Message)
		expect(msg.conversationId).toBe('C123')
		expect(msg.ts).toBe('123456789.123457')
		expect(msg.data).toEqual({
			channel: 'C123',
			ts: '123456789.123457',
			text: 'hello world',
		} as never)
	})

	it('fetches the message', async () => {
		requestSpy.mockResolvedValueOnce({
			ok: true,
			messages: [{ ts: '123456789.123456', text: 'hello world' } as never],
		})

		const full = await message.fetch()

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.replies', {
			channel: 'C123',
			ts: '123456789.123456',
			oldest: '123456789.123456',
			latest: '123456789.123456',
			inclusive: true,
		})
		expect(full).toBeInstanceOf(Message)
		expect(full.data).toEqual({
			channel: 'C123',
			ts: '123456789.123456',
			text: 'hello world',
		} as never)
	})

	it('throws NotFoundError when message is not found', async () => {
		requestSpy.mockRejectedValueOnce(
			new APIError(
				`Error for conversations.replies: thread_not_found`,
				'conversations.replies',
				'thread_not_found',
				{ ok: false, error: 'thread_not_found' },
			),
		)

		expect(message.fetch()).rejects.toThrow(NotFoundError)
	})
})

describe('Message', () => {
	let client: Client

	beforeEach(() => {
		client = new Client('xoxb-test')
	})

	it('gets the user', () => {
		const message = new Message(client, {
			channel: 'C123',
			ts: '123456789.123456',
			user: 'U123',
		} as Types.GenericMessageEvent)

		const user = message.user

		expect(user).toBeInstanceOf(UserRef)
		expect(user.id).toBe('U123')
	})
})

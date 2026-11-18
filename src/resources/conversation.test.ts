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
import { Conversation, ConversationRef } from './conversation'
import { Message } from './message'

describe('ConversationRef', () => {
	let client: Client
	let channel: ConversationRef
	let requestSpy: Mock<Client['request']>

	beforeEach(() => {
		client = new Client('xoxb-test')
		channel = client.conversation('C123')
		requestSpy = spyOn(client, 'request')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('creates MessageRefs correctly', () => {
		const ref = channel.message('123456789.123456')

		expect(ref.conversationId).toBe(channel.id)
		expect(ref.ts).toBe('123456789.123456')
	})

	it('sends messages', async () => {
		const sendSpy = spyOn(client, 'send')
		sendSpy.mockResolvedValueOnce(
			new Message(client, {
				channel: 'C123',
				ts: '123456789.123456',
				text: 'hello world',
			} as never),
		)

		const msg = await channel.send({ text: 'hello world' })

		expect(sendSpy).toBeCalledTimes(1)
		expect(sendSpy).toBeCalledWith('C123', { text: 'hello world' })
		expect(msg).toBeInstanceOf(Message)
		expect(msg.conversationId).toBe('C123')
		expect(msg.ts).toBe('123456789.123456')
		expect(msg.data).toEqual({
			ts: '123456789.123456',
			text: 'hello world',
			channel: 'C123',
		} as never)
	})

	it('paginates messages', async () => {
		const paginateSpy = spyOn(client, 'paginate')

		paginateSpy.mockImplementationOnce(async function* () {
			yield { channel: 'C123', ts: '123456789.123456', text: 'hello world' }
		} as never)

		const messages = await Array.fromAsync(channel.messages({ oldest: '100000000.000000' }))

		expect(paginateSpy).toBeCalledTimes(1)

		const [method, , params] = paginateSpy.mock.lastCall!
		expect(method).toBe('conversations.history')
		expect(params).toEqual({ channel: 'C123', oldest: '100000000.000000' })

		expect(messages).toHaveLength(1)
		const message = messages[0]!
		expect(message).toBeInstanceOf(Message)
		expect(message.data).toEqual({
			channel: 'C123',
			ts: '123456789.123456',
			text: 'hello world',
		} as never)
	})

	it('fetches the conversation', async () => {
		requestSpy.mockResolvedValueOnce({ ok: true, channel: { id: 'C123', name: 'general' } })

		const full = await channel.fetch()

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.info', { channel: 'C123' })
		expect(full).toBeInstanceOf(Conversation)
		expect(full.data).toEqual({ id: 'C123', name: 'general' } as never)
	})

	it('throws NotFoundError when conversations is not found', async () => {
		requestSpy.mockRejectedValueOnce(
			new APIError(
				`Error for conversations.info: channel_not_found`,
				'conversations.info',
				'channel_not_found',
				{ ok: false, error: 'channel_not_found' },
			),
		)

		expect(channel.fetch()).rejects.toThrow(NotFoundError)
	})
})

describe('Conversation', () => {
	let client: Client

	beforeEach(() => {
		client = new Client('xoxb-test')
	})

	const narrowMethods = [
		'isPublicChannel',
		'isPrivateChannel',
		'isChannel',
		'isMPIM',
		'isIM',
		'isNotIM',
	] as const

	function testNarrow(
		label: string,
		data: Partial<Types.Conversation>,
		shouldBeTrue: (typeof narrowMethods)[number][],
	) {
		it(`${label} narrow correctly`, () => {
			const conversation = new Conversation(client, {
				id: 'C123',
				name: 'general',
				...data,
			} as Types.Conversation)

			for (const method of narrowMethods) {
				const result = conversation[method].apply(conversation)
				const expected = shouldBeTrue.includes(method)
				if (result !== expected) {
					throw new Error(
						`Method ${method} does not work on ${label}\n\nExpected: ${expected}\nReceived: ${result}`,
					)
				} else {
					expect(result).toBe(expected)
				}
			}
		})
	}

	testNarrow(
		'public channels',
		{ is_im: false, is_channel: true, is_group: false, is_mpim: false, is_private: false },
		['isChannel', 'isNotIM', 'isPublicChannel'],
	)

	testNarrow(
		'private channels (modern)',
		{ is_im: false, is_channel: true, is_group: false, is_mpim: false, is_private: true },
		['isChannel', 'isNotIM', 'isPrivateChannel'],
	)

	testNarrow(
		'private channels (legacy)',
		{ is_im: false, is_channel: false, is_group: true, is_mpim: false, is_private: true },
		['isChannel', 'isNotIM', 'isPrivateChannel'],
	)

	testNarrow(
		'MPIMs',
		{ is_im: false, is_channel: true, is_group: false, is_mpim: true, is_private: true },
		['isMPIM', 'isNotIM'],
	)

	testNarrow('IMs', { is_im: true }, ['isIM'])
})

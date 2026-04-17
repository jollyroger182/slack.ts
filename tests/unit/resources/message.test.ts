import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import type { NormalMessage } from '../../../src/api/types/message'
import { App } from '../../../src/client'
import { Message, MessageRef, type MessageInstance } from '../../../src/resources/message'
import { blockActions, BUTTON_DATA, MESSAGE_DATA, normalMessage, USER_DATA } from '../../fixtures'
import type { BlockActions } from '../../../src/api/interactive/block_actions'
import {
	Action,
	blocks,
	button,
	section,
	SlackWebAPIPlatformError,
	User,
	type SlackAPIResponse,
	type UserInstance,
} from 'slack.ts'
import { channel } from 'node:diagnostics_channel'

describe('Message', () => {
	let app: App
	let message: MessageInstance<NormalMessage>

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		message = new Message(app, 'C123', '123456.789', MESSAGE_DATA) as MessageInstance<NormalMessage>
	})

	it('provides channel property', () => {
		const channel = message.channel
		expect(channel.id).toBe('C123')
	})

	it('provides ts property', () => {
		expect(message.ts).toBe('123456.789')
	})

	describe('wait', () => {
		it('can wait for actions with action_id', async () => {
			const payload: BlockActions = blockActions(BUTTON_DATA)
			setTimeout(() => app.receiver.emit('block_actions', payload), 0)

			const action = await message.wait.timeout(10).action('test_button')
			expect(action).toBeInstanceOf(Action)
			expect(action.raw).toEqual(BUTTON_DATA)
			expect(action.action_id).toBe('test_button')
		})

		it('wait can timeout', async () => {
			const time = Date.now()
			expect(message.wait.timeout(10).action('test_button')).rejects.toThrow(
				'Timed out waiting for action',
			)
			expect(Date.now() - time).toBeGreaterThanOrEqual(10)
		})

		it('wait with timeout 0 disables timeout', async () => {
			const payload: BlockActions = blockActions(BUTTON_DATA)
			setTimeout(() => app.receiver.emit('block_actions', payload), 10)

			await message.wait.timeout(0).action('test_button')
		})
	})

	it('can reply to message with text', async () => {
		const replyData = normalMessage({ ts: '123457.789', thread_ts: '123456.789' })
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: 'C123',
			ts: '123457.789',
			message: replyData,
		} satisfies SlackAPIResponse<'chat.postMessage'>)

		const reply = await message.reply('Hello world')
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('chat.postMessage', {
			text: 'Hello world',
			channel: 'C123',
			thread_ts: '123456.789',
		})
		expect(reply).toBeInstanceOf(Message)
		expect(reply.raw).toEqual(replyData)
		expect(reply.ts).toBe('123457.789')
		expect(reply.text).toBe(replyData.text)
	})

	it('can reply to message with blocks', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: 'C123',
			ts: '123457.789',
			message: normalMessage({ ts: '123457.789', thread_ts: '123456.789' }),
		} satisfies SlackAPIResponse<'chat.postMessage'>)

		const blks = blocks(section('Hello world'))
		await message.reply({ blocks: blks })
		expect(requestSpy).toBeCalledWith('chat.postMessage', {
			blocks: blks,
			channel: 'C123',
			thread_ts: '123456.789',
		})
	})

	it('can stream reply to message', async () => {
		const completeData = normalMessage({
			ts: '123457.789',
			thread_ts: '123456.789',
			text: 'foo bar',
		})
		const requestSpy = spyOn(app, 'request')
			.mockResolvedValueOnce({
				ok: true,
				channel: 'C123',
				ts: '123457.789',
			} satisfies SlackAPIResponse<'chat.startStream'>)
			.mockResolvedValueOnce({
				ok: true,
				channel: 'C123',
				ts: '123457.789',
			} satisfies SlackAPIResponse<'chat.appendStream'>)
			.mockResolvedValueOnce({
				ok: true,
				channel: 'C123',
				ts: '123457.789',
				message: completeData,
			} satisfies SlackAPIResponse<'chat.stopStream'>)

		const stream = await message.stream({ id: 'U123', team_id: 'T123' }, ['foo'])
		await stream.append(' bar')
		const reply = await stream.stop()

		expect(reply).toBeInstanceOf(Message)
		expect(reply.ts).toEqual('123457.789')
		expect(reply.text).toEqual(completeData.text)
		expect(requestSpy).toBeCalledTimes(3)
		expect(requestSpy).toHaveBeenNthCalledWith(1, 'chat.startStream', {
			channel: 'C123',
			chunks: [{ text: 'foo', type: 'markdown_text' }],
			recipient_team_id: 'T123',
			recipient_user_id: 'U123',
			thread_ts: '123456.789',
		})
		expect(requestSpy).toHaveBeenNthCalledWith(2, 'chat.appendStream', {
			channel: 'C123',
			ts: '123457.789',
			chunks: [{ text: ' bar', type: 'markdown_text' }],
		})
		expect(requestSpy).toHaveBeenNthCalledWith(3, 'chat.stopStream', {
			channel: 'C123',
			ts: '123457.789',
		})
	})

	it('can stream with user object', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			channel: 'C123',
			ts: '123457.789',
		} satisfies SlackAPIResponse<'chat.startStream'>)

		const user = new User(app, 'U123', USER_DATA) as UserInstance
		await message.stream(user)
		expect(requestSpy).toBeCalledWith('chat.startStream', {
			channel: 'C123',
			recipient_team_id: 'T123',
			recipient_user_id: 'U123',
			thread_ts: '123456.789',
		})
	})

	it('can stream chunks', async () => {
		const requestSpy = spyOn(app, 'request')
			.mockResolvedValueOnce({
				ok: true,
				channel: 'C123',
				ts: '123457.789',
			} satisfies SlackAPIResponse<'chat.startStream'>)
			.mockResolvedValueOnce({
				ok: true,
				channel: 'C123',
				ts: '123457.789',
			} satisfies SlackAPIResponse<'chat.appendStream'>)

		const stream = await message.stream({ id: 'U123', team_id: 'T123' }, [
			{ type: 'plan_update', title: 'new plan' },
		])
		await stream.append({ type: 'task_update', id: 'task_123', title: 'new task' })

		expect(requestSpy).toHaveBeenNthCalledWith(1, 'chat.startStream', {
			channel: 'C123',
			chunks: [{ type: 'plan_update', title: 'new plan' }],
			recipient_team_id: 'T123',
			recipient_user_id: 'U123',
			thread_ts: '123456.789',
		})
		expect(requestSpy).toHaveBeenNthCalledWith(2, 'chat.appendStream', {
			channel: 'C123',
			ts: '123457.789',
			chunks: [{ type: 'task_update', id: 'task_123', title: 'new task' }],
		})
	})

	it('can iterate message replies', async () => {
		const replyData = normalMessage({ ts: '123457.789', thread_ts: '123456.789' })
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			messages: [replyData],
			has_more: false,
		} satisfies SlackAPIResponse<'conversations.replies'>)

		const messages: MessageInstance[] = []
		for await (const reply of message.replies()) {
			messages.push(reply)
		}

		expect(messages).toHaveLength(1)
		expect(messages[0]).toBeInstanceOf(Message)
		expect(messages[0]!.text).toBe(replyData.text)
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.replies', {
			channel: 'C123',
			ts: '123456.789',
		})
	})

	it('can edit message', async () => {
		const newData = normalMessage({ text: 'edited' })
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			message: newData,
			channel: 'C123',
			ts: '123456.789',
			text: newData.text!,
		} satisfies SlackAPIResponse<'chat.update'>)

		const newMessage = await message.edit({ text: 'edited' })

		expect(newMessage).toBeInstanceOf(Message)
		expect(newMessage.raw).toEqual(newData)
		expect(newMessage.text).toBe(newData.text)
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('chat.update', {
			channel: 'C123',
			ts: '123456.789',
			text: 'edited',
		})
	})

	it('can react to message', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
		} satisfies SlackAPIResponse<'reactions.add'>)

		await message.react('sob')

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('reactions.add', {
			channel: 'C123',
			timestamp: '123456.789',
			name: 'sob',
		})
	})

	it('handles already_reacted when reacting', async () => {
		spyOn(app, 'request').mockRejectedValueOnce(
			new SlackWebAPIPlatformError(
				'https://slack.com/api/reactions.add',
				{ ok: false, error: 'already_reacted' },
				'already_reacted',
			),
		)

		await message.react('sob')
	})

	it('only handles already_reacted when reacting', () => {
		const error = new SlackWebAPIPlatformError(
			'https://slack.com/api/reactions.add',
			{ ok: false, error: 'unknown_error' },
			'unknown_error',
		)
		spyOn(app, 'request').mockRejectedValueOnce(error)

		const promise = message.react('sob')
		expect(promise).rejects.toBe(error)
	})

	it('can unreact to message', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
		} satisfies SlackAPIResponse<'reactions.remove'>)

		await message.unreact('sob')

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('reactions.remove', {
			channel: 'C123',
			timestamp: '123456.789',
			name: 'sob',
		})
	})

	it('handles no_reaction when unreacting', async () => {
		spyOn(app, 'request').mockRejectedValueOnce(
			new SlackWebAPIPlatformError(
				'https://slack.com/api/reactions.remove',
				{ ok: false, error: 'no_reaction' },
				'no_reaction',
			),
		)

		await message.unreact('sob')
	})

	it('only handles no_reaction when unreacting', () => {
		const error = new SlackWebAPIPlatformError(
			'https://slack.com/api/reactions.remove',
			{ ok: false, error: 'unknown_error' },
			'unknown_error',
		)
		spyOn(app, 'request').mockRejectedValueOnce(error)

		const promise = message.unreact('sob')
		expect(promise).rejects.toBe(error)
	})

	it('can get message reactions', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			type: 'message',
			channel: 'C123',
			message: { ...MESSAGE_DATA, reactions: [{ count: 1, name: 'sob', users: ['U123'] }] },
		} satisfies SlackAPIResponse<'reactions.get'>)

		const reactions = await message.reactions()
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('reactions.get', {
			full: true,
			channel: 'C123',
			timestamp: '123456.789',
		})
		expect(reactions).toEqual([{ count: 1, name: 'sob', users: ['U123'] }])
	})

	it('provides raw data', () => {
		expect(message.raw).toEqual(MESSAGE_DATA)
	})

	it('proxies message data properties', () => {
		expect(message.text).toBe(MESSAGE_DATA.text)
	})

	it('provides author property', () => {
		const author = message.author
		expect(author.id).toBe('U123')
	})

	it('detects normal messages', () => {
		expect(message.isNormal()).toBeTrue()
	})
})

describe('MessageRef', () => {
	let app: App
	let ref: MessageRef<NormalMessage>

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		ref = new MessageRef(app, 'C123', '123456.789')
	})

	it('can fetch message details', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			messages: [MESSAGE_DATA],
			has_more: false,
		} satisfies SlackAPIResponse<'conversations.replies'>)

		const message = await ref
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.replies', {
			channel: 'C123',
			ts: '123456.789',
			inclusive: true,
			latest: '123456.789',
			oldest: '123456.789',
		})
		expect(message).toBeInstanceOf(Message)
		expect(message.raw).toEqual(MESSAGE_DATA)
		expect(message.text).toBe(MESSAGE_DATA.text)
	})
})

import { NotFoundError, type Types } from '..'
import type { Client } from '../client'
import type { DistributiveOmit, UserOf } from '../utils/types'

/** Reference to a message with a given `conversationId` and `ts`. */
export class MessageRef {
	constructor(
		protected readonly client: Client,
		readonly conversationId: string,
		readonly ts: string,
	) {}

	/** The conversation where this message was sent. */
	get conversation() {
		return this.client.conversation(this.conversationId)
	}

	/**
	 * Sends a reply to this message in the thread.
	 *
	 * @param message The message to send, parameters for the `chat.postMessage` API method.
	 * @returns The sent message.
	 */
	async reply(
		message: DistributiveOmit<
			Types.MethodMap['chat.postMessage']['params'],
			'channel' | 'thread_ts'
		>,
	) {
		const msg = await this.client.request('chat.postMessage', {
			...message,
			channel: this.conversationId,
			thread_ts: this.ts,
		})
		return new Message(this.client, msg.message)
	}

	/**
	 * Fetches the message from Slack.
	 *
	 * @returns A complete {@link Message} object.
	 */
	async fetch() {
		const resp = await this.client.request('conversations.replies', {
			channel: this.conversationId,
			ts: this.ts,
			oldest: this.ts,
			latest: this.ts,
			inclusive: true,
		})
		const message = resp.messages[0]!
		if (!message) {
			throw new NotFoundError(`Message ${this.ts} not found in conversation ${this.conversationId}`)
		}
		return new Message(this.client, message)
	}
}

/**
 * A message in a conversation. May be a user-/bot-sent message, a system notification, or other
 * subtypes.
 */
export class Message<T extends Types.MessageEvent = Types.MessageEvent> extends MessageRef {
	constructor(
		client: Client,
		readonly data: T,
	) {
		super(client, data.channel, data.ts)
		data.ts
	}

	get user(): UserOf<T> {
		const id = (this.data as { user?: string }).user
		return (id ? this.client.user(id) : undefined) as UserOf<T>
	}
}

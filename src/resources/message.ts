import { APIError, NotFoundError, type Types } from '..'
import type {
	Client,
	SendEphemeralParams,
	SendParams,
	SendWithFileParams,
	SendWithoutFileParams,
} from '../client'
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

	async reply(
		params: DistributiveOmit<SendEphemeralParams | SendWithFileParams, 'thread_ts'>,
	): Promise<void>
	async reply(
		params: DistributiveOmit<SendWithoutFileParams, 'thread_ts'>,
	): Promise<Message<Types.GenericMessageEvent>>
	async reply(
		params: DistributiveOmit<SendParams, 'thread_ts'>,
	): Promise<Message<Types.GenericMessageEvent> | void>

	/**
	 * Sends a reply to this message in the thread.
	 *
	 * @param message The message to send. Supports sending files and ephermeral messages as well.
	 * @returns The sent message, if applicable.
	 */
	async reply(params: DistributiveOmit<SendParams, 'thread_ts'>) {
		return this.client.send(this.conversationId, { ...params, thread_ts: this.ts })
	}

	/**
	 * Fetches the message from Slack.
	 *
	 * @returns A complete {@link Message} object.
	 */
	async fetch() {
		let message
		try {
			const resp = await this.client.request('conversations.replies', {
				channel: this.conversationId,
				ts: this.ts,
				oldest: this.ts,
				latest: this.ts,
				inclusive: true,
			})
			message = resp.messages[0]
		} catch (e) {
			if (e instanceof APIError && e.error === 'thread_not_found') {
				message = undefined
			} else {
				throw e
			}
		}
		if (!message) {
			throw new NotFoundError(`Message ${this.ts} not found in conversation ${this.conversationId}`)
		}
		return new Message<Types.MessageEvent>(this.client, {
			...message,
			channel: this.conversationId,
		})
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

import type { TimestampPaginationParams } from '../api/types/api'
import type { Conversation } from '../api/types/conversation'
import type { NormalMessage } from '../api/types/message'
import type { App } from '../client'
import { makeProxy } from '../utils'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import { paginate } from '../utils/paginate'
import type { DistributiveOmit } from '../utils/typing'
import { Message, MessageRef, type MessageInstance } from './message'
import { UserRef } from './user'

interface FetchMessagesParams extends Omit<TimestampPaginationParams, 'limit'> {
	/**
	 * How many messages to fetch in each API call. This will not affect the number of returned
	 * messages.
	 */
	batch?: number

	/**
	 * How many messages to return in total.
	 *
	 * @default Infinity
	 */
	limit?: number
}

class ChannelMixin {
	#id: string

	constructor(
		protected client: App,
		id: string,
	) {
		this.#id = id
	}

	/** ID of the channel */
	get id() {
		return this.#id
	}

	/**
	 * Sends a message in the channel with files.
	 *
	 * @param message The message payload to send, including the files to upload. `text` will be
	 *   ignored if `blocks` are provided.
	 */
	async send(message: DistributiveOmit<SendMessageWithFiles, 'channel'>): Promise<undefined>

	/**
	 * Sends a message in the channel.
	 *
	 * @param message The message payload to send, either a mrkdwn-formatted string or an object.
	 * @returns The sent message
	 */
	async send(
		message: DistributiveOmit<SendMessageWithoutFiles, 'channel'> | string,
	): Promise<MessageInstance<NormalMessage>>

	async send(message: DistributiveOmit<SendMessageParams, 'channel'> | string) {
		if (typeof message === 'string') {
			message = { text: message }
		}
		const data = await sendMessage(this.client, { ...message, channel: this.id })
		if (data) {
			return new Message(
				this.client,
				this.#id,
				data.ts,
				data.message,
			) as MessageInstance<NormalMessage>
		}
	}

	/**
	 * Gets a message reference object. You can use this object to call API methods, or `await` it to
	 * fetch message details.
	 *
	 * @param ts The timestamp of the message
	 * @returns A message reference object
	 */
	message(ts: string) {
		return new MessageRef(this.client, this.#id, ts)
	}

	/**
	 * Fetches messages in the channel. Note that this method only fetches root messages (i.e.,
	 * messages not in a thread); to fetch thread replies, use the `replies` method on messages
	 * instead.
	 *
	 * @param params Options for fetching messages
	 * @returns An async iterator of messages, from newest to oldest
	 */
	async *messages(params: FetchMessagesParams = {}) {
		yield* paginate(this.client, 'conversations.history', { channel: this.#id, ...params }, (r) =>
			r.messages
				.values()
				.map((m) => new Message(this.client, this.#id, m.ts, m) as MessageInstance),
		)
	}
}

export class ChannelRef extends ChannelMixin implements PromiseLike<ChannelInstance> {
	then<TResult1 = ChannelInstance, TResult2 = never>(
		onfulfilled?: ((value: ChannelInstance) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.#fetch().then(onfulfilled, onrejected)
	}

	async #fetch(): Promise<ChannelInstance> {
		const data = await this.client.request('conversations.info', { channel: this.id })
		return new Channel(this.client, this.id, data.channel) as ChannelInstance
	}
}

export class Channel extends ChannelMixin {
	#data: Conversation

	constructor(client: App, id: string, data: Conversation) {
		super(client, id)
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	/** A reference to the creator of this channel. Only available for non-DM channels. */
	get creator() {
		return this.#data.creator ? new UserRef(this.client, this.#data.creator) : undefined
	}
}

export type ChannelInstance = Channel & DistributiveOmit<Conversation, 'creator'>

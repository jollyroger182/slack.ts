import type { AnyBlock } from '@slack/types'
import type { TimestampPaginationParams } from '../api/types/api'
import type { ConversationData } from '../api/types/conversation'
import type { NormalMessageData } from '../api/types/message'
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
import { UserImpl, type User } from './user'
import type { ConversationsMembersParams } from '../api/web/conversations'

interface FetchMessagesParams extends Omit<TimestampPaginationParams, 'cursor' | 'limit'> {
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

interface FetchMembersParams extends Omit<
	ConversationsMembersParams,
	'channel' | 'cursor' | 'limit'
> {
	/**
	 * How many messages to return in total.
	 *
	 * @default Infinity
	 */
	limit?: number
}

export class ChannelImpl {
	#data: ConversationData | undefined
	#id: string

	constructor(
		protected client: App,
		id: string,
		data?: ConversationData,
	) {
		this.#id = id
		this.#data = data
		return makeProxy(this, () => this.#data || {})
	}

	static create<T extends ConversationData = ConversationData>(
		client: App,
		id: string,
		data: T,
	): Channel<T, true>
	static create<T extends ConversationData = ConversationData>(
		client: App,
		id: string,
		data?: undefined,
	): Channel<T>
	static create(client: App, id: string, data?: ConversationData) {
		return new ChannelImpl(client, id, data)
	}

	get raw() {
		return this.#data
	}

	async fetch<T extends ConversationData = ConversationData>(): Promise<Channel<T, true>> {
		const data = await this.client.request('conversations.info', { channel: this.id })
		return ChannelImpl.create(this.client, this.id, data.channel as T)
	}

	protected _updateData(data: ConversationData) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	/** ID of the channel */
	get id() {
		return this.#id
	}

	/** A reference to the creator of this channel. Only available for non-DM channels. */
	get creator(): User | undefined {
		return (
			this.#data?.creator ? UserImpl.create(this.client, this.#data.creator) : undefined
		) as any
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
	async send<Blocks extends AnyBlock[] = AnyBlock[]>(
		message: DistributiveOmit<SendMessageWithoutFiles<Blocks>, 'channel'> | string,
	): Promise<MessageInstance<NormalMessageData<Blocks>, Blocks>>

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
			) as MessageInstance<NormalMessageData>
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

	async members(params: FetchMembersParams = {}): Promise<User<undefined>[]> {
		return (
			await Array.fromAsync(
				paginate(this.client, 'conversations.members', { ...params, channel: this.#id }, (r) =>
					r.members.values().map((m) => ({ user: new UserImpl(this.client, m) })),
				),
			)
		).map((u) => u.user)
	}

	async join(): Promise<this> {
		const { channel } = await this.client.request('conversations.join', { channel: this.#id })
		return this._updateData(channel)
	}

	async leave() {
		const { not_in_channel } = await this.client.request('conversations.leave', {
			channel: this.#id,
		})
		return !not_in_channel
	}

	async invite(...users: (User | string)[]): Promise<this> {
		const { channel } = await this.client.request('conversations.invite', {
			channel: this.#id,
			users: users.map((u) => (typeof u === 'string' ? u : u.id)).join(','),
		})
		return this._updateData(channel)
	}
}

export type Channel<
	T extends ConversationData = ConversationData,
	Fetched extends boolean = false,
> = T extends any
	? ChannelImpl &
			(Fetched extends true
				? DistributiveOmit<T, 'creator'> & {
						readonly raw: T
						readonly creator: undefined extends (T & {})['creator'] ? User | undefined : User
					}
				: {})
	: never

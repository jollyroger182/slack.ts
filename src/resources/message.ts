import type { TimestampPaginationParams } from '../api/types/api'
import type { AnyMessage, NormalMessage } from '../api/types/message'
import type { App } from '../client'
import { SlackError } from '../error'
import { makeProxy } from '../utils'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import type { DistributiveOmit } from '../utils/typing'
import { ChannelRef } from './channel'
import { UserRef } from './user'

interface FetchRepliesParams extends Omit<TimestampPaginationParams, 'limit'> {
	/**
	 * How many replies to fetch in each API call. This will not affect the number of returned
	 * messages.
	 *
	 * @default 100
	 */
	batch?: number

	/**
	 * How many replies to return in total.
	 *
	 * @default Infinity
	 */
	limit?: number

	/**
	 * Whether to include the root message in the results.
	 *
	 * @default true
	 */
	root?: boolean
}

class MessageMixin {
	#channel: string
	#ts: string

	constructor(
		protected client: App,
		channel: string,
		ts: string,
	) {
		this.#channel = channel
		this.#ts = ts
	}

	/** The channel where this message was sent */
	get channel() {
		return new ChannelRef(this.client, this.#channel)
	}

	protected get _channelId() {
		return this.#channel
	}

	/** Timestamp of the message */
	get ts() {
		return this.#ts
	}

	protected get _threadTs(): string | undefined {
		return undefined
	}

	/**
	 * Sends a message as a reply to this messsage with files.
	 *
	 * @param message The message payload to send, including the files to upload. `text` will be
	 *   ignored if `blocks` are provided.
	 */
	async reply(
		message: DistributiveOmit<SendMessageWithFiles, 'channel' | 'thread_ts'>,
	): Promise<undefined>

	/**
	 * Sends a message as a reply to this messsage.
	 *
	 * @param message The message payload to send, either a mrkdwn-formatted string or an object.
	 * @returns The sent message
	 */
	async reply(
		message: DistributiveOmit<SendMessageWithoutFiles, 'channel' | 'thread_ts'> | string,
	): Promise<MessageInstance<NormalMessage>>

	async reply(message: DistributiveOmit<SendMessageParams, 'channel' | 'thread_ts'> | string) {
		if (typeof message === 'string') {
			message = { text: message }
		}
		const data = await sendMessage(this.client, {
			...message,
			channel: this.#channel,
			thread_ts: this._threadTs || this.#ts,
		})
		if (data) {
			return new Message(
				this.client,
				this.#channel,
				data.ts,
				data.message,
			) as MessageInstance<NormalMessage>
		}
	}

	/**
	 * Fetches replies in the thread of this message. Note that this method may return the root
	 * message by default; set `params.root` to `false` to skip it.
	 *
	 * @param params Options for fetching replies
	 * @returns An async iterator of messages, from oldest to newest
	 */
	async *replies(params: FetchRepliesParams = {}): AsyncGenerator<MessageInstance, void, unknown> {
		let remaining = params.limit ?? Infinity
		let cursor: string | undefined
		while (true) {
			const batch = await this.client.request('conversations.replies', {
				channel: this.#channel,
				ts: this.#ts,
				latest: params.latest,
				oldest: params.oldest,
				inclusive: params.inclusive,
				limit: params.batch ?? 100,
				cursor,
			})
			for (const message of batch.messages) {
				if (!(params.root ?? true) && message.ts === this.#ts) continue
				yield new Message(this.client, this.#channel, message.ts, message) as MessageInstance
				if (--remaining <= 0) return
			}
			cursor = batch.response_metadata?.next_cursor
			if (!batch.has_more || !cursor) return
		}
	}
}

export class MessageRef<Subtype extends AnyMessage = AnyMessage>
	extends MessageMixin
	implements PromiseLike<Message<Subtype>>
{
	then<TResult1 = Message<Subtype>, TResult2 = never>(
		onfulfilled?:
			| ((value: Message<Subtype>) => TResult1 | PromiseLike<TResult1>)
			| null
			| undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.#fetch().then(onfulfilled, onrejected)
	}

	async #fetch(): Promise<Message<Subtype>> {
		const data = await this.client.request('conversations.replies', {
			channel: this._channelId,
			ts: this.ts,
			latest: this.ts,
			oldest: this.ts,
			inclusive: true,
		})
		if (!data.messages.length) {
			throw new SlackError('Message is not found')
		}
		return new Message(
			this.client,
			this._channelId,
			this.ts,
			data.messages[0] as Subtype,
		) as MessageInstance<Subtype>
	}
}

export class Message<Subtype extends AnyMessage = AnyMessage> extends MessageMixin {
	#data: Subtype

	constructor(client: App, channel: string, ts: string, data: Subtype) {
		super(client, channel, ts)
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	/** @returns Whether this message is a normal message (subtype is undefined) */
	isNormal(): this is MessageInstance<NormalMessage> {
		return !this.#data.subtype
	}

	/** The raw data of this message */
	get raw() {
		return this.#data
	}

	/**
	 * A reference to the user that created the message. Note that for system messages (such as
	 * channel join messages), this may not be the user you expect. Read the Slack documentation to
	 * find out.
	 */
	get author() {
		return new UserRef(this.client, this.#data.user)
	}

	protected override get _threadTs(): string | undefined {
		return this.#data.thread_ts
	}
}

export type MessageInstance<Subtype extends AnyMessage = AnyMessage> = Message<Subtype> & Subtype

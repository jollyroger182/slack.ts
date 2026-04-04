import type { Conversation } from '../api/types/conversation'
import type { NormalMessage } from '../api/types/message'
import type { App } from '../client'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import { Message, MessageRef, type MessageInstance } from './message'

type OmitChannel<T> = T extends any ? Omit<T, 'channel'> : never

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
	async send(message: OmitChannel<SendMessageWithFiles>): Promise<undefined>

	/**
	 * Sends a message in the channel.
	 *
	 * @param message The message payload to send, either a mrkdwn-formatted string or an object.
	 * @returns The sent message
	 */
	async send(
		message: OmitChannel<SendMessageWithoutFiles> | string,
	): Promise<MessageInstance<NormalMessage>>

	async send(message: OmitChannel<SendMessageParams> | string) {
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
		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) return (target as any)[prop]
				return (target.#data as any)[prop]
			},
		})
	}
}

export type ChannelInstance = Channel & Conversation

import { NotFoundError, type Types } from '..'
import {
	APIError,
	type Client,
	type SendEphemeralParams,
	type SendParams,
	type SendWithFileParams,
	type SendWithoutFileParams,
} from '../client'
import type { DistributiveOmit } from '../utils/types'
import { Message } from './message'

/** Reference to a conversation with a given `id`. */
export class ConversationRef {
	constructor(
		protected readonly client: Client,
		readonly id: string,
	) {}

	/** Returns a reference to a message in this conversation. */
	message(ts: string) {
		return this.client.message(this.id, ts)
	}

	async send(params: SendEphemeralParams | SendWithFileParams): Promise<void>
	async send(params: SendWithoutFileParams): Promise<Message<Types.GenericMessageEvent>>
	async send(params: SendParams): Promise<Message<Types.GenericMessageEvent> | void>

	/**
	 * Sends a message in this conversation.
	 *
	 * @param params The message to send. Supports sending files and ephermeral messages as well.
	 * @returns The sent message, if applicable.
	 */
	async send(params: SendParams) {
		return this.client.send(this.id, params)
	}

	/**
	 * Paginates through the messages in this conversation.
	 *
	 * @param params Parameterss for the `conversations.history` API method.
	 * @yields Messages in the channel.
	 */
	async *messages(
		params?: DistributiveOmit<
			Types.MethodMap['conversations.history']['params'],
			'channel' | 'cursor'
		>,
	) {
		for await (const message of this.client.paginate('conversations.history', (r) => r.messages, {
			...params,
			channel: this.id,
		})) {
			yield new Message<Types.MessageEvent>(this.client, { ...message, channel: this.id })
		}
	}

	/**
	 * Fetches the conversation from Slack.
	 *
	 * @returns A complete {@link Conversation} object.
	 */
	async fetch() {
		try {
			const data = await this.client.request('conversations.info', { channel: this.id })
			return new Conversation(this.client, data.channel)
		} catch (e) {
			if (e instanceof APIError && e.error === 'channel_not_found') {
				throw new NotFoundError(`Channel ${this.id} not found`)
			}
			throw e
		}
	}
}

/** A public/private channel, MPIM, or IM conversation. */
export class Conversation<
	T extends Types.Conversation = Types.Conversation,
> extends ConversationRef {
	constructor(
		client: Client,
		readonly data: T,
	) {
		super(client, data.id)
	}

	isPublicChannel(): this is Conversation<Types.PublicChannel> {
		return !this.data.is_im && !this.data.is_private
	}

	isPrivateChannel(): this is Conversation<Types.PrivateChannel> {
		return !this.data.is_im && !!this.data.is_private && !this.data.is_mpim
	}

	isChannel(): this is Conversation<Types.PublicChannel | Types.PrivateChannel> {
		return !this.data.is_im && !this.data.is_mpim
	}

	isMPIM(): this is Conversation<Types.PrivateChannel> {
		return !!this.data.is_mpim
	}

	isIM(): this is Conversation<Types.IMChannel> {
		return !!this.data.is_im
	}

	isNotIM(): this is Conversation<Exclude<Types.Conversation, Types.IMChannel>> {
		return !this.data.is_im
	}
}

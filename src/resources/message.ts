import type { AnyMessage, NormalMessage } from '../api/types/message'
import type { App } from '../client'
import { SlackError } from '../error'
import { ChannelRef } from './channel'

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

	get channel() {
		return new ChannelRef(this.client, this.#channel)
	}

	protected get _channelId() {
		return this.#channel
	}

	get ts() {
		return this.#ts
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
		return new Proxy(this, {
			get(target, prop) {
				if (prop in target) return (target as any)[prop]
				return (target.#data as any)[prop]
			},
		})
	}

	isNormal(): this is Message<NormalMessage> {
		return !this.#data.subtype
	}

	get raw() {
		return this.#data
	}
}

export type MessageInstance<Subtype extends AnyMessage = AnyMessage> = Message<Subtype> & Subtype

import type { Conversation } from '../api/types/conversation'
import type { NormalMessage } from '../api/types/message'
import type { App } from '../client'
import { Message, type MessageInstance } from './message'

class ChannelMixin {
	#id: string

	constructor(
		protected client: App,
		id: string,
	) {
		this.#id = id
	}

	get id() {
		return this.#id
	}

	async send(message: any) {
		const data = await this.client.request('chat.postMessage', { ...message, channel: this.id })
		return new Message(
			this.client,
			this.#id,
			data.ts,
			data.message,
		) as MessageInstance<NormalMessage>
	}
}

export class ChannelRef extends ChannelMixin implements PromiseLike<Channel> {
	then<TResult1 = Channel, TResult2 = never>(
		onfulfilled?: ((value: Channel) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.#fetch().then(onfulfilled, onrejected)
	}

	async #fetch(): Promise<Channel> {
		const data = await this.client.request('conversations.info', { channel: this.id })
		return new Channel(this.client, this.id, data.channel)
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

	get name() {
		return this.#data.name
	}
}

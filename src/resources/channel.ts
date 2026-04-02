import type { App } from '../client'

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
		return new Channel(this.client, this.id, data)
	}
}

export class Channel extends ChannelMixin {
	#data: unknown

	constructor(client: App, id: string, data: unknown) {
		super(client, id)
		this.#data = data
	}

	get name() {
		return this.#data.channel.name
	}
}

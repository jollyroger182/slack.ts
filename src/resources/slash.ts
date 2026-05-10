import type { SlashCommandPayload } from '../api/slash'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'
import { ChannelRef } from './channel'
import { UserImpl, type User } from './user'

export class SlashCommandImpl {
	#data: SlashCommandPayload

	constructor(
		private client: App,
		data: SlashCommandPayload,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	static create(client: App, data: SlashCommandPayload) {
		return new SlashCommandImpl(client, data) as SlashCommand
	}

	get respond(): Responder<true> {
		return new Responder(this.client, this.#data.response_url, this.#data.trigger_id)
	}

	get user(): User {
		return UserImpl.create(this.client, this.#data.user_id)
	}

	get channel(): ChannelRef {
		return new ChannelRef(this.client, this.#data.channel_id)
	}
}

export type SlashCommand = SlashCommandImpl & SlashCommandPayload

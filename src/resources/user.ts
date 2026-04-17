import type { IM } from '../api/types/conversation'
import type { NormalMessage } from '../api/types/message'
import type { User as UserData } from '../api/types/user'
import type { App } from '../client'
import { makeProxy } from '../utils'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import type { DistributiveOmit } from '../utils/typing'
import { Channel, type ChannelInstance } from './channel'
import { Message, type MessageInstance } from './message'

class UserMixin {
	#id: string

	constructor(
		protected client: App,
		id: string,
	) {
		this.#id = id
	}

	/** ID of the user */
	get id() {
		return this.#id
	}

	/**
	 * Sends a message in DM with the user with files.
	 *
	 * @param message The message payload to send, including the files to upload. `text` will be
	 *   ignored if `blocks` are provided.
	 */
	async send(message: DistributiveOmit<SendMessageWithFiles, 'channel'>): Promise<undefined>

	/**
	 * Sends a message in DM with the user.
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

	async im() {
		const { channel } = await this.client.request('conversations.open', {
			return_im: true,
			users: this.#id,
		})
		return new Channel(this.client, channel.id, channel as IM) as ChannelInstance<IM>
	}
}

export class UserRef extends UserMixin implements PromiseLike<UserInstance> {
	then<TResult1 = UserInstance, TResult2 = never>(
		onfulfilled?: ((value: UserInstance) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.#fetch().then(onfulfilled, onrejected)
	}

	async #fetch(): Promise<UserInstance> {
		const data = await this.client.request('users.info', { user: this.id })
		return new User(this.client, this.id, data.user) as UserInstance
	}
}

export class User extends UserMixin {
	#data: UserData

	constructor(client: App, id: string, data: UserData) {
		super(client, id)
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	get raw() {
		return this.#data
	}
}

export type UserInstance = User & UserData

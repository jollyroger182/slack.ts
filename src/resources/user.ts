import type { IMData } from '../api/types/conversation'
import type { NormalMessageData } from '../api/types/message'
import type { UserData as UserData } from '../api/types/user'
import type { App } from '../client'
import { makeProxy } from '../utils'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import type { DistributiveOmit } from '../utils/typing'
import { ChannelImpl } from './channel'
import { Message, type MessageInstance } from './message'

export class UserImpl {
	#data: UserData | undefined
	#id: string

	constructor(
		protected client: App,
		id: string,
		data?: UserData,
	) {
		this.#id = id
		this.#data = data
		return makeProxy(this, () => this.#data || {})
	}

	static create(client: App, id: string, data: UserData): User<UserData>
	static create(client: App, id: string, data?: undefined): User<undefined>
	static create(client: App, id: string, data?: UserData) {
		return new UserImpl(client, id, data)
	}

	get raw(): UserData | undefined {
		return this.#data
	}

	async fetch(): Promise<User<UserData>> {
		const { user } = await this.client.request('users.info', { user: this.id })
		return UserImpl.create(this.client, this.#id, user)
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
	): Promise<MessageInstance<NormalMessageData>>

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

	async im() {
		const { channel } = await this.client.request('conversations.open', {
			return_im: true,
			users: this.#id,
		})
		return ChannelImpl.create(this.client, channel.id, channel as IMData)
	}
}

export type User<Data extends UserData | undefined = undefined> = Data extends any
	? UserImpl & (Data extends undefined ? {} : Data & { readonly raw: Data })
	: never

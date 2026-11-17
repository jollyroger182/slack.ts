import { NotFoundError, type Types } from '..'
import { APIError, type Client } from '../client'
import { Conversation } from './conversation'

/** Reference to a user with a given `id`. */
export class UserRef {
	constructor(
		protected readonly client: Client,
		readonly id: string,
	) {}

	/**
	 * Opens an IM with the user.
	 *
	 * @returns The opened IM conversation.
	 */
	async openIM() {
		const resp = await this.client.request('conversations.open', {
			users: this.id,
			return_im: true,
		})
		return new Conversation(this.client, resp.channel as Types.IMChannel)
	}

	/**
	 * Fetches the user from Slack.
	 *
	 * @returns A complete {@link User} object.
	 */
	async fetch() {
		try {
			const resp = await this.client.request('users.info', { user: this.id })
			return new User(this.client, resp.user)
		} catch (e) {
			if (e instanceof APIError && e.error === 'user_not_found') {
				throw new NotFoundError(`User ${this.id} not found`)
			}
			throw e
		}
	}
}

/** A user on Slack. */
export class User extends UserRef {
	constructor(
		client: Client,
		readonly data: Types.User,
	) {
		super(client, data.id)
	}
}

import type { SlackAPIParams } from '../api'
import type { AppHomeOpenedEvent } from '../api/events'
import type { App } from '../client'
import { makeProxy } from '../utils'

export class HomeOpened {
	#data: AppHomeOpenedEvent

	constructor(
		private client: App,
		data: AppHomeOpenedEvent,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	get raw() {
		return this.#data
	}

	async respond(view: SlackAPIParams<'views.publish'>['view']) {
		return await this.client.request('views.publish', { user_id: this.#data.user, view })
	}
}

export type HomeOpenedInstance = HomeOpened & AppHomeOpenedEvent

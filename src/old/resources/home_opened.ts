import type { SlackAPIParams } from '../api/web'
import type { AppHomeOpenedEvent } from '../api/events'
import type { App } from '../client'
import { makeProxy } from '../utils'

export class HomeOpenedImpl {
	#data: AppHomeOpenedEvent

	constructor(
		private client: App,
		data: AppHomeOpenedEvent,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	static create(client: App, data: AppHomeOpenedEvent) {
		return new HomeOpenedImpl(client, data) as HomeOpened
	}

	get raw() {
		return this.#data
	}

	async respond(view: SlackAPIParams<'views.publish'>['view']) {
		return await this.client.request('views.publish', { user_id: this.#data.user, view })
	}
}

export type HomeOpened = HomeOpenedImpl & AppHomeOpenedEvent

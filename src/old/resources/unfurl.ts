import type { LinkSharedEvent } from '@slack/types'
import type { App } from '../client'
import { makeProxy } from '../utils'
import type { AttachmentData } from '../api'
import type { ChatUnfurlParams } from '../api/web/chat'

export class UnfurlImpl {
	#data: LinkSharedEvent

	constructor(
		protected client: App,
		data: LinkSharedEvent,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	static create(client: App, data: LinkSharedEvent) {
		return new UnfurlImpl(client, data) as Unfurl
	}

	get raw() {
		return this.#data
	}

	async respond(
		unfurls: Record<string, AttachmentData>,
		additionalParams: Partial<ChatUnfurlParams> = {},
	) {
		await this.client.request('chat.unfurl', {
			channel: this.#data.channel,
			ts: this.#data.message_ts,
			unfurls,
			...additionalParams,
		})
	}
}

export type Unfurl = UnfurlImpl & LinkSharedEvent

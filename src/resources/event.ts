import type { EventData, EventWrapper } from '../api'
import type { App } from '../client'
import { makeProxy } from '../utils'
import type { DistributiveOmit } from '../utils/typing'
import type { Channel } from './channel'
import type { User } from './user'

export class EventImpl<T extends EventData> {
	#data: EventWrapper<T>

	constructor(
		private client: App,
		data: EventWrapper<T>,
	) {
		this.#data = data
		const wrappedData: any = { ...this.#data.event }
		if (typeof wrappedData.user === 'string') {
			wrappedData.user = client.user(wrappedData.user)
		}
		if (typeof wrappedData.channel === 'string') {
			wrappedData.channel = client.channel(wrappedData.channel)
		}
		return makeProxy(this, () => wrappedData)
	}

	static create<T extends EventData>(client: App, data: EventWrapper<T>) {
		return new EventImpl(client, data) as Event<T>
	}

	get raw() {
		return this.#data
	}

	get payload() {
		return this.#data.event
	}
}

export type Event<T extends EventData = EventData> = T extends EventData
	? EventImpl<T> &
			DistributiveOmit<T, 'raw' | 'payload' | 'channel' | 'user'> & {
				readonly raw: EventWrapper<T>
				readonly payload: T
			} & (T extends { channel: string }
				? { readonly channel: Channel }
				: T extends { channel: string | undefined }
					? { readonly channel: Channel | undefined }
					: {}) &
			(T extends { user: string }
				? { readonly user: User }
				: T extends { user: string | undefined }
					? { readonly user: User | undefined }
					: {})
	: never

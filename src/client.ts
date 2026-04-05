import { sleep } from './utils'
import { ChannelRef } from './resources/channel'
import { SlackWebAPIError, SlackWebAPIPlatformError } from './error'
import {
	POST_METHODS,
	type SlackAPIMethod,
	type SlackAPIParams,
	type SlackAPIResponse,
} from './api'
import { SocketEventsReceiver, type SocketEventsReceiverOptions } from './events/receivers/socket'
import type { DistributiveOmit } from './utils/typing'
import type {
	AllEvents,
	AllEventTypes,
	EventsReceiver,
	EventWrapper,
	SlackEventMap,
} from './events/types'
import { DummyReceiver } from './events/receivers/dummy'
import { Message, type MessageInstance } from './resources/message'
import type { MessageEvent } from './events/types/events'
import type { AnyMessage } from './api/types/message'
import type {
	BlockAction,
	BlockActionMap,
	BlockActions,
	BlockActionTypes,
} from './api/interactive/block_actions'
import EventEmitter from 'events'

type ReceiverOptions =
	| ({
			type: 'socket'
	  } & DistributiveOmit<SocketEventsReceiverOptions, 'client'>)
	| {
			type: 'dummy'
			options?: never
	  }

interface AppOptions {
	token?: string
	receiver?: ReceiverOptions
}

export type MessageCallbackData = {
	message: MessageInstance
	client: App
	event: EventWrapper<MessageEvent>
}
export type MessageCallback = (data: MessageCallbackData) => unknown

export type EventCallbackData<Event extends AllEvents> = {
	client: App
	event: EventWrapper<Event>
}
export type EventCallback<Event extends AllEvents> = (data: EventCallbackData<Event>) => unknown

export type BlockActionCallbackData<Action extends BlockAction> = {
	action: Action
	client: App
	event: BlockActions
}
export type BlockActionCallback<Action extends BlockAction> = (
	data: BlockActionCallbackData<Action>,
) => unknown

export class App extends EventEmitter<AppEventMap> {
	#token?: string
	#receiver: EventsReceiver

	constructor({ token, receiver = { type: 'dummy' } }: AppOptions = {}) {
		super()
		this.#token = token
		switch (receiver.type) {
			case 'socket':
				this.#receiver = new SocketEventsReceiver({ ...receiver, client: this })
				break
			default:
				this.#receiver = new DummyReceiver()
		}
		this.#receiver.on('event', this.#onEvent.bind(this))
		this.#receiver.on('block_actions', this.#onBlockActions.bind(this))
	}

	async #onEvent(event: EventWrapper) {
		this.emit('event', event)
		this.emit(`event:${event.event.type}`, { payload: event.event as any, event: event as any })
	}

	async #onBlockActions(event: BlockActions) {
		this.emit('blockActions', event)
		for (const action of event.actions) {
			this.emit(`action:${action.type}`, { payload: action as any, event: event })
			this.emit(`action.${action.action_id}`, { payload: action, event: event })
			this.emit(`action:${action.type}.${action.action_id}`, {
				payload: action as any,
				event: event,
			})
		}
	}

	/**
	 * Registers a callback for `message` events.
	 *
	 * @param callback Function to execute when a new message is received
	 */
	message(callback: MessageCallback) {
		this.on('event:message', ({ event, payload }) => {
			callback({
				event,
				message: new Message<AnyMessage>(
					this,
					payload.channel,
					payload.ts,
					payload,
				) as MessageInstance,
				client: this,
			})
		})
	}

	/**
	 * Registers a callback for a given type of event.
	 *
	 * @param type Type of event to register
	 * @param callback Function to execute when the event is received
	 */
	event<Event extends AllEvents>(type: Event['type'], callback: EventCallback<Event>) {
		this.on(`event:${type}`, ({ event }) => {
			callback({ event: event as EventWrapper<Event>, client: this })
		})
	}

	/**
	 * Registers a callback for a given type of block actions.
	 *
	 * For more powerful callbacks, use `app.on('action:button', ...)`, `app.on('action.action_id',
	 * ...)`, or `app.on('action:button.action_id', ...)` instead.
	 *
	 * @param type Type of event to register
	 * @param callback Function to execute when the event is received
	 */
	action<Action extends BlockAction>(type: Action['type'], callback: BlockActionCallback<Action>) {
		this.on(`action:${type}`, ({ event, payload }) => {
			callback({ action: payload as Action, event, client: this })
		})
	}

	/**
	 * Starts the event receiver. If you don't use the events, interactions, and slash command APIs,
	 * you don't need to call this function.
	 */
	async start() {
		await this.#receiver.start()
	}

	/**
	 * Gets a channel reference object. You can use this object to call API methods, or `await` it to
	 * fetch channel details.
	 *
	 * @param id Channel ID
	 * @returns A channel reference object
	 */
	channel(id: string) {
		return new ChannelRef(this, id)
	}

	/**
	 * Makes a Slack Web API request.
	 *
	 * @param endpoint The Slack Web API method to call
	 * @param params The parameters for the method
	 * @param [method='GET'] The HTTP method for the request. Default is `'GET'`
	 * @returns The response from the API call
	 */
	async request<Method extends SlackAPIMethod>(
		endpoint: Method,
		params: SlackAPIParams<Method>,
		method: 'GET' | 'POST' = POST_METHODS.includes(endpoint) ? 'POST' : 'GET',
	): Promise<SlackAPIResponse<Method> & { ok: true }> {
		const body = method !== 'GET' ? JSON.stringify(params) : undefined

		const url = new URL(`https://slack.com/api/${endpoint}`)
		if (method === 'GET' && params) {
			for (const [key, value] of Object.entries(params)) {
				if (value instanceof Array) {
					for (const item of value) {
						url.searchParams.append(key, item)
					}
				} else if (value !== undefined && value !== null) {
					url.searchParams.set(key, String(value))
				}
			}
		}

		const headers = new Headers()
		if (body) {
			headers.append('Content-Type', 'application/json; charset=utf-8')
		}
		if (params.token || this.#token) {
			headers.set('Authorization', `Bearer ${params.token || this.#token}`)
		}

		const res = await request<SlackAPIResponse<Method>>(url.toString(), { method, body, headers })

		if (!res.ok) {
			throw new SlackWebAPIPlatformError(url.toString(), res, res.error)
		}

		return res
	}
}

type AppEventMap = {
	event: [EventWrapper]
	blockActions: [BlockActions]
	action: [{ payload: BlockAction; event: BlockActions }]
} & {
	[K in AllEventTypes as `event:${K}`]: [
		{ payload: SlackEventMap[K]; event: EventWrapper<SlackEventMap[K]> },
	]
} & {
	[K in BlockActionTypes as `action:${K}`]: [{ payload: BlockActionMap[K]; event: BlockActions }]
} & {
	[K in `action.${string}`]: [{ payload: BlockAction; event: BlockActions }]
} & {
	[K in BlockActionTypes as `action:${K}.${string}`]: [
		{ payload: BlockActionMap[K]; event: BlockActions },
	]
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
	const res = await fetch(url, options)

	if (res.status === 429) {
		const retryAfter = Number(res.headers.get('Retry-After') ?? 2)
		await sleep(retryAfter * 1000)
		return request(url, options)
	}

	if (!res.ok) throw new SlackWebAPIError(url, await res.json())

	return (await res.json()) as T
}

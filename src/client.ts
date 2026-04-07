import EventEmitter from 'events'
import {
	POST_METHODS,
	type SlackAPIMethod,
	type SlackAPIParams,
	type SlackAPIResponse,
} from './api'
import type { AllEvents, AllEventTypes, EventWrapper, SlackEventMap } from './api/events'
import type { MessageEvent } from './api/events/events'
import type {
	BlockAction,
	BlockActionMap,
	BlockActions,
	BlockActionTypes,
} from './api/interactive/block_actions'
import type { ViewSubmission } from './api/interactive/view_submission'
import type { AnyMessage, NormalMessage } from './api/types/message'
import { SlackWebAPIError, SlackWebAPIPlatformError } from './error'
import { DummyReceiver } from './receivers/dummy'
import { SocketEventsReceiver, type SocketEventsReceiverOptions } from './receivers/socket'
import { Action, type ActionInstance } from './resources/action'
import { ChannelRef } from './resources/channel'
import { Message, type MessageInstance } from './resources/message'
import { sleep } from './utils'
import type { DistributiveOmit } from './utils/typing'
import type { EventsReceiver } from './receivers/base'

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

export type BlockActionCallback<Type extends BlockAction> = (data: Action<Type>) => unknown

export class App extends EventEmitter<AppEventMap> {
	#token?: string
	#receiver: EventsReceiver

	constructor({ token, receiver = { type: 'dummy' } }: AppOptions = {}) {
		super({ captureRejections: true })
		this.on('error', this.#onCallbackError.bind(this))

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
		this.#receiver.on('view_submission', this.#onViewSubmission.bind(this))

		this.on('event:message', this.#onMessage.bind(this))
	}

	#onEvent(event: EventWrapper) {
		this.emit('event', event)
		this.emit(`event:${event.event.type}`, { payload: event.event as any, event: event as any })
	}

	#onBlockActions(event: BlockActions) {
		this.emit('actions', event)
		for (const action of event.actions) {
			const obj = new Action(this, action, event) as ActionInstance
			this.emit(`action:${action.type}`, obj as any)
			this.emit(`action.${action.action_id}`, obj)
			this.emit(`action:${action.type}.${action.action_id}`, obj as any)
		}
	}

	#onViewSubmission(event: ViewSubmission) {
		this.emit('submit', event)
		this.emit(`submit.${event.view.callback_id}`, event)
	}

	async #onCallbackError(error: any) {
		console.error('Error occurred executing callback')
		console.error(error)
	}

	#onMessage({ payload }: { payload: MessageEvent }) {
		const message = new Message<AnyMessage>(
			this,
			payload.channel,
			payload.ts,
			payload,
		) as MessageInstance
		this.emit('message', message)
		this.emit(`message:${payload.subtype ?? 'normal'}`, message as any)
		this.emit(`message:${payload.subtype ?? 'normal'}#${payload.channel}`, message as any)
		this.emit(`message#${payload.channel}`, message)
	}

	/**
	 * Registers a callback for `message` events.
	 *
	 * @deprecated Use `app.on('message', callback)` or `app.on('event:message', callback)`
	 * @param callback Function to execute when a new message is received
	 */
	message(callback: MessageCallback) {
		this.on('event:message', async ({ event, payload }) => {
			await callback({
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
	 * @deprecated Use `app.on('event:type', callback)` instead
	 * @param type Type of event to register
	 * @param callback Function to execute when the event is received
	 */
	event<Event extends AllEvents>(type: Event['type'], callback: EventCallback<Event>) {
		this.on(`event:${type}`, async ({ event }) => {
			await callback({ event: event as EventWrapper<Event>, client: this })
		})
	}

	/**
	 * Registers a callback for a given type of block actions.
	 *
	 * @deprecated Use `app.on('action:type', ...)`, `app.on('action.action_id', ...)`, or
	 *   `app.on('action:type.action_id', ...)` instead
	 * @param type Type of event to register
	 * @param callback Function to execute when the event is received
	 */
	action<Type extends BlockAction>(type: Type['type'], callback: BlockActionCallback<Type>) {
		this.on(`action:${type}`, async (action) => {
			await callback(action as unknown as ActionInstance<Type>)
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
	 * @param method The Slack Web API method to call
	 * @param params The parameters for the method
	 * @returns The response from the API call
	 */
	async request<Method extends SlackAPIMethod>(
		method: Method,
		params: SlackAPIParams<Method>,
	): Promise<Extract<SlackAPIResponse<Method>, { ok: true }>> {
		const httpMethod = POST_METHODS.includes(method) ? 'POST' : 'GET'
		const body = httpMethod !== 'GET' ? JSON.stringify(params) : undefined

		const url = new URL(`https://slack.com/api/${method}`)
		if (httpMethod === 'GET' && params) {
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

		const res = await request<SlackAPIResponse<Method>>(url.toString(), {
			method: httpMethod,
			body,
			headers,
		})

		if (!res.ok) {
			throw new SlackWebAPIPlatformError(url.toString(), res, res.error)
		}

		return res
	}
}

type AppEventMap = {
	event: [EventWrapper]
	actions: [BlockActions]
	action: [ActionInstance]
	submit: [ViewSubmission]
	message: [MessageInstance]
	'message:normal': [MessageInstance<NormalMessage>]
} & {
	[K in AllEventTypes as `event:${K}`]: [
		{ payload: SlackEventMap[K]; event: EventWrapper<SlackEventMap[K]> },
	]
} & {
	[K in BlockActionTypes as `action:${K}`]: [ActionInstance<BlockActionMap[K]>]
} & {
	[K in `action.${string}`]: [ActionInstance]
} & {
	[K in BlockActionTypes as `action:${K}.${string}`]: [ActionInstance<BlockActionMap[K]>]
} & {
	[K in `submit.${string}`]: [ViewSubmission]
} & {
	[K in `message#${string}`]: [MessageInstance]
} & {
	[K in Extract<AnyMessage, { subtype: string }> as `message:${K['subtype']}`]: [MessageInstance<K>]
} & {
	[K in Extract<AnyMessage, { subtype: string }> as `message:${K['subtype']}#${string}`]: [
		MessageInstance<K>,
	]
} & {
	[K in `message:normal#${string}`]: [MessageInstance<NormalMessage>]
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

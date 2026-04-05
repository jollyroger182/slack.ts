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
import type { AllEvents, AllEventTypes, EventsReceiver, EventWrapper } from './events/types'
import { DummyReceiver } from './events/receivers/dummy'
import { Message, type MessageInstance } from './resources/message'
import type { MessageEvent } from './events/types/events'
import type { AnyMessage } from './api/types/message'
import type { BlockAction, BlockActions, BlockActionTypes } from './api/interactive/block_actions'

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

type MessageCallbackData = {
	message: MessageInstance
	client: App
	event: EventWrapper<MessageEvent>
}
type MessageCallback = (data: MessageCallbackData) => unknown

type EventCallbackData<Event extends AllEvents> = {
	client: App
	event: EventWrapper<Event>
}
type EventCallback<Event extends AllEvents> = (data: EventCallbackData<Event>) => unknown

type BlockActionCallbackData<Action extends BlockAction> = {
	action: Action
	client: App
	payload: BlockActions
}
type BlockActionCallback<Action extends BlockAction> = (
	data: BlockActionCallbackData<Action>,
) => unknown

export class App {
	#token?: string
	#receiver: EventsReceiver

	private messageCallbacks: MessageCallback[] = []
	private eventCallbacks: { [K in AllEventTypes]?: EventCallback<AllEvents & { type: K }>[] } = {}
	private blockActionCallbacks: {
		[K in BlockActionTypes]?: BlockActionCallback<BlockAction & { type: K }>[]
	} = {}

	constructor({ token, receiver = { type: 'dummy' } }: AppOptions = {}) {
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

	async #onEvent<Event extends AllEvents = AllEvents>(event: EventWrapper<Event>) {
		const data: EventCallbackData<Event> = {
			client: this,
			event,
		}
		for (const callback of this.eventCallbacks[event.event.type] ?? []) {
			callback(data as any)
		}

		if (event.event.type === 'message') {
			const data: MessageCallbackData = {
				message: new Message<AnyMessage>(
					this,
					event.event.channel,
					event.event.ts,
					event.event,
				) as MessageInstance,
				client: this,
				event: event as EventWrapper<MessageEvent>,
			}
			for (const callback of this.messageCallbacks) {
				callback(data)
			}
		}
	}

	async #onBlockActions(payload: BlockActions) {
		for (const action of payload.actions) {
			const data: BlockActionCallbackData<any> = {
				action,
				client: this,
				payload,
			}
			for (const callback of this.blockActionCallbacks[action.type] ?? []) {
				callback(data)
			}
		}
	}

	/**
	 * Registers a callback for `message` events.
	 *
	 * @param callback Function to execute when a new message is received
	 */
	message(callback: MessageCallback) {
		this.messageCallbacks.push(callback)
	}

	/**
	 * Registers a callback for a given type of event.
	 *
	 * @param type Type of event to register
	 * @param callback Function to execute when the event is received
	 */
	event<Event extends AllEvents>(type: Event['type'], callback: EventCallback<Event>) {
		if (!this.eventCallbacks[type]) this.eventCallbacks[type] = []
		this.eventCallbacks[type]!.push(callback as any)
	}

	action<Action extends BlockAction>(type: Action['type'], callback: BlockActionCallback<Action>) {
		if (!this.blockActionCallbacks[type]) this.blockActionCallbacks[type] = []
		this.blockActionCallbacks[type]!.push(callback as any)
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

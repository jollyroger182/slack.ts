import { type SlackAPIMethod, type SlackAPIParams, type SlackAPIResponse } from './api'
import type {
	AllEvents,
	AllEventTypes,
	AppHomeOpenedEvent,
	EventWrapper,
	MessageEvent,
	SlackEventMap,
} from './api/events'
import type {
	BlockAction,
	BlockActionMap,
	BlockActions,
	BlockActionTypes,
} from './api/interactive/block_actions'
import type { BlockSuggestion } from './api/interactive/block_suggestion'
import type { ViewSubmission } from './api/interactive/view_submission'
import type { SlashCommandPayload } from './api/slash'
import type { IM, MPIM, PrivateChannel, PublicChannel } from './api/types/conversation'
import type { AnyMessage, NormalMessage } from './api/types/message'
import { BlockElementBuilder } from './blocks/elements/base'
import { SlackTimeoutError, SlackWebAPIError, SlackWebAPIPlatformError } from './error'
import type { BlockSuggestionResponder, EventsReceiver } from './receivers/base'
import { DummyReceiver } from './receivers/dummy'
import { HttpFetchReceiver, type HttpFetchReceiverOptions } from './receivers/fetch'
import { HttpServerReceiver, type HttpServerReceiverOptions } from './receivers/http'
import { SocketEventsReceiver, type SocketEventsReceiverOptions } from './receivers/socket'
import { Submission, type SubmissionInstance } from './resources'
import { Action, type ActionInstance } from './resources/action'
import { Autocomplete, type AutocompleteInstance } from './resources/autocomplete'
import { Channel, ChannelRef } from './resources/channel'
import { HomeOpened, type HomeOpenedInstance } from './resources/home_opened'
import { Message, type MessageInstance } from './resources/message'
import { SlashCommand, type SlashCommandInstance } from './resources/slash'
import { UserRef } from './resources/user'
import { sleep, type AnyToken } from './utils'
import { AsyncEventEmitter } from './utils/events'
import { paginate } from './utils/paginate'
import type { DistributiveOmit, DistributivePick } from './utils/typing'

type ReceiverOptions =
	| ({
			type: 'socket'
	  } & DistributiveOmit<SocketEventsReceiverOptions, 'client'>)
	| ({
			type: 'http'
	  } & DistributiveOmit<HttpServerReceiverOptions, 'client'>)
	| ({
			type: 'fetch'
	  } & DistributiveOmit<HttpFetchReceiverOptions, 'client'>)
	| {
			type: 'dummy'
			options?: never
	  }

interface AppOptions {
	token?: AnyToken
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

type ChannelTypeMap = {
	public_channel: PublicChannel
	private_channel: PrivateChannel
	mpim: MPIM
	im: IM
}

export class App extends AsyncEventEmitter<AppEventMap> {
	#token?: AnyToken
	#receiver: EventsReceiver

	constructor({ token, receiver = { type: 'dummy' } }: AppOptions = {}) {
		super()

		this.#token = token
		switch (receiver.type) {
			case 'socket':
				this.#receiver = new SocketEventsReceiver({ ...receiver, client: this })
				break
			case 'http':
				this.#receiver = new HttpServerReceiver({ ...receiver, client: this })
				break
			case 'fetch':
				this.#receiver = new HttpFetchReceiver({ ...receiver, client: this })
				break
			default:
				this.#receiver = new DummyReceiver()
		}
		this.#receiver.on('event', this.#onEvent.bind(this))
		this.#receiver.on('block_actions', this.#onBlockActions.bind(this))
		this.#receiver.on('block_suggestion', this.#onBlockSuggestion.bind(this))
		this.#receiver.on('view_submission', this.#onViewSubmission.bind(this))
		this.#receiver.on('slash_command', this.#onSlashCommand.bind(this))

		this.on('event:message', this.#onMessage.bind(this))
		this.on('event:app_home_opened', this.#onAppHomeOpened.bind(this))
	}

	async #onEvent(event: EventWrapper) {
		await Promise.all([
			this.emit('event', event),
			this.emit(`event:${event.event.type}`, {
				payload: event.event as any,
				event: event as any,
			}),
		])
	}

	async #onBlockActions(event: BlockActions) {
		await Promise.all(
			[this.emit('actions', event)].concat(
				event.actions.flatMap((action) => {
					const obj = new Action(this, action, event) as ActionInstance
					return [
						this.emit(`action`, obj),
						this.emit(`action:${action.type}`, obj as any),
						this.emit(`action.${action.action_id}`, obj),
						this.emit(`action:${action.type}.${action.action_id}`, obj as any),
					]
				}),
			),
		)
	}

	async #onBlockSuggestion(event: BlockSuggestion, responder: BlockSuggestionResponder) {
		const obj = new Autocomplete(this, event, responder) as AutocompleteInstance
		await Promise.all([
			this.emit('autocomplete', obj),
			this.emit(`autocomplete.${event.action_id}`, obj),
		])
	}

	async #onViewSubmission(event: ViewSubmission) {
		const obj = new Submission(this, event) as SubmissionInstance
		await Promise.all([
			this.emit('submit', obj),
			this.emit(`submit.${event.view.callback_id}`, obj),
		])
	}

	async #onSlashCommand(event: SlashCommandPayload) {
		const command = new SlashCommand(this, event) as SlashCommandInstance
		await Promise.all([
			this.emit('slash', command),
			this.emit(`/${event.command.substring(1)}`, command),
		])
	}

	async #onMessage({ payload }: { payload: MessageEvent }) {
		const message = new Message<AnyMessage>(
			this,
			payload.channel,
			payload.ts,
			payload,
		) as MessageInstance
		await Promise.all([
			this.emit('message', message),
			this.emit(`message:${payload.subtype ?? 'normal'}`, message as any),
			this.emit(`message:${payload.subtype ?? 'normal'}#${payload.channel}`, message as any),
			this.emit(`message#${payload.channel}`, message),
		])
	}

	async #onAppHomeOpened({ payload }: { payload: AppHomeOpenedEvent }) {
		const obj = new HomeOpened(this, payload) as HomeOpenedInstance
		await this.emit('home', obj)
	}

	get receiver() {
		return this.#receiver
	}

	/**
	 * Starts the event receiver. If you don't use the events, interactions, and slash command APIs,
	 * you don't need to call this function.
	 */
	async start() {
		await this.#receiver.start()
	}

	get wait() {
		return new AppWait(this)
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
	 * Gets a user reference object. You can use this object to call API methods, or `await` it to
	 * fetch user details.
	 *
	 * @param id User ID
	 * @returns A user reference object
	 */
	user(id: string) {
		return new UserRef(this, id)
	}

	/**
	 * Lists channels of the specified types.
	 *
	 * @param types Channel types to list (public_channel, private_channel, mpim, im)
	 * @returns An async generator that yields channel objects
	 */
	async *channels<Types extends ('public_channel' | 'private_channel' | 'mpim' | 'im')[]>(
		...types: Types
	): AsyncGenerator<Channel<ChannelTypeMap[Types[number]]>> {
		yield* paginate(this, 'conversations.list', { types: types.join(',') }, (r) =>
			r.channels.map((c) => new Channel(this, c.id, c as ChannelTypeMap[Types[number]])),
		)
	}

	async request<Method extends SlackAPIMethod>(
		method: Method,
		params: SlackAPIParams<Method>,
	): Promise<Extract<SlackAPIResponse<Method>, { ok: true }>>

	async request<Method extends string>(
		method: Method extends SlackAPIMethod ? never : Method,
		params: Record<string, unknown> & { token?: AnyToken },
	): Promise<{ ok: true } & Record<string, unknown>>

	/**
	 * Makes a Slack Web API request.
	 *
	 * This method can be used to call undocumented Slack API methods. Most of these methods require
	 * an `xoxd-` cookie and an `xoxc-` token, rather than the normal `xoxb-` and `xoxp-` tokens. You
	 * can obtain this cookie and token from a Slack browser session. Then, pass them in an object of
	 * the form `{ cookie: string; token: string }` to the `token` parameter.
	 *
	 * This method contains typings for some Slack API methods (broader support to come), as well as
	 * some undocumented methods (provided by the `slack-undoc-client` library). Use the undocumented
	 * endpoints at your own risk since they may break at any time.
	 *
	 * @param method The Slack Web API method to call
	 * @param params The parameters for the method
	 * @returns The response from the API call
	 */
	async request<Method extends SlackAPIMethod>(
		method: Method,
		params: SlackAPIParams<Method>,
	): Promise<Extract<SlackAPIResponse<Method>, { ok: true }>> {
		const body = new FormData()
		let hasBody = false
		for (const [key, value] of Object.entries(params)) {
			if (key === 'token') continue
			hasBody = true
			if (typeof value === 'string') {
				body.set(key, value)
			} else if (value !== undefined) {
				body.set(key, JSON.stringify(value))
			}
		}

		const url = `https://slack.com/api/${method}`

		const headers = new Headers()
		if (params.token || this.#token) {
			const token = params.token || this.#token
			if (typeof token === 'string') {
				headers.set('Authorization', `Bearer ${params.token || this.#token}`)
			} else if (token?.cookie && token?.token) {
				headers.set('Cookie', `d=${token.cookie}`)
				headers.set('Authorization', `Bearer ${token.token}`)
			}
		}

		const res = await request<SlackAPIResponse<Method>>(url, {
			method: 'POST',
			body: hasBody ? body : undefined,
			headers,
		})

		if (!res.ok) {
			throw new SlackWebAPIPlatformError(url, res, res.error)
		}

		return res
	}
}

type AppEventMap = {
	event: [EventWrapper]
	actions: [BlockActions]
	action: [ActionInstance]
	submit: [SubmissionInstance]
	message: [MessageInstance]
	'message:normal': [MessageInstance<NormalMessage>]
	slash: [SlashCommandInstance]
	autocomplete: [AutocompleteInstance]
	home: [HomeOpenedInstance]
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
	[K in `submit.${string}`]: [SubmissionInstance]
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
} & {
	[K in `/${string}`]: [SlashCommandInstance]
} & {
	[K in `autocomplete.${string}`]: [Autocomplete]
}

class AppWait {
	private _timeout = 60_0_000

	constructor(private client: App) {}

	/**
	 * Sets the timeout of the wait. A `SlackTimeoutError` will be thrown if no matching event occurs
	 * after the timeout. Set this to `0` to disable timeouts; i.e., methods will wait forever. (This
	 * is dangerous because it creates potential memory leaks!)
	 *
	 * By default, timeout is set to 10 minutes.
	 *
	 * @param timeout Timeout in milliseconds
	 * @returns `this` for chaining
	 */
	timeout(timeout: number) {
		this._timeout = timeout
		return this
	}

	async action<
		Actions extends (
			| BlockElementBuilder<{ type: BlockActionTypes; action_id: string }>
			| { type: BlockActionTypes; action_id: string }
		)[],
	>(...actions: Actions): Promise<ActionInstance<ExtractAction<Actions[number]>>> {
		const objs = actions.map((a) => (a instanceof BlockElementBuilder ? a.build() : a))

		return new Promise((resolve, reject) => {
			const cleanup = () => {
				for (const sub of subscriptions) {
					this.client.off(sub, callback)
				}
				if (timer) {
					clearTimeout(timer)
				}
			}

			const callback = (action: ActionInstance) => {
				cleanup()
				resolve(action)
			}

			const subscriptions: `action:${BlockActionTypes}.${string}`[] = []
			for (const obj of objs) {
				const key = `action:${obj.type}.${obj.action_id}` as const
				this.client.on(key, callback)
				subscriptions.push(key)
			}

			const timer: ReturnType<typeof setTimeout> | null = this._timeout
				? setTimeout(() => {
						cleanup()
						reject(new SlackTimeoutError(`Timed out waiting for action (${this._timeout} ms)`))
					}, this._timeout)
				: null
		})
	}
}

type ExtractAction<
	Action extends
		| BlockElementBuilder<{ type: string; action_id: string }>
		| { type: string; action_id: string },
> = BlockAction &
	DistributivePick<
		Action extends BlockElementBuilder<infer Output> ? Output : Action,
		'type' | 'action_id'
	>

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

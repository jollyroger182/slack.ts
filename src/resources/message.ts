import type { KnownBlock } from '@slack/types'
import type { BlockAction, BlockActionTypes } from '../api/interactive/block_actions'
import type { TimestampPaginationParams } from '../api/types/api'
import type { AnyMessage, NormalMessage } from '../api/types/message'
import type { App } from '../client'
import { SlackError, SlackTimeoutError } from '../error'
import { makeProxy } from '../utils'
import {
	sendMessage,
	type SendMessageParams,
	type SendMessageWithFiles,
	type SendMessageWithoutFiles,
} from '../utils/messaging'
import { paginate } from '../utils/paginate'
import type { DistributiveOmit, DistributivePick } from '../utils/typing'
import type { ActionInstance } from './action'
import { ChannelRef } from './channel'
import { UserRef } from './user'
import type { ActionsToPrefixedID, ExtractActions } from '../blocks/utils/extract'

interface FetchRepliesParams extends Omit<TimestampPaginationParams, 'limit'> {
	/**
	 * How many replies to fetch in each API call. This will not affect the number of returned
	 * messages.
	 */
	batch?: number

	/**
	 * How many replies to return in total.
	 *
	 * @default Infinity
	 */
	limit?: number

	/**
	 * Whether to include the root message in the results.
	 *
	 * @default true
	 */
	root?: boolean
}

class MessageMixin<Blocks extends KnownBlock[] = KnownBlock[]> {
	#channel: string
	#ts: string

	constructor(
		protected client: App,
		channel: string,
		ts: string,
	) {
		this.#channel = channel
		this.#ts = ts
	}

	/** The channel where this message was sent */
	get channel() {
		return new ChannelRef(this.client, this.#channel)
	}

	protected get _channelId() {
		return this.#channel
	}

	/** Timestamp of the message */
	get ts() {
		return this.#ts
	}

	protected get _threadTs(): string | undefined {
		return undefined
	}

	/**
	 * Waits for an event about this message to occur before continuing. To configure the wait object,
	 * see its methods (for example, `message.wait.timeout(60000)`).
	 */
	get wait() {
		return new MessageWait<Blocks>(this, this.client)
	}

	/**
	 * Sends a message as a reply to this messsage with files.
	 *
	 * @param message The message payload to send, including the files to upload. `text` will be
	 *   ignored if `blocks` are provided.
	 */
	async reply(
		message: DistributiveOmit<SendMessageWithFiles, 'channel' | 'thread_ts'>,
	): Promise<undefined>

	/**
	 * Sends a message as a reply to this messsage.
	 *
	 * @param message The message payload to send, either a mrkdwn-formatted string or an object.
	 * @returns The sent message
	 */
	async reply<Blocks extends KnownBlock[] = KnownBlock[]>(
		message: DistributiveOmit<SendMessageWithoutFiles<Blocks>, 'channel' | 'thread_ts'> | string,
	): Promise<MessageInstance<NormalMessage<Blocks>, Blocks>>

	async reply(message: DistributiveOmit<SendMessageParams, 'channel' | 'thread_ts'> | string) {
		if (typeof message === 'string') {
			message = { text: message }
		}
		const data = await sendMessage(this.client, {
			...message,
			channel: this.#channel,
			thread_ts: this._threadTs || this.#ts,
		})
		if (data) {
			return new Message(
				this.client,
				this.#channel,
				data.ts,
				data.message,
			) as MessageInstance<NormalMessage>
		}
	}

	/**
	 * Fetches replies in the thread of this message. Note that this method may return the root
	 * message by default; set `params.root` to `false` to skip it.
	 *
	 * @param params Options for fetching replies
	 * @returns An async iterator of messages, from oldest to newest
	 */
	async *replies(params: FetchRepliesParams = {}): AsyncGenerator<MessageInstance, void, unknown> {
		yield* paginate(
			this.client,
			'conversations.replies',
			{ channel: this.#channel, ts: this.#ts, ...params },
			(r) =>
				r.messages
					.values()
					.filter((m) => m.ts !== this.#ts || (params.root ?? true))
					.map((m) => new Message(this.client, this.#channel, m.ts, m) as MessageInstance),
		)
	}
}

export class MessageRef<
	Subtype extends AnyMessage = AnyMessage,
	Blocks extends KnownBlock[] = KnownBlock[],
>
	extends MessageMixin<Blocks>
	implements PromiseLike<Message<Subtype>>
{
	then<TResult1 = Message<Subtype>, TResult2 = never>(
		onfulfilled?:
			| ((value: Message<Subtype>) => TResult1 | PromiseLike<TResult1>)
			| null
			| undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.#fetch().then(onfulfilled, onrejected)
	}

	async #fetch(): Promise<Message<Subtype>> {
		const data = await this.client.request('conversations.replies', {
			channel: this._channelId,
			ts: this.ts,
			latest: this.ts,
			oldest: this.ts,
			inclusive: true,
		})
		if (!data.messages.length) {
			throw new SlackError('Message is not found')
		}
		return new Message(
			this.client,
			this._channelId,
			this.ts,
			data.messages[0] as Subtype,
		) as MessageInstance<Subtype>
	}
}

export class Message<
	Subtype extends AnyMessage = AnyMessage,
	Blocks extends KnownBlock[] = KnownBlock[],
> extends MessageMixin<Blocks> {
	#data: Subtype

	constructor(client: App, channel: string, ts: string, data: Subtype) {
		super(client, channel, ts)
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	/** @returns Whether this message is a normal message (subtype is undefined) */
	isNormal(): this is MessageInstance<NormalMessage> {
		return !this.#data.subtype
	}

	/** The raw data of this message */
	get raw() {
		return this.#data
	}

	/**
	 * A reference to the user that created the message. Note that for system messages (such as
	 * channel join messages), this may not be the user you expect. Read the Slack documentation to
	 * find out.
	 */
	get author(): undefined extends Subtype['user'] ? UserRef | undefined : UserRef {
		return this.#data.user ? new UserRef(this.client, this.#data.user) : (undefined as any)
	}

	protected override get _threadTs(): string | undefined {
		return this.#data.thread_ts
	}
}

export type MessageInstance<
	Subtype extends AnyMessage = AnyMessage,
	Blocks extends KnownBlock[] = KnownBlock[],
> = Message<Subtype, Blocks> & Subtype

class MessageWait<Blocks extends KnownBlock[] = KnownBlock[]> {
	private _timeout = 60_0_000

	constructor(
		private message: MessageMixin<Blocks>,
		private client: App,
	) {}

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

	/**
	 * Waits for a block action on this message happened (e.g., a button is pressed).
	 *
	 * The parameters can be any of any of the following:
	 *
	 * - An action ID; for example, `'place_order'`.
	 * - An event type and an action ID joined with a dot (`.`); for example, `'button.place_order'`.
	 *   The benefit of using this instead of a plain action ID is, if all string parameters have an
	 *   event type prefix, the return type of this function will be automatically narrowed to only
	 *   the possible action types.
	 * - A function (`async` or not) that takes in an action and returns `false` if this action should
	 *   be ignored (useful for permission checks).
	 *
	 * An action is matched if its container is this message, its `action_id` is one of the parameters
	 * passed in (or any `action_id` if no strings are passed in), and it passes all the function
	 * checks.
	 *
	 * @param specifiers An array of specifiers (see above for their format)
	 * @returns The action that occurred that matches the specifiers.
	 * @throws `SlackTimeoutError` if timed out before a matched event occurred
	 */
	async action<ActionIDs extends (ActionsToPrefixedID<ExtractActions<Blocks>> | ActionPredicate)[]>(
		...specifiers: ActionIDs
	) {
		return new Promise<
			ExtractActionWaitReturnValue<ExtractString<ActionIDs[number]>, ExtractActions<Blocks>>
		>((resolve, reject) => {
			const predicates: ActionPredicate[] = []

			const cleanup = () => {
				if (timer) {
					clearTimeout(timer)
				}
				for (const name of subscriptions) {
					this.client.off(name as any, callback)
				}
			}

			const callback = async (action: ActionInstance) => {
				const { event } = action
				if (
					(event.container.type === 'message' || event.container.type === 'message_attachment') &&
					event.container.message_ts === this.message.ts &&
					!(await Promise.all(predicates.map((predicate) => predicate(action)))).filter((v) => !v)
						.length
				) {
					cleanup()
					resolve(action as any)
				}
			}

			const subscriptions: string[] = []
			for (const specifier of specifiers) {
				if (typeof specifier === 'string') {
					this.client.on(`action.${specifier as string}`, callback)
					subscriptions.push(`action.${specifier}`)

					const index = specifier.indexOf('.')
					if (index >= 0) {
						const type = specifier.substring(0, index)
						const actionId = specifier.substring(index + 1)
						this.client.on(`action:${type as BlockActionTypes}.${actionId}`, callback)
						subscriptions.push(`action:${type}.${actionId}`)
					}
				} else {
					predicates.push(specifier)
				}
			}
			if (!subscriptions.length) {
				console.warn(
					"[MessageWait.action] warning: no action_id is passed. it is recommended to pass a list of action_id's to reduce the number of events that needs to be processed.",
				)
				this.client.on('action', callback)
				subscriptions.push('action')
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

type ActionPredicate = (action: ActionInstance) => boolean | Promise<boolean>

type DistributeAction<T extends BlockAction> = T extends any ? ActionInstance<T> : never

type ExtractActionWaitReturnValue<
	ActionID extends string,
	Action extends { type: string; action_id?: string },
> = DistributeAction<ExtractWaitActionType<ActionID, Action>>

type ExtractWaitActionType<
	Specifier extends string,
	Action extends { type: string; action_id?: string },
> = {
	[K in Specifier]: BlockAction & Action & ExtractTypeAndActionID<Specifier>
}[Specifier]

type ExtractTypeAndActionID<T extends string> =
	T extends `${infer Type extends BlockActionTypes}.${infer ActionID}`
		? { type: Type; action_id: ActionID }
		: { action_id: T }

type ExtractString<T> = T extends string ? T : never

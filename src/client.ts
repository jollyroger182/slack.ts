import type { Receiver } from './receivers/base'
import type { Action, ActionOf, KnownAction } from './types/blocks/elements'
import type { Event as SlackEvent, EventWrapper, KnownEvent } from './types/events'
import type { BlockActions, ElementMap } from './types/interactions'
import type { MethodMap, OptionalParamMethods } from './types/methods'
import { AsyncEventEmitter } from './utils/events'
import { request } from './utils/request'
import type { KnownKeys } from './utils/types'

function ensureUrlEncoded(text: string) {
	return encodeURIComponent(decodeURIComponent(text))
}

export interface ClientConfig<R extends Receiver = any> {
	/**
	 * A receiver that emits events sent by Slack. Common receivers include the HTTP server receiver
	 * and the socket mode receiver.
	 */
	receiver?: R

	/**
	 * A team ID. Required when using an `xoxd-` session token that is signed in to multiple Slack
	 * workspaces.
	 */
	team?: string
}

/** A client for making Slack Web API requests. */
export class Client<R extends Receiver = any> extends AsyncEventEmitter<ClientEventMap> {
	#token: string | { token: string; cookie: string }

	private team?: string

	receiver?: R

	/**
	 * Creates a new Slack client.
	 *
	 * @param token A Slack token. Can be a string that starts with `xoxb-` (bot token), `xoxp-` (user
	 *   OAuth token), or `xoxd-` (session cookie); or a object like `{ token: 'xoxc-...', cookie:
	 *   'xoxd-...' }`.
	 * @param config Optional configuration for the client.
	 */
	constructor(token: string | { token: string; cookie: string }, config?: ClientConfig<R>) {
		super()

		if (
			typeof token === 'object' &&
			(!token.cookie.startsWith('xoxd-') || !token.token.startsWith('xoxc-'))
		) {
			throw new Error(
				"Object tokens must be of the shape { token: 'xoxc-...', cookie: 'xoxd-...' }",
			)
		}

		if (typeof token === 'string' && !/^xox[dpb]\-/.test(token)) {
			throw new Error('String tokens can only start with xoxb-, xoxp- or xoxd-')
		}

		this.#token = token

		this.team = config?.team

		if (config?.receiver) {
			this.receiver = config.receiver
			config.receiver.on('event', this.#onEvent.bind(this))
			config.receiver.on('actions', (actions) =>
				this.#onActions(actions as BlockActions<KnownAction>),
			)
		}
	}

	start() {
		return this.receiver?.start(this)
	}

	stop() {
		return this.receiver?.stop()
	}

	async #onEvent(wrapper: EventWrapper<SlackEvent>) {
		const event = wrapper.event as KnownEvent
		await Promise.all([
			this.emit('event', event, wrapper as EventWrapper<KnownEvent>),
			this.emit(`event:${event.type}`, event as never, wrapper as never),
		])
	}

	async #onActions(actions: BlockActions<KnownAction>) {
		await Promise.all(
			actions.actions.flatMap((a) => [
				this.emit('action', a, actions),
				this.emit(`action:${a.type}`, a as never, actions),
				this.emit(`action.${a.action_id}`, a as never, actions),
			]),
		)
	}

	#tokenPromise?: Promise<{ token: string; cookie?: string }>

	get token(): Promise<{ token: string; cookie?: string }> {
		if (this.#tokenPromise) return this.#tokenPromise

		if (typeof this.#token === 'object') {
			return (this.#tokenPromise = Promise.resolve({
				token: this.#token.token,
				cookie: `d=${ensureUrlEncoded(this.#token.cookie)}`,
			}))
		}

		if (this.#token.startsWith('xoxb-') || this.#token.startsWith('xoxp-')) {
			return (this.#tokenPromise = Promise.resolve({ token: this.#token }))
		}

		const getXoxcToken = async (xoxd: string) => {
			const encodedXoxd = ensureUrlEncoded(xoxd)

			const resp = await fetch(`https://app.slack.com/auth?app=client&iframe=1`, {
				headers: { Cookie: `d=${encodedXoxd}` },
			})
			if (!resp.ok) {
				this.#tokenPromise = undefined
				throw new Error(`Failed to fetch xoxc token: Slack returned status code ${resp.status}`)
			}

			const body = await resp.text()
			const match = body.match(/sessionStorage\.incomingConfig = JSON\.stringify\((.+)\)/)
			if (!match) {
				this.#tokenPromise = undefined
				throw new Error('Failed to fetch xoxc token: Slack returned unknown auth page format')
			}

			const payload = JSON.parse(match[1]!) as any
			if (
				!payload ||
				typeof payload !== 'object' ||
				!payload.teams ||
				typeof payload.teams !== 'object'
			) {
				this.#tokenPromise = undefined
				throw new Error('Failed to fetch xoxc token: Slack returned unknown auth payload format')
			}

			const teams = Object.entries(payload.teams as Record<string, any>).filter(
				([, team]) =>
					team &&
					typeof team === 'object' &&
					!team.enterprise_api_token &&
					typeof team.token === 'string',
			)
			if (teams.length > 1 && !this.team) {
				throw new Error(
					'Failed to fetch xoxc token: The provided token is signed in to multiple Slack workspaces; the `team` option is required',
				)
			}

			if (this.team && !teams.find(([id]) => id === this.team)) {
				throw new Error(`Failed to fetch xoxc token: The specified team ID is not found`)
			}

			const team = (this.team ? teams.find(([id]) => id === this.team) : teams[0])![1]
			return { cookie: `d=${encodedXoxd}`, token: team.token }
		}

		return (this.#tokenPromise = getXoxcToken(this.#token))
	}

	async request<M extends OptionalParamMethods | (string & {})>(
		method: M,
		params?: (M extends keyof MethodMap ? MethodMap[M]['params'] : Record<string, unknown>) & {
			token?: string | { token: string; cookie: string }
		},
	): Promise<
		(M extends keyof MethodMap ? MethodMap[M]['response'] : Record<string, unknown>) & { ok: true }
	>

	async request<M extends keyof MethodMap>(
		method: M,
		params: MethodMap[M]['params'] & {
			token?: string | { token: string; cookie: string }
		},
	): Promise<MethodMap[M]['response'] & { ok: true }>

	/**
	 * Makes a Slack Web API request.
	 *
	 * @param method The request method name.
	 * @param params The parameters. The `token` parameter will override the token set on the client
	 *   object; it must be either an `xoxb-` or `xoxp-` token, or a `{ token: 'xoxc-...', cookie:
	 *   'xoxd-...' }` object. A raw `xoxd-` token is not allowed.
	 */
	async request(
		method: string,
		params: Record<string, unknown> & {
			token?: string | { token: string; cookie: string }
		} = {},
	): Promise<Record<string, unknown> & { ok: true }> {
		const { token: overrideToken, ...realParams } = params

		if (typeof overrideToken === 'string' && !/^xox[bp]\-/.test(overrideToken)) {
			throw new Error('String tokens can only start with xoxb- or xoxp-')
		}

		if (
			typeof overrideToken === 'object' &&
			(!overrideToken.cookie.startsWith('xoxd-') || !overrideToken.token.startsWith('xoxc-'))
		) {
			throw new Error(
				"Object tokens must be of the shape { token: 'xoxc-...', cookie: 'xoxd-...' }",
			)
		}

		const token =
			typeof overrideToken === 'string'
				? { token: overrideToken }
				: overrideToken
					? { token: overrideToken.token, cookie: `d=${ensureUrlEncoded(overrideToken.cookie)}` }
					: await this.token

		const body = new FormData()
		let hasBody = false
		for (const [key, value] of Object.entries(realParams)) {
			if (value === undefined) continue
			hasBody = true
			if (typeof value === 'string' || value instanceof Blob) {
				body.set(key, value)
			} else {
				body.set(key, JSON.stringify(value))
			}
		}

		const headers: Record<string, string> = { Authorization: `Bearer ${token.token}` }

		if (token.cookie) {
			headers['Cookie'] = token.cookie
		}

		const resp = await request(`https://slack.com/api/${method}`, {
			method: 'POST',
			headers,
			body: hasBody ? body : undefined,
		})

		if (!resp.ok) {
			let payload
			let error = 'slack_ts_unknown_error'
			try {
				payload = (await resp.clone().json()) as any
				if (typeof payload === 'object' && payload && payload?.error) {
					error = payload.error
				}
			} catch {}
			throw new APIError(
				`Received ${resp.status} status code for ${method}: ${error}`,
				method,
				error,
				payload,
			)
		}

		const payload = (await resp.json()) as
			{ ok: false; error?: string } | ({ ok: true } & Record<string, unknown>)

		if (!payload.ok) {
			const error = payload.error || 'slack_ts_unknown_error'
			throw new APIError(`Error for ${method}: ${error}`, method, error, payload)
		}

		return payload as any
	}
}

type EventArgs<E extends SlackEvent> = [event: E, wrapper: EventWrapper<E>]
type ActionArgs<A extends Action> = [action: A, wrapper: BlockActions<KnownAction>]

type KnownActionID = [KnownKeys<ElementMap>] extends [never] ? string : KnownKeys<ElementMap>

export type ClientEventMap = {
	event: EventArgs<KnownEvent>
	action: ActionArgs<KnownAction>
} & {
	[K in KnownEvent['type'] as `event:${K}`]: EventArgs<Extract<KnownEvent, { type: K }>>
} & {
	[K in KnownAction['type'] as `action:${K}`]: ActionArgs<Extract<KnownAction, { type: K }>>
} & {
	[K in KnownActionID as `action.${K}`]: ActionArgs<
		[KnownKeys<ElementMap>] extends [never] ? KnownAction : ActionOf<ElementMap[K]>
	>
}

export class APIError extends Error {
	constructor(
		message: string,
		public method: string,
		public error: string,
		public response: any,
	) {
		super(message)
	}
}

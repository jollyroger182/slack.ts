import WebSocket from 'ws'
import { EVENT_TYPES, type EventData, type EventWrapper } from '../api/events'
import type { App } from '../client'
import { SlackError, SlackTimeoutError } from '../error'
import type { User } from '../resources'
import {
	DEFAULT_CONNECT_TIMEOUT,
	DEFAULT_MAX_RECONNECT_DELAY,
	reconnectDelay,
	sleep,
} from '../utils'
import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'

export interface RTMReceiverOptions {
	client: App
	token: { cookie: string; token: string }
	/** How long to wait for the websocket handshake before giving up. Defaults to 30s. */
	connectTimeout?: number
	/** Ceiling for the reconnect backoff. Defaults to 30s. */
	maxReconnectDelay?: number
}

export class RTMReceiver
	extends AsyncEventEmitter<ReceiverEventMap & RTMEventEmitterMap>
	implements EventsReceiver
{
	#client: App
	#token: { cookie: string; token: string }

	#reconnectUrl?: string

	#ws?: WebSocket
	#pingInterval?: ReturnType<typeof setInterval>
	#id = 1
	#shouldConnect: boolean = false
	#connecting: boolean = false
	#connectTimeout: number
	#maxReconnectDelay: number

	constructor({
		client,
		token,
		connectTimeout = DEFAULT_CONNECT_TIMEOUT,
		maxReconnectDelay = DEFAULT_MAX_RECONNECT_DELAY,
	}: RTMReceiverOptions) {
		super()
		this.#client = client
		this.#token = token
		this.#connectTimeout = connectTimeout
		this.#maxReconnectDelay = maxReconnectDelay
	}

	async start() {
		this.#shouldConnect = true
		return this._syncConnect()
	}

	async stop() {
		this.#shouldConnect = false
		if (this.#pingInterval) {
			clearInterval(this.#pingInterval)
			this.#pingInterval = undefined
		}
		return new Promise<void>((resolve, reject) => {
			const ws = this.#ws
			this.#ws = undefined

			if (!ws || ws.readyState === WebSocket.CLOSED) {
				return resolve()
			}
			if (ws.readyState !== WebSocket.OPEN) {
				// aborting a handshake that never completed emits neither close nor error,
				// so waiting on either one here would hang
				ws.terminate()
				return resolve()
			}

			ws.once('close', () => resolve())
			ws.once('error', (error) => reject(error))
			ws.close()
		})
	}

	async subscribe(...users: (string | User)[]) {
		if (this.#ws?.readyState !== WebSocket.OPEN) {
			throw new SlackError('Connection is not open')
		}
		const ids = users.map((u) => (typeof u === 'string' ? u : u.id))
		this.#ws?.send(JSON.stringify({ type: 'presence_sub', ids }))
	}

	async presence(
		timeout: number,
		...users: (string | User)[]
	): Promise<Record<string, 'away' | 'active'>>
	async presence(
		firstUser: string | User,
		...users: (string | User)[]
	): Promise<Record<string, 'away' | 'active'>>

	async presence(first: number | string | User, ...users: (string | User)[]) {
		let timeout: number = 10000
		if (typeof first === 'number') {
			timeout = first
		} else {
			users.splice(0, 0, first)
		}

		const ids = users.map((u) => (typeof u === 'string' ? u : u.id))

		return new Promise((resolve, reject) => {
			const ws = this.#ws

			if (ws?.readyState !== WebSocket.OPEN) {
				throw new SlackError('Connection is not open')
			}

			const cleanup = () => {
				this.off('presence_change', callback)
				clearTimeout(timer)
			}

			const timer = setTimeout(() => {
				cleanup()
				reject(new SlackTimeoutError('Timed out waiting for presence event'))
			}, timeout)

			const gotUsers: Record<string, 'active' | 'away'> = {}
			const callback = (event: PresenceChangeEvent) => {
				const batch = event.users ?? [event.user]
				for (const id of batch) {
					if (ids.includes(id)) {
						gotUsers[id] = event.presence
					}
				}
				if (ids.every((u) => gotUsers[u])) {
					cleanup()
					resolve(gotUsers)
				}
			}

			this.on('presence_change', callback)

			ws.send(JSON.stringify({ type: 'presence_query', ids }))
		})
	}

	async send<T = { ok: true; reply_to: number }>(data: Record<string, unknown>): Promise<T> {
		const id = this.#id++
		data.id = id
		return new Promise((resolve, reject) => {
			this.once(`replied.${id}`, (data) => {
				if (data.ok) resolve(data as T)
				else reject(data)
			})
			this.#ws?.send(JSON.stringify(data))
		})
	}

	private async _syncConnect(): Promise<void> {
		// a single owner keeps overlapping close and error events from racing two
		// connections, each with its own backoff
		if (this.#connecting) return
		this.#connecting = true

		try {
			let attempt = 0
			while (this.#shouldConnect) {
				console.debug('[rtm] attempting connection to slack')
				try {
					await this._connect()
					return
				} catch (error) {
					const delay = reconnectDelay(attempt++, this.#maxReconnectDelay)
					console.error(`[rtm] connection failed, retrying in ${delay}ms`)
					console.error(error)
					await sleep(delay)
				}
			}
		} finally {
			this.#connecting = false
		}
	}

	private async _connect() {
		let url: URL
		if (this.#reconnectUrl) {
			url = new URL(this.#reconnectUrl)
			this.#reconnectUrl = undefined
		} else {
			const { primary_websocket_url } = await this.#client.request('client.getWebSocketURL', {})
			url = new URL(primary_websocket_url)
			url.searchParams.set('token', this.#token.token)
		}

		return new Promise<void>((resolve, reject) => {
			this.#ws = new WebSocket(url.toString(), { headers: { cookie: `d=${this.#token.cookie}` } })

			// a handshake that stalls emits neither open nor error, so without this the
			// receiver goes quiet for good while the process stays healthy
			const timer = setTimeout(() => {
				console.error('[rtm] connection attempt timed out')
				this.#ws?.terminate()
				reject(new SlackTimeoutError('Timed out opening the rtm websocket'))
			}, this.#connectTimeout)

			this.#ws.addEventListener('open', this.#onOpen.bind(this))
			this.#ws.addEventListener('message', this.#onMessage.bind(this))
			this.#ws.once('open', () => {
				clearTimeout(timer)
				this.#ws?.addEventListener('close', this.#onClose.bind(this))
				this.#ws?.addEventListener('error', this.#onError.bind(this))
				resolve()
			})
			this.#ws.on('error', (error) => {
				clearTimeout(timer)
				reject(error)
			})

			if (!this.#pingInterval) {
				this.#pingInterval = setInterval(this.#sendPing.bind(this), 44000)
			}
		})
	}

	#sendPing() {
		if (this.#ws?.readyState === WebSocket.OPEN) {
			this.#ws.send(JSON.stringify({ type: 'ping', time: Date.now() }))
		}
	}

	#onOpen() {
		console.debug('[rtm] websocket connected')
	}

	#onMessage(event: WebSocket.MessageEvent) {
		if (typeof event.data === 'string') {
			try {
				const payload = JSON.parse(event.data.replaceAll('\0', '')) as RTMEvent

				if (payload.type === 'pong') {
					const pingTime = payload.time
					const rtt = Date.now() - pingTime
					console.debug('[rtm] ping took', rtt, 'ms')
				} else if (payload.type === 'error') {
					console.error('[rtm] error received:', payload.error)
				} else if (payload.type === 'reconnect_url') {
					console.debug('[rtm] got new reconnect_url', payload.url)
					this.#reconnectUrl = payload.url
				} else if (payload.type === 'hello') {
					console.debug('[rtm] received hello event from', payload.region)
				} else if (payload.type && isSlackEvent(payload)) {
					this.emit('event', makeEventWrapper(payload))
				} else if (payload?.type) {
					this.emit(payload.type, payload as any)
				} else if (payload.reply_to) {
					this.emit('replied', payload)
					this.emit(`replied.${payload.reply_to}`, payload)
				} else {
					console.warn('[rtm] unknown payload')
					console.warn(payload)
				}
			} catch (e) {
				console.error('[rtm] error parsing received message')
				console.error(e)
			}
		}
	}

	#onClose(event: WebSocket.CloseEvent) {
		console.debug('[rtm] websocket closed with code', event.code, event.reason)
		this._syncConnect()
	}

	#onError(event: WebSocket.ErrorEvent) {
		console.error('[rtm] websocket error', event.message)
		console.error(event.error)
		// closing here fires #onClose, which is what reconnects
		this.#ws?.close()
	}
}

function isSlackEvent(event: { type: string }): event is EventData {
	return (EVENT_TYPES as readonly string[]).includes(event.type)
}

export interface BotAddedEvent {
	type: 'bot_added'
}

export interface BotChangedEvent {
	type: 'bot_changed'
}

export interface ChannelJoinedEvent {
	type: 'channel_joined'
}

export interface ChannelMarkedEvent {
	type: 'channel_marked'
	channel: string
	event_ts: string
	ts: string
	unread_count: number
	unread_count_display: number
	num_mentions: number
	num_mentions_display: number
	mention_count: number
	mention_count_display: number
	vip_count: number
}

export interface CommandsChangedEvent {
	type: 'commands_changed'
	event_ts: string
	commands_updated: { usage: string; desc: string; name: string; type: 'app'; app: string }[]
	commands_removed: { name: string; type: 'app'; app: string }[]
}

export interface ErrorEvent {
	type: 'error'
	error: { msg: string; code: number; source: string }
}

export interface GoodbyeEvent {
	type: 'goodbye'
}

export interface HelloEvent {
	type: 'hello'
	fast_reconnect: boolean
	region: string
	start: boolean
	host_id: string
}

export interface IMMarkedEvent {
	type: 'im_marked'
	channel: string
	ts: string
	dm_count: number
	unread_count_display: number
	num_mentions_display: number
	mention_count_display: number
	vip_count: number
	event_ts: string
}

export interface ManualPresenceChangeEvent {
	type: 'manual_presence_change'
	presence: 'away' | 'active'
	event_ts: string
}

export interface PrefChangeEvent {
	type: 'pref_change'
	name: string
	value: unknown
	event_ts: string
}

export type PresenceChangeEvent = {
	type: 'presence_change'
	user?: string
	users?: string[]
	presence: 'active' | 'away'
	event_ts: string
} & ({ user: string; users?: never } | { users: string[]; user?: never })

export interface PongEvent {
	type: 'pong'
	time: number
}

export interface ReconnectURLEvent {
	type: 'reconnect_url'
	url: string
}

export interface TeamMigrationStartedEvent {
	type: 'team_migration_started'
	event_ts: string
}

export interface TeamPlanChangeEvent {
	type: 'team_plan_change'
	plan: string
	can_add_ura: boolean
	paid_features: string[]
	event_ts: string
}

export interface TeamPrefChangeEvent {
	type: 'team_pref_change'
	name: string
	value: unknown
	enterprise_id?: string
	org_policy?: string
	event_ts: string
}

export interface UserTypingEvent {
	type: 'user_typing'
	channel: string
	user: string
	thread_ts?: string
}

export type RTMEvent =
	| BotAddedEvent
	| BotChangedEvent
	| ChannelJoinedEvent
	| ChannelMarkedEvent
	| CommandsChangedEvent
	| ErrorEvent
	| GoodbyeEvent
	| HelloEvent
	| IMMarkedEvent
	| ManualPresenceChangeEvent
	| PrefChangeEvent
	| PresenceChangeEvent
	| PongEvent
	| ReconnectURLEvent
	| TeamMigrationStartedEvent
	| TeamPlanChangeEvent
	| TeamPrefChangeEvent
	// | TeamProfileChangeEvent
	// | TeamProfileDeleteEvent
	// | TeamProfileReorderEvent
	| UserTypingEvent
	| Extract<EventData, { type: (typeof SLACK_RTM_API_EVENTS)[number] }>
	| { ok: boolean; reply_to: number; type?: undefined }
// not planned
// | ExternalOrgMigrationFinishedEvent
// | ExternalOrgMigrationStartedEvent
// | GroupJoinedEvent
// | GroupMarkedEvent

export type RTMEventEmitterMap = {
	[K in Exclude<RTMEvent, EventData | { reply_to: number }> as K['type']]: [K]
} & {
	replied: [{ ok: boolean; reply_to: number } & Record<string, unknown>]
} & {
	[K in number as `replied.${K}`]: [{ ok: boolean; reply_to: K } & Record<string, unknown>]
}

export const SLACK_RTM_API_EVENTS = [
	// unique to RTM
	'bot_added',
	'bot_changed',
	'channel_joined',
	'channel_marked',
	'commands_changed',
	'goodbye',
	'group_joined',
	'group_marked',
	'hello',
	'im_marked',
	'manual_presence_change',
	'pref_change',
	'presence_change',
	'reconnect_url',
	'team_migration_started',
	'team_plan_change',
	'team_pref_change',
	'team_profile_change',
	'team_profile_delete',
	'team_profile_reorder',
	'user_typing',

	// shared with events api
	'channel_created',
	'channel_deleted',
	'channel_history_changed',
	'channel_left',
	'channel_rename',
	'channel_unarchive',
	'dnd_updated_user',
	'dnd_updated',
	'email_domain_changed',
	'emoji_changed',
	'file_change',
	'file_created',
	'file_deleted',
	'file_public',
	'file_shared',
	'file_unshared',
	'group_archive',
	'group_close',
	'group_deleted',
	'group_history_changed',
	'group_left',
	'group_open',
	'group_rename',
	'group_unarchive',
	'im_close',
	'im_created',
	'im_history_changed',
	'im_open',
	'member_joined_channel',
	'member_left_channel',
	'message',
	'pin_added',
	'pin_removed',
	'reaction_added',
	'reaction_removed',
	'star_added',
	'star_removed',
	'subteam_created',
	'subteam_members_changed',
	'subteam_self_added',
	'subteam_self_removed',
	'subteam_updated',
	'team_domain_change',
	'team_join',
	'team_rename',
	'user_change',
	'user_connection',
	'user_huddle_changed',
] as const

function makeEventWrapper<Event extends EventData>(event: Event): EventWrapper<Event> {
	return {
		type: 'event_callback',
		token: '',
		team_id: '',
		api_app_id: '',
		event,
		event_context: '',
		event_id: '',
		event_time: 0,
		authorizations: [],
		is_ext_shared_channel: false,
		context_team_id: '',
		context_enterprise_id: null,
	}
}

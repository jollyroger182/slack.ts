import WebSocket from 'ws'
import type { App } from '../client'
import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'
import { SLACK_EVENT_TYPES, type AllEvents, type EventWrapper } from '../api/events'

export interface RTMReceiverOptions {
	client: App
	token: { cookie: string; token: string }
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

	constructor({ client, token }: RTMReceiverOptions) {
		super()
		this.#client = client
		this.#token = token
	}

	async start() {
		return this._syncConnect()
	}

	async stop() {
		if (this.#pingInterval) {
			clearInterval(this.#pingInterval)
			this.#pingInterval = undefined
		}
		return new Promise<void>((resolve, reject) => {
			if (this.#ws) {
				this.#ws.once('close', () => resolve())
				this.#ws.once('error', (error) => reject(error))
				this.#ws.close()
				this.#ws = undefined
			} else {
				resolve()
			}
		})
	}

	async _syncConnect(): Promise<void> {
		console.debug('[rtm] attempting connection to slack')
		return this._connect().catch((error) => {
			console.error('[rtm] connection failed, retrying')
			console.error(error)
			return this._syncConnect()
		})
	}

	private async _connect() {
		let url: URL
		if (this.#reconnectUrl) {
			url = new URL(this.#reconnectUrl)
		} else {
			const { primary_websocket_url } = await this.#client.request('client.getWebSocketURL', {})
			url = new URL(primary_websocket_url)
			url.searchParams.set('token', this.#token.token)
		}

		return new Promise<void>((resolve, reject) => {
			this.#ws = new WebSocket(url.toString(), { headers: { cookie: `d=${this.#token.cookie}` } })
			this.#ws.addEventListener('open', this.#onOpen.bind(this))
			this.#ws.addEventListener('message', this.#onMessage.bind(this))
			this.#ws.once('open', () => {
				this.#ws?.addEventListener('close', this.#onClose.bind(this))
				this.#ws?.addEventListener('error', this.#onError.bind(this))
				resolve()
			})
			this.#ws.once('error', (error) => reject(error))

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
			const payload = JSON.parse(event.data.replaceAll('\0', '')) as RTMEvent

			if ('type' in payload && payload.type) {
				this.emit(payload.type as any, payload)
			}

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
			} else if (isSlackEvent(payload)) {
				this.emit('event', makeEventWrapper(payload))
			} else {
				console.warn('[rtm] unknown event')
				console.warn(payload)
			}
		}
	}

	#onClose(event: WebSocket.CloseEvent) {
		console.debug('[rtm] websocket closed with code', event.code, event.reason)
		this._syncConnect()
	}

	#onError(event: WebSocket.ErrorEvent) {
		console.error('[socket-mode] websocket error', event.message)
		console.error(event.error)
		this.#ws?.close()
		this._syncConnect()
	}
}

function isSlackEvent(event: { type: string }): event is AllEvents {
	return (SLACK_EVENT_TYPES as readonly string[]).includes(event.type)
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

export interface PresenceChangeEvent {
	type: 'presence_change'
	user: string
	presence: 'active' | 'away'
	event_ts: string
}

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
	| Extract<AllEvents, { type: (typeof SLACK_RTM_API_EVENTS)[number] }>
// not planned
// | ExternalOrgMigrationFinishedEvent
// | ExternalOrgMigrationStartedEvent
// | GroupJoinedEvent
// | GroupMarkedEvent

export type RTMEventEmitterMap = {
	[K in RTMEvent as K['type']]: [K]
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

function makeEventWrapper<Event extends AllEvents>(event: Event): EventWrapper<Event> {
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

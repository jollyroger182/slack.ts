import type EventEmitter from 'events'
import type { DistributiveOmit } from '../utils/typing'
import type { AnyMessage } from '../api/types/message'

export interface EventsReceiver extends EventEmitter<ReceiverEventMap> {
	start(): unknown
}

export interface EventWrapper<T extends AllEvents = AllEvents> {
	type: 'event_callback'
	token: string
	team_id: string
	api_app_id: string
	event: T
	event_context: string
	event_id: string
	event_time: number
	authorizations: unknown[]
	is_ext_shared_channel: boolean
	context_team_id: string
	context_enterprise_id: string | null
}

export type AppMentionEvent = {
	type: 'app_mention'
	channel: string
	event_ts: string
} & DistributiveOmit<AnyMessage, 'type'>

export type AllEvents = AppMentionEvent

export type AllEventTypes = AllEvents['type']

export type SlackEventMap = {
	[K in AllEventTypes]: AllEvents & { type: K }
}

export type ReceiverEventMap = {
	event: [EventWrapper<AllEvents>]
}

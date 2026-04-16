import type { AppHomeOpenedEvent as SlackAppHomeOpenedEvent, SlackEvent } from '@slack/types'
import type { DistributiveOmit } from '../../utils/typing'
import type { AnyMessage } from '../types/message'
import type { HomeView } from '../types/view'

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

export type AllEventTypes = AllEvents['type']

export type SlackEventMap = {
	[K in AllEventTypes]: Extract<AllEvents, { type: K }>
}

export interface AppHomeOpenedEvent extends SlackAppHomeOpenedEvent {
	view?: HomeView
}

export type AppMentionEvent = {
	type: 'app_mention'
	channel: string
	event_ts: string
} & DistributiveOmit<AnyMessage, 'type'>

export type MessageEvent = {
	channel: string
	event_ts: string
} & AnyMessage

type OverrideEvents = AppHomeOpenedEvent | AppMentionEvent | MessageEvent

export type AllEvents = Exclude<SlackEvent, { type: OverrideEvents['type'] }> | OverrideEvents

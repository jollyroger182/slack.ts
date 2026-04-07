import type { AppMentionEvent, MessageEvent } from './events'

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

export type AllEvents = AppMentionEvent | MessageEvent

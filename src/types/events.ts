import type { SlackEvent } from '@slack/types'

export interface EventWrapper<E extends EventPayload = EventPayload> {
	type: 'event_callback'
	token: string
	team_id: string
	api_app_id: string
	authorizations: { enterprise_id?: string; team_id: string; user_id: string; is_bot: boolean }[]
	event: E
	event_id: string
	event_context: string
	event_time: number
}

export type EventPayload = SlackEvent

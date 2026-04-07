import type EventEmitter from 'events'
import type { AllEvents, EventWrapper } from '../api/events'
import type { BlockActions } from '../api/interactive/block_actions'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { SlashCommandPayload } from '../api/slash'

export interface EventsReceiver extends EventEmitter<ReceiverEventMap> {
	start(): unknown
}

export type ReceiverEventMap = {
	event: [EventWrapper<AllEvents>]
	block_actions: [BlockActions]
	view_submission: [ViewSubmission]
	slash_command: [SlashCommandPayload]
}

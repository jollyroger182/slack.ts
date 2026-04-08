import type { AllEvents, EventWrapper } from '../api/events'
import type { BlockActions } from '../api/interactive/block_actions'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { SlashCommandPayload } from '../api/slash'
import type { AsyncEventEmitter } from '../utils/events'

export interface EventsReceiver extends AsyncEventEmitter<ReceiverEventMap> {
	start(): unknown
}

export type ReceiverEventMap = {
	event: [EventWrapper<AllEvents>]
	block_actions: [BlockActions]
	view_submission: [ViewSubmission]
	slash_command: [SlashCommandPayload]
}

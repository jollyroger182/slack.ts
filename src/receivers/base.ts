import type { PlainTextOption } from '@slack/types'
import type { AllEvents, EventWrapper } from '../api/events'
import type { BlockActions } from '../api/interactive/block_actions'
import type { BlockSuggestion } from '../api/interactive/block_suggestion'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { SlashCommandPayload } from '../api/slash'
import type { PlainTextOptionGroup } from '../api/types/misc'
import type { AsyncEventEmitter } from '../utils/events'

export interface EventsReceiver extends AsyncEventEmitter<ReceiverEventMap> {
	start(): unknown
}

export type BlockSuggestionResponder = (
	options:
		| { option_groups: PlainTextOptionGroup[]; options?: never }
		| { options: PlainTextOption[]; option_groups?: never },
) => Promise<unknown>

export type ReceiverEventMap = {
	event: [EventWrapper<AllEvents>]
	block_actions: [BlockActions]
	block_suggestion: [BlockSuggestion, BlockSuggestionResponder]
	view_submission: [ViewSubmission]
	slash_command: [SlashCommandPayload]
}

import type { PlainTextOption } from '@slack/types'
import type { EventData, EventWrapper } from '../api/events'
import type { BlockActionsData } from '../api/interactive/block_actions'
import type { BlockSuggestionData } from '../api/interactive/block_suggestion'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { SlashCommandData } from '../api/slash'
import type { PlainTextOptionGroupData } from '../api/types/misc'
import type { AsyncEventEmitter } from '../utils/events'

export interface EventsReceiver extends AsyncEventEmitter<ReceiverEventMap> {
	start(): unknown
	stop(): unknown
}

export type BlockSuggestionResponder = (
	options:
		| { option_groups: PlainTextOptionGroupData[]; options?: never }
		| { options: PlainTextOption[]; option_groups?: never },
) => Promise<unknown>

export type ReceiverEventMap = {
	event: [EventWrapper<EventData>]
	block_actions: [BlockActionsData]
	block_suggestion: [BlockSuggestionData, BlockSuggestionResponder]
	view_submission: [ViewSubmission]
	slash_command: [SlashCommandData]
}

import type { AnyMessage } from '../types/message'
import type { AnyViewData } from '../types/view'
import type { ActionContainer } from './block_actions'
import type { InteractionCommon } from './common'

export interface BlockSuggestionData extends InteractionCommon {
	type: 'block_suggestion'
	container: ActionContainer
	channel?: { id: string; name: string }
	message?: AnyMessage
	view?: AnyViewData
	block_id: string
	action_id: string
	value: string
}

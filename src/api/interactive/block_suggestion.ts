import type { AnyMessage } from '../types/message'
import type { AnyView } from '../types/view'
import type { BlockActionContainer } from './block_actions'
import type { InteractionCommon } from './common'

export interface BlockSuggestion extends InteractionCommon {
	type: 'block_suggestion'
	container: BlockActionContainer
	channel?: { id: string; name: string }
	message?: AnyMessage
	view?: AnyView
	block_id: string
	action_id: string
	value: string
}

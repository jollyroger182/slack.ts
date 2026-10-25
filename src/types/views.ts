import type { Action, KnownValue, Value } from './blocks/elements'

export type { View, ModalView as Modal } from '@slack/types'

export type ViewStateValue<A extends Action = Action> = [
	Extract<KnownValue, { type: A['type'] }>,
] extends [never]
	? Value<A['type']>
	: Extract<KnownValue, { type: A['type'] }>

// export interface Modal {
// 	type: 'modal'
// 	callback_id: string
// 	// TODO: fields
// }

// export type View = Modal

import type {
	ActionsBlock,
	InputBlock,
	KnownBlock,
	PlainTextOption,
	SectionBlock,
	SectionBlockAccessory,
} from '@slack/types'
import type { StateValue } from '../../api/types/value'
import type { DistributivePick } from '../../utils/typing'

export type ExtractValues<Blocks extends { block_id?: string }[]> = {
	[Block in Blocks[number] as Block['block_id'] extends string
		? Block['block_id']
		: never]: ExtractBlockValues<Block>
}

export type ExtractBlockValues<Block> = Block extends {
	element: { type: string; action_id: string }
}
	? {
			[T in Block['element']['action_id']]: Extract<StateValue, { type: Block['element']['type'] }>
		}
	: Block extends { elements: { type: string; action_id?: string }[] }
		? {
				[Action in Block['elements'][number] as Action['action_id'] extends string
					? Action['action_id']
					: never]: Extract<StateValue, { type: Action['type'] }>
			}
		: never

export type ExtractActions<Blocks extends KnownBlock[]> = {
	[K in keyof Blocks]: ExtractBlockActions<Blocks[K]>
}[number][number]

export type ExtractBlockActions<Block extends KnownBlock> = PickActionFields<
	(Block extends SectionBlock
		? Extract<Block['accessory'], { action_id?: string }>[]
		: Block extends InputBlock
			? Extract<Block['element'], { action_id?: string }>[]
			: Block extends ActionsBlock
				? Extract<Block['elements'][number], { action_id?: string }>[]
				: [])[number]
>[]

type PickActionFields<Action extends { type: string; action_id?: string }> = Action extends unknown
	? DistributivePick<Action, 'type' | 'action_id'> &
			(Action extends { type: 'overflow'; options: infer Options extends unknown[] }
				? { selected_option: Options[number] }
				: {})
	: never

export type ActionsToPrefixedID<Action extends { type: string; action_id?: string }> =
	Action extends { type: string; action_id: string }
		? `${Action['type']}.${Action['action_id']}` | Action['action_id']
		: never

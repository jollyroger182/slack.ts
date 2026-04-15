import type {
	ActionsBlock,
	ContextActionsBlock,
	InputBlock,
	KnownBlock,
	SectionBlock,
} from '@slack/types'
import type { StateValue } from '../../api/types/value'
import type { DistributivePick } from '../../utils/typing'

export type ExtractValues<Blocks extends { block_id?: string }[]> = {
	[Block in Blocks[number] as Block['block_id'] extends string
		? Block['block_id']
		: never]: ExtractBlockValues<Block>
}

export type ExtractBlockValues<Block> = Block extends {
	accessory: { type: string; action_id: string }
}
	? ExtractValuesFromElement<Block['accessory']>
	: Block extends { element: { type: string; action_id: string } }
		? ExtractValuesFromElement<Block['element']>
		: Block extends { elements: { type: string; action_id?: string }[] }
			? ExtractValuesFromElement<Block['elements'][number]>
			: never

export type ExtractValuesFromElement<Element extends { type: string; action_id?: string }> = {
	[Elem in Element as Elem['action_id'] extends string ? Elem['action_id'] : never]: Extract<
		StateValue,
		{ type: Elem['type'] }
	> &
		(Elem extends { type: 'checkboxes'; options: infer Options extends unknown[] }
			? { selected_options: Options[number][] }
			: {}) &
		(Elem extends { type: 'static_select'; options: infer Options extends unknown[] }
			? { selected_option: Options[number] }
			: {}) &
		(Elem extends {
			type: 'static_select'
			option_groups: { options: infer Options extends unknown[] }[]
		}
			? { selected_option: Options[number] }
			: {})
}

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
				: Block extends ContextActionsBlock
					? Extract<Block['elements'][number], { action_id?: string }>[]
					: [])[number]
>[]

type PickActionFields<Action extends { type: string; action_id?: string }> = Action extends unknown
	? DistributivePick<Action, 'type' | 'action_id'> &
			(Action extends { type: 'checkboxes'; options: infer Options extends unknown[] }
				? { selected_options: Options[number][] }
				: {}) &
			(Action extends {
				type: 'overflow' | 'static_select'
				options: infer Options extends unknown[]
			}
				? { selected_option: Options[number] }
				: {}) &
			(Action extends {
				type: 'static_select'
				option_groups: { options: infer Options extends unknown[] }[]
			}
				? { selected_option: Options[number] }
				: {})
	: never

export type ActionsToPrefixedID<Action extends { type: string; action_id?: string }> =
	Action extends { type: string; action_id: string }
		? `${Action['type']}.${Action['action_id']}` | Action['action_id']
		: string

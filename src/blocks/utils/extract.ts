import type { AnyBlock } from '@slack/types'
import type { StateValue } from '../../api/types/value'
import type { DistributiveOmit } from '../../utils/typing'
import type { OptionObjectBuilder } from '../objects/option'

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
		DistributiveOmit<PickActionAndValueFields<Elem>, 'action_id'>
}

export type ExtractActions<Blocks extends AnyBlock[]> = {
	[K in keyof Blocks]: ExtractBlockActions<Blocks[K]>
}[number][number]

export type ExtractBlockActions<Block extends AnyBlock> = PickActionAndValueFields<
	{
		[K in keyof Block]:
			| Extract<Block[K], { type: string; action_id?: string }>
			| Extract<Block[K], { type: string; action_id?: string }[]>[number]
	}[keyof Block]
>[]

export type PickActionAndValueFields<Action extends { type: string; action_id?: string }> =
	Action extends unknown
		? Pick<Action, 'type' | 'action_id'> &
				(Action extends {
					type: 'checkboxes' | 'multi_static_select'
					options: infer Options extends unknown[]
				}
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
					: {}) &
				(Action extends {
					type: 'multi_static_select'
					option_groups: { options: infer Options extends unknown[] }[]
				}
					? { selected_options: Options[number][] }
					: {})
		: never

export type ActionsToPrefixedID<Action extends { type: string; action_id?: string }> =
	Action extends { type: string; action_id: string }
		? `${Action['type']}.${Action['action_id']}` | Action['action_id']
		: string

export type ExtractOptionValues<Options extends OptionObjectBuilder[]> = {
	[K in keyof Options]: Options[K] extends OptionObjectBuilder<infer Value> ? Value : never
}[keyof Options]

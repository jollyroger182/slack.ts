import type { AnyBlock } from '@slack/types'
import type { StateValue } from '../../api/types/value'
import type { DistributiveOmit } from '../../utils/typing'
import type { OptionObjectBuilder } from '../objects/option'

/**
 * Extract the `state.values` object type from the blocks type. Supports extracting options from
 * select menus.
 *
 * @example
 *
 *     const blks = blocks(input(plainTextInput().id('input')).label('Text').id('block'))
 *     type Values = ExtractValues<typeof blks>
 *     // { block: { input: { type: "plain_text_input"; value: string } } }
 *
 * @typeParam Blocks - A tuple type of blocks
 */
export type ExtractValues<Blocks extends AnyBlock[]> = {
	[Block in Blocks[number] as Block['block_id'] extends string
		? Block['block_id']
		: never]: ExtractBlockValues<Block>
}

/**
 * Extract a single block's values.
 *
 * @example
 *
 *     const blk = input(plainTextInput().id('input')).label('Text').build()
 *     type Values = ExtractBlockValues<typeof blk>
 *     // { input: { type: "plain_text_input"; value: string } }
 *
 * @typeParam Block - A single block type
 */
export type ExtractBlockValues<Block extends AnyBlock> = {
	[K in keyof Block]: ExtractElementValue<
		| Extract<Block[K], { type: string; action_id: string }>
		| Extract<Block[K], { type: string; action_id?: string }[]>[number]
	>
}[keyof Block] & {}

/**
 * Extract a block element's value.
 *
 * @example
 *
 *     const element = plainTextInput().id('input').build()
 *     type Value = ExtractElementValue<typeof element>
 *     // { input: { type: "plain_text_input"; value: string } }
 *
 * @typeParam Element - A union of element types
 */
export type ExtractElementValue<Element extends { type: string; action_id?: string }> =
	Element extends { action_id: string }
		? {
				[K in Element['action_id']]: Extract<StateValue, { type: Element['type'] }> &
					DistributiveOmit<PickActionAndValueFields<Element>, 'type' | 'action_id'>
			}
		: never

/**
 * Extract the block action types that an array of blocks can generate. Supports extracting options
 * from select menus.
 *
 * @example
 *
 *     const blks = blocks(actions(button('a').id('a'), button('b').id('b')).id('blk'))
 *     type Action = ExtractActions<typeof blks>
 *     // { type: "button"; action_id: "a" } | { type: "button"; action_id: "b" }
 *
 * @typeParam Blocks - A tuple type of blocks
 */
export type ExtractActions<Blocks extends AnyBlock[]> = {
	[K in keyof Blocks]: ExtractBlockActions<Blocks[K]>
}[number]

/**
 * Extract the action types that a single block can generate.
 *
 * @example
 *
 *     const blk = actions(button('a').id('a'), button('b').id('b')).id('blk').build()
 *     type Action = ExtractBlockActions<typeof blk>
 *     // { type: "button"; action_id: "a" } | { type: "button"; action_id: "b" }
 *
 * @typeParam Block - A single block type
 */
export type ExtractBlockActions<Block extends AnyBlock> = PickActionAndValueFields<
	{
		[K in keyof Block]:
			| Extract<Block[K], { type: string; action_id: string }>
			| Extract<Block[K], { type: string; action_id?: string }[]>[number]
	}[keyof Block] & {}
>

/**
 * Extract additional data fields present in action payloads and `state.values` from the block type.
 *
 * @example
 *
 *     const element = select(option('a').value('a'), option('b').value('b')).build()
 *     type Action = PickActionAndValueFields<typeof element>
 *     // {
 *     //   type: "static_select"
 *     //   action_id: string
 *     //   selected_option: PlainTextOption & ({ value: "a" } | { value: "b" })
 *     // }
 *
 * @typeParam Action - A union of block elements (buttons, select menus, etc)
 */
export type PickActionAndValueFields<Action extends { type: string; action_id?: string }> =
	Action extends { action_id: string }
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

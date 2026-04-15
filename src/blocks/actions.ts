import type { ActionsBlock } from '@slack/types'
import { BlockBuilder } from './base'
import type { BlockElementBuilder } from './elements/base'
import type { ButtonBuilder } from './elements/button'
import type { CheckboxesBuilder } from './elements/checkboxes'
import type { DatePickerBuilder } from './elements/date_picker'
import type { DatetimePickerBuilder } from './elements/datetime_picker'
import type { OverflowBuilder } from './elements/overflow'
import type { SingleSelectMenuBuilder } from './elements/select'

type ActionsElementBuilder =
	| ButtonBuilder<string>
	| CheckboxesBuilder<any, string>
	| DatePickerBuilder
	| DatetimePickerBuilder
	| OverflowBuilder<any, string>
	| SingleSelectMenuBuilder

type TypedActionsBlock<
	Actions extends ActionsElementBuilder[],
	BlockID extends string,
> = ActionsBlock & {
	block_id: BlockID
	elements: {
		[K in keyof Actions]: Actions[K] extends BlockElementBuilder<infer Output> ? Output : never
	}
}

/**
 * Builder for actions blocks.
 *
 * Actions blocks contain interactive elements like buttons and overflow menus.
 *
 * @template Actions The array of action element builders
 * @template BlockID The block ID type
 */
export class ActionsBlockBuilder<
	Actions extends ActionsElementBuilder[],
	BlockID extends string = string,
> extends BlockBuilder<TypedActionsBlock<Actions, BlockID>, BlockID> {
	constructor(private _actions: Actions) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): ActionsBlockBuilder<Actions, BlockID> {
		return this._id(blockId)
	}

	/**
	 * Adds an action element to this block.
	 *
	 * @param action The action element to add
	 * @returns This builder with the new action added
	 */
	action<Action extends ActionsElementBuilder>(
		action: Action,
	): ActionsBlockBuilder<[...Actions, Action]> {
		this._actions.push(action)
		return this as any
	}

	override build(): TypedActionsBlock<Actions, BlockID> {
		return {
			...this._build(),
			type: 'actions',
			elements: this._actions.map((a) => a.build()) as any,
		}
	}
}

/**
 * Creates an actions block builder.
 *
 * @param actions Initial list of action elements
 * @returns An actions block builder
 */
export function actions<Actions extends ActionsElementBuilder[]>(...actions: Actions) {
	return new ActionsBlockBuilder(actions)
}

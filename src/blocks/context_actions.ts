import type { ContextActionsBlock } from '@slack/types'
import { BlockBuilder } from './base'
import type { BlockElementBuilder } from './elements/base'
import type { FeedbackButtonsBuilder } from './elements/feedback_buttons'
import type { IconButtonBuilder } from './elements/icon_button'

type ContextActionsElementBuilder =
	| FeedbackButtonsBuilder<string, string, string>
	| IconButtonBuilder

type TypedContextActionsBlock<
	Actions extends ContextActionsElementBuilder[],
	BlockID extends string,
> = ContextActionsBlock & {
	block_id: BlockID
	elements: {
		[K in keyof Actions]: Actions[K] extends BlockElementBuilder<infer Output, any, true>
			? Output
			: never
	}
}

export class ContextActionsBlockBuilder<
	Actions extends ContextActionsElementBuilder[],
	BlockID extends string = string,
> extends BlockBuilder<TypedContextActionsBlock<Actions, BlockID>, BlockID> {
	constructor(private _actions: Actions) {
		super()
	}

	override id<BlockID extends string>(
		blockId: BlockID,
	): ContextActionsBlockBuilder<Actions, BlockID> {
		return this._id(blockId)
	}

	override build(): TypedContextActionsBlock<Actions, BlockID> {
		return {
			...this._build(),
			type: 'context_actions',
			elements: this._actions.map((a) => a.build()) as any,
		}
	}
}

export function contextActions<Actions extends ContextActionsElementBuilder[]>(
	...actions: Actions
) {
	return new ContextActionsBlockBuilder(actions)
}

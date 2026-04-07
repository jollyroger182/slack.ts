import { BlockBuilder } from './base'
import type { ActionsBlock } from '@slack/types'
import type { ButtonBuilder } from './elements/button'
import type { BlockElementBuilder } from './elements/base'
import type { OverflowBuilder } from './elements/overflow'

type ActionsElementBuilder = ButtonBuilder<string> | OverflowBuilder<any, string>

type TypedActionsBlock<
	Actions extends ActionsElementBuilder[],
	BlockID extends string,
> = ActionsBlock & {
	block_id: BlockID
	elements: {
		[K in keyof Actions]: Actions[K] extends BlockElementBuilder<infer Output> ? Output : never
	}
}

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

export function actions<Actions extends ActionsElementBuilder[]>(...actions: Actions) {
	return new ActionsBlockBuilder(actions)
}

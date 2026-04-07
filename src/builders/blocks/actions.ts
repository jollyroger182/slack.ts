import { BlockBuilder } from './base'
import type { ActionsBlock } from '@slack/types'
import type { ButtonBuilder } from './elements/button'
import type { InteractiveElementBuilder } from './elements/base'

type ActionsElementBuilder = ButtonBuilder<string>

type TypedActionsBlock<Actions extends ActionsElementBuilder[]> = ActionsBlock & {
	elements: {
		[K in keyof Actions]: Actions[K] extends InteractiveElementBuilder<infer Output>
			? Output
			: never
	}
}

export class ActionsBlockBuilder<Actions extends ActionsElementBuilder[]> extends BlockBuilder<
	TypedActionsBlock<Actions>
> {
	constructor(private _actions: Actions) {
		super()
	}

	action<Action extends ActionsElementBuilder>(
		action: Action,
	): ActionsBlockBuilder<[...Actions, Action]> {
		this._actions.push(action)
		return this as any
	}

	override build(): TypedActionsBlock<Actions> {
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

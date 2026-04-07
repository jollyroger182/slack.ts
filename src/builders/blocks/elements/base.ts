import { randomUUID } from 'crypto'
import { Builder } from '../base'

export abstract class InteractiveElementBuilder<
	Output,
	ActionID extends string = string,
> extends Builder<Output> {
	protected _actionId: string = randomUUID()

	id<ActionID extends string>(actionId: ActionID): InteractiveElementBuilder<unknown, ActionID> {
		this._actionId = actionId as any
		return this as any
	}

	override _build(): { action_id: ActionID } {
		return { action_id: this._actionId as any }
	}
}

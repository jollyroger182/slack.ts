import { randomUUID } from 'crypto'
import { Builder } from '../base'

export abstract class InteractiveElementBuilder<
	Output,
	ActionID extends string = string,
> extends Builder<Output> {
	protected _actionId: string = randomUUID()

	protected _id(actionId: string) {
		this._actionId = actionId
		return this as any
	}

	abstract id<ActionID extends string>(
		actionId: ActionID,
	): InteractiveElementBuilder<unknown, ActionID>

	override _build(): { action_id: ActionID } {
		return { action_id: this._actionId as any }
	}
}

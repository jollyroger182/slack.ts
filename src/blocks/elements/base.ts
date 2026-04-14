import { randomUUID } from 'crypto'
import { Builder } from '../base'

export abstract class BlockElementBuilder<
	Output,
	ActionID extends string = string,
	Complete extends boolean = true,
> extends Builder<Output, Complete> {
	private _blockElementIsNotComplete?: Complete

	protected _actionId: string = randomUUID()

	protected _id(actionId: string) {
		this._actionId = actionId
		return this as any
	}

	abstract id<ActionID extends string>(
		actionId: ActionID,
	): BlockElementBuilder<unknown, ActionID, Complete>

	override _build(): { action_id: ActionID } {
		return { action_id: this._actionId as any }
	}
}

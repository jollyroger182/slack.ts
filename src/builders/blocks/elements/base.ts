import { randomUUID } from 'crypto'
import { Builder } from '../base'

export abstract class InteractiveElementBuilder<Output> extends Builder<Output> {
	private _actionId: string = randomUUID()

	id(actionId: string) {
		this._actionId = actionId
		return this
	}

	override _build(): { action_id?: string } {
		return { action_id: this._actionId }
	}
}

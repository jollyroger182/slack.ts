import { InteractiveElementBuilder } from './base'
import type { PlainTextInput } from '@slack/types'

type TypedPlainTextInput<ActionID extends string> = PlainTextInput & { action_id: ActionID }

export class PlainTextInputBuilder<ActionID extends string> extends InteractiveElementBuilder<
	TypedPlainTextInput<ActionID>,
	ActionID
> {
	override id<ActionID extends string>(actionId: ActionID): PlainTextInputBuilder<ActionID> {
		return this._id(actionId)
	}

	override build(): TypedPlainTextInput<ActionID> {
		return { ...this._build(), type: 'plain_text_input' }
	}
}

export function plainTextInput() {
	return new PlainTextInputBuilder()
}

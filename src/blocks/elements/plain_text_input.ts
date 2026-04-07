import type { DispatchActionConfig, PlainTextInput } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedPlainTextInput<ActionID extends string> = PlainTextInput & { action_id: ActionID }

export class PlainTextInputBuilder<ActionID extends string> extends BlockElementBuilder<
	TypedPlainTextInput<ActionID>,
	ActionID
> {
	private _multiline: boolean = false
	private _default?: string
	private _autofocus: boolean = false
	private _placeholder?: TextObjectBuilder<false>
	private _minLength?: number
	private _maxLength?: number
	private _triggers?: DispatchActionConfig['trigger_actions_on']

	override id<ActionID extends string>(actionId: ActionID): PlainTextInputBuilder<ActionID> {
		return this._id(actionId)
	}

	multiline(multiline: boolean = true) {
		this._multiline = multiline
		return this
	}

	default(value: string) {
		this._default = value
		return this
	}

	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

	placeholder(placeholder: string | TextObjectBuilder<false>) {
		this._placeholder = ensureIsTextObjectBuilder(placeholder).plain()
		return this
	}

	min(minLength: number) {
		this._minLength = minLength
		return this
	}

	max(maxLength: number) {
		this._maxLength = maxLength
		return this
	}

	triggers(...triggers: DispatchActionConfig['trigger_actions_on'] & {}) {
		this._triggers = triggers
		return this
	}

	override build(): TypedPlainTextInput<ActionID> {
		return {
			...this._build(),
			type: 'plain_text_input',
			multiline: this._multiline,
			initial_value: this._default,
			focus_on_load: this._autofocus,
			placeholder: this._placeholder?.build(),
			min_length: this._minLength,
			max_length: this._maxLength,
			dispatch_action_config: this._triggers ? { trigger_actions_on: this._triggers } : undefined,
		}
	}
}

export function plainTextInput() {
	return new PlainTextInputBuilder()
}

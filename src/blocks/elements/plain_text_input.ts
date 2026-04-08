import type { DispatchActionConfig, PlainTextInput } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedPlainTextInput<ActionID extends string> = PlainTextInput & { action_id: ActionID }

/**
 * Builder for plain text input elements.
 *
 * Plain text input elements collect text input from users in modals and home tabs.
 *
 * @template ActionID The action ID type used to identify this input
 */
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

	/**
	 * Sets whether the input accepts multiple lines.
	 *
	 * @param multiline Whether to enable multiline input
	 * @returns This builder
	 */
	multiline(multiline: boolean = true) {
		this._multiline = multiline
		return this
	}

	/**
	 * Sets the default value for this input.
	 *
	 * @param value The default value
	 * @returns This builder
	 */
	default(value: string) {
		this._default = value
		return this
	}

	/**
	 * Sets whether this input should receive focus on load.
	 *
	 * @param autofocus Whether to autofocus
	 * @returns This builder
	 */
	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

	/**
	 * Sets the placeholder text for this input.
	 *
	 * @param placeholder The placeholder text
	 * @returns This builder
	 */
	placeholder(placeholder: string | TextObjectBuilder<false>) {
		this._placeholder = ensureIsTextObjectBuilder(placeholder).plain()
		return this
	}

	/**
	 * Sets the minimum length for input validation.
	 *
	 * @param minLength The minimum length
	 * @returns This builder
	 */
	min(minLength: number) {
		this._minLength = minLength
		return this
	}

	/**
	 * Sets the maximum length for input validation.
	 *
	 * @param maxLength The maximum length
	 * @returns This builder
	 */
	max(maxLength: number) {
		this._maxLength = maxLength
		return this
	}

	/**
	 * Sets dispatch actions to trigger on specific events.
	 *
	 * @param triggers The events that should trigger actions
	 * @returns This builder
	 */
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

/**
 * Creates a plain text input element builder.
 *
 * @returns A plain text input element builder
 */
export function plainTextInput() {
	return new PlainTextInputBuilder()
}

import type { DispatchActionConfig, NumberInput } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedNumberInput<ActionID extends string> = NumberInput & { action_id: ActionID }

export class NumberInputBuilder<ActionID extends string> extends BlockElementBuilder<
	TypedNumberInput<ActionID>,
	ActionID
> {
	private _decimal: boolean = false
	private _default?: number
	private _autofocus: boolean = false
	private _placeholder?: TextObjectBuilder<false>
	private _min?: number
	private _max?: number
	private _triggers?: DispatchActionConfig['trigger_actions_on']

	override id<ActionID extends string>(actionId: ActionID): NumberInputBuilder<ActionID> {
		return this._id(actionId)
	}

	decimal(decimal: boolean = true) {
		this._decimal = decimal
		return this
	}

	/**
	 * Sets the default value for this input.
	 *
	 * @param value The default value
	 * @returns This builder
	 */
	default(value: number) {
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
	 * Sets the minimum value for input validation.
	 *
	 * @param minLength The minimum value
	 * @returns This builder
	 */
	min(min: number) {
		this._min = min
		return this
	}

	/**
	 * Sets the maximum value for input validation.
	 *
	 * @param maxLength The maximum value
	 * @returns This builder
	 */
	max(max: number) {
		this._max = max
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

	override build(): TypedNumberInput<ActionID> {
		return {
			...this._build(),
			type: 'number_input',
			is_decimal_allowed: this._decimal,
			initial_value: this._default?.toString(),
			focus_on_load: this._autofocus,
			placeholder: this._placeholder?.build(),
			min_value: this._min?.toString(),
			max_value: this._max?.toString(),
			dispatch_action_config: this._triggers ? { trigger_actions_on: this._triggers } : undefined,
		}
	}
}

/**
 * Creates a number input element builder.
 *
 * @returns A number input element builder
 */
export function numberInput() {
	return new NumberInputBuilder()
}

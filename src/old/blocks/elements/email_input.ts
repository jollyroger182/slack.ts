import type { DispatchActionConfig, EmailInput } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedEmailInput<ActionID extends string> = EmailInput & { action_id: ActionID }

export class EmailInputBuilder<ActionID extends string> extends BlockElementBuilder<
	TypedEmailInput<ActionID>,
	ActionID
> {
	private _default?: string
	private _autofocus: boolean = false
	private _placeholder?: TextObjectBuilder<false>
	private _triggers?: DispatchActionConfig['trigger_actions_on']

	override id<ActionID extends string>(actionId: ActionID): EmailInputBuilder<ActionID> {
		return this._id(actionId)
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
	 * Sets dispatch actions to trigger on specific events.
	 *
	 * @param triggers The events that should trigger actions
	 * @returns This builder
	 */
	triggers(...triggers: DispatchActionConfig['trigger_actions_on'] & {}) {
		this._triggers = triggers
		return this
	}

	override build(): TypedEmailInput<ActionID> {
		return {
			...this._build(),
			type: 'email_text_input',
			initial_value: this._default,
			focus_on_load: this._autofocus,
			placeholder: this._placeholder?.build(),
			dispatch_action_config: this._triggers ? { trigger_actions_on: this._triggers } : undefined,
		}
	}
}

export function emailInput() {
	return new EmailInputBuilder()
}

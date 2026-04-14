import type { ColorScheme, Datepicker } from '@slack/types'
import { BlockElementBuilder } from './base'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'

type TypedDatePicker<ActionID extends string> = Datepicker & { action_id: ActionID }

export class DatePickerBuilder<ActionID extends string = string> extends BlockElementBuilder<
	TypedDatePicker<ActionID>,
	ActionID
> {
	private _initial?: string
	private _placeholder?: TextObjectBuilder<false>
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _autofocus: boolean = false

	override id<ActionID extends string>(actionId: ActionID): DatePickerBuilder<ActionID> {
		return this._id(actionId)
	}

	default(date: string | Date) {
		this._initial =
			typeof date === 'string'
				? date
				: `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
		return this
	}

	placeholder(placeholder: string | TextObjectBuilder<false>) {
		this._placeholder = ensureIsTextObjectBuilder(placeholder).plain()
	}

	/**
	 * Adds a confirmation dialog when the user interacts with this element.
	 *
	 * @param confirm A confirmation builder or configuration object
	 * @returns This builder
	 */
	confirm(
		confirm:
			| ConfirmBuilder<true, true, true, true>
			| {
					title: string | TextObjectBuilder<false>
					text: string | TextObjectBuilder
					confirm: string | TextObjectBuilder<false>
					deny: string | TextObjectBuilder<false>
					style?: ColorScheme
			  },
	) {
		this._confirm = confirm instanceof ConfirmBuilder ? confirm : buildConfirm(confirm)
		return this
	}

	/**
	 * Sets whether this element should receive focus on load.
	 *
	 * @param autofocus Whether to autofocus
	 * @returns This builder
	 */
	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

	override build(): TypedDatePicker<ActionID> {
		return {
			...this._build(),
			type: 'datepicker',
			initial_date: this._initial,
			confirm: this._confirm?.build(),
			focus_on_load: this._autofocus,
			placeholder: this._placeholder?.build(),
		}
	}
}

export function datePicker() {
	return new DatePickerBuilder()
}

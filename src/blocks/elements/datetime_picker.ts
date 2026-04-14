import type { ColorScheme, DateTimepicker } from '@slack/types'
import { confirm as buildConfirm, ConfirmBuilder } from '../objects/confirm'
import { type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedDatetimePicker<ActionID extends string> = DateTimepicker & { action_id: ActionID }

export class DatetimePickerBuilder<ActionID extends string = string> extends BlockElementBuilder<
	TypedDatetimePicker<ActionID>,
	ActionID
> {
	private _initial?: number
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _autofocus: boolean = false

	override id<ActionID extends string>(actionId: ActionID): DatetimePickerBuilder<ActionID> {
		return this._id(actionId)
	}

	default(datetime: Date) {
		this._initial = Math.round(datetime.getTime() / 1000)
		return this
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

	override build(): TypedDatetimePicker<ActionID> {
		return {
			...this._build(),
			type: 'datetimepicker',
			initial_date_time: this._initial,
			confirm: this._confirm?.build(),
			focus_on_load: this._autofocus,
		}
	}
}

export function datetimePicker() {
	return new DatetimePickerBuilder()
}

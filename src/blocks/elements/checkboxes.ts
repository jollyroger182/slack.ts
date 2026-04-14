import type { Checkboxes, ColorScheme, PlainTextOption } from '@slack/types'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import type { OptionObjectBuilder } from '../objects/option'
import type { TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type ExtractOptionValues<Options extends OptionObjectBuilder[]> = {
	[K in keyof Options]: Options[K] extends OptionObjectBuilder<infer Value> ? Value : never
}[keyof Options]

type TypedCheckboxes<
	Options extends OptionObjectBuilder[],
	ActionID extends string,
> = Checkboxes & {
	action_id: ActionID
	options: {
		[K in keyof Options]: Options[K] extends OptionObjectBuilder<infer Value>
			? PlainTextOption & { value: Value }
			: never
	}
}

export class CheckboxesBuilder<
	Options extends OptionObjectBuilder[],
	ActionID extends string,
> extends BlockElementBuilder<TypedCheckboxes<Options, ActionID>, ActionID> {
	private _initialValues?: string[]
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _autofocus: boolean = false

	constructor(private _options: Options) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): CheckboxesBuilder<Options, ActionID> {
		return this._id(actionId)
	}

	default(...values: ExtractOptionValues<Options>[]) {
		this._initialValues = values.filter((v) => v !== undefined)
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

	override build(): TypedCheckboxes<Options, ActionID> {
		const options = this._options.map((o) => o.build())
		return {
			...this._build(),
			type: 'checkboxes',
			options: options as any,
			initial_options: this._initialValues
				? options.filter((o) => o.value && this._initialValues!.includes(o.value))
				: undefined,
			confirm: this._confirm?.build(),
			focus_on_load: this._autofocus,
		}
	}
}

export function checkboxes<Options extends OptionObjectBuilder[]>(...options: Options) {
	return new CheckboxesBuilder(options)
}

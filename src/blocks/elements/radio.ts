import type { ColorScheme, PlainTextOption, RadioButtons } from '@slack/types'
import type { OptionObjectBuilder } from '../objects/option'
import { BlockElementBuilder } from './base'
import type { Builder } from '../base'
import type { ExtractOptionValues } from '../utils/extract'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import type { TextObjectBuilder } from '../objects/text'

type TypedRadio<Options extends OptionObjectBuilder[], ActionID extends string> = RadioButtons & {
	action_id: ActionID
	options: {
		[K in keyof Options]: Options[K] extends Builder<infer Output> ? Output : never
	}
}

export class RadioBuilder<
	Options extends OptionObjectBuilder[],
	ActionID extends string = string,
> extends BlockElementBuilder<TypedRadio<Options, ActionID>, ActionID> {
	private _default?: string
	private _autofocus: boolean = false
	private _confirm?: ConfirmBuilder<true, true, true, true>

	constructor(private options: Options) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): RadioBuilder<Options, ActionID> {
		return this._id(actionId)
	}

	default(value: ExtractOptionValues<Options>) {
		this._default = value
		return this
	}

	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

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

	override build(): TypedRadio<Options, ActionID> {
		const options = this.options.map((o) => o.build())
		return {
			...this._build(),
			type: 'radio_buttons',
			options: options as any,
			initial_option: this._default ? options.find((o) => o.value === this._default) : undefined,
			focus_on_load: this._autofocus,
			confirm: this._confirm?.build(),
		}
	}
}

export function radio<Options extends OptionObjectBuilder[]>(...options: Options) {
	return new RadioBuilder(options)
}

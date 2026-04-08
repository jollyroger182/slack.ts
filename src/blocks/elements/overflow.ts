import type { ColorScheme, Overflow, PlainTextOption } from '@slack/types'
import { BlockElementBuilder } from './base'
import type { OptionObjectBuilder } from '../objects/option'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import type { TextObjectBuilder } from '../objects/text'

type TypedOverflow<Options extends OptionObjectBuilder[], ActionID extends string> = Overflow & {
	action_id: ActionID
	options: {
		[K in keyof Options]: Options[K] extends OptionObjectBuilder<infer Value>
			? PlainTextOption & { value: Value }
			: never
	}
}

/**
 * Builder for overflow menu elements.
 *
 * Overflow menus display a list of options in a dropdown menu.
 *
 * @template Options The array of option builders
 * @template ActionID The action ID type used to identify this overflow menu
 */
export class OverflowBuilder<
	Options extends OptionObjectBuilder[],
	ActionID extends string = string,
> extends BlockElementBuilder<TypedOverflow<Options, ActionID>, ActionID> {
	private _confirm?: ConfirmBuilder<true, true, true, true>

	constructor(private _options: Options) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): OverflowBuilder<Options, ActionID> {
		return this._id(actionId)
	}

	/**
	 * Adds a confirmation dialog when the user selects an option.
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

	override build(): TypedOverflow<Options, ActionID> {
		return {
			...this._build(),
			type: 'overflow',
			options: this._options.map((o) => o.build()) as any,
			confirm: this._confirm?.build(),
		}
	}
}

/**
 * Creates an overflow menu element builder.
 *
 * @param options The menu options
 * @returns An overflow menu element builder
 */
export function overflow<Options extends OptionObjectBuilder[]>(...options: Options) {
	return new OverflowBuilder(options)
}

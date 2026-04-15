import type { ColorScheme, PlainTextElement, PlainTextOption, StaticSelect } from '@slack/types'
import type { DistributiveOmit } from '../../utils/typing'
import type { Builder } from '../base'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import { OptionObjectBuilder } from '../objects/option'
import type { OptionGroupBuilder } from '../objects/option_group'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type OptionsSpecifier =
	| { options: OptionObjectBuilder[]; option_groups?: never }
	| { option_groups: OptionGroupBuilder<OptionObjectBuilder[]>[]; options?: never }

type TypedStaticSelect<Options extends OptionsSpecifier, ActionID extends string> = StaticSelect & {
	[K in keyof Options]: Options[K] extends unknown[]
		? {
				[Index in keyof Options[K]]: Options[K][Index] extends Builder<infer Output>
					? Output
					: never
			}
		: never
} & { action_id: ActionID }

type ExtractValues<Options extends OptionsSpecifier> = Options extends {
	options: OptionObjectBuilder[]
}
	? Options['options'][number] extends Builder<infer Output extends { value: string }>
		? Output['value']
		: never
	: Options extends { option_groups: OptionGroupBuilder<any>[] }
		? Options['option_groups'][number] extends Builder<
				infer Output extends { options: { value: string }[] }
			>
			? Output['options'][number]['value']
			: never
		: never

export class StaticSelectBuilder<
	Options extends OptionsSpecifier,
	ActionID extends string = string,
> extends BlockElementBuilder<TypedStaticSelect<Options, ActionID>, ActionID> {
	private _default?: string
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _autofocus?: boolean
	private _placeholder?: TextObjectBuilder<false>

	constructor(private _options: Options) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): StaticSelectBuilder<Options, ActionID> {
		return this._id(actionId)
	}

	default(value: ExtractValues<Options>) {
		this._default = value
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

	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

	placeholder(placeholder: string | TextObjectBuilder<false>) {
		this._placeholder = ensureIsTextObjectBuilder(placeholder).plain()
		return this
	}

	override build(): TypedStaticSelect<Options, ActionID> {
		// let options: PlainTextOption[] = this._options.options ? this._options.options.map(o => o.build())
		if (!this._options.options && !this._options.option_groups) {
			throw new Error('One of options and option_groups is required for static select menus')
		}

		let optionGroups: { label: PlainTextElement; options: PlainTextOption[] }[] | undefined
		let options: PlainTextOption[] | undefined
		let allOptions: PlainTextOption[]
		if (this._options.options) {
			options = this._options.options.map((o) => o.build())
			allOptions = options
		} else {
			optionGroups = this._options.option_groups.map((o) => o.build())
			allOptions = optionGroups.flatMap((o) => o.options)
		}

		const data = {
			...this._build(),
			type: 'static_select',
			initial_option: this._default ? allOptions.find((o) => o.value === this._default) : undefined,
			confirm: this._confirm?.build(),
			focus_on_load: this._autofocus,
			placeholder: this._placeholder?.build(),
		} satisfies DistributiveOmit<StaticSelect, 'options' | 'option_groups'>

		if (this._options.options) {
			return {
				...data,
				options: this._options.options.map((o) => o.build()),
			} as any
		} else if (this._options.option_groups) {
			return {
				...data,
				option_groups: this._options.option_groups.map((o) => o.build()),
			} as any
		}

		throw new Error('One of options and option_groups is required for static select menus')
	}
}

export function staticSelect<Options extends OptionObjectBuilder[]>(
	...options: Options
): StaticSelectBuilder<{ options: Options }>

export function staticSelect<OptionGroups extends OptionGroupBuilder<any>[]>(
	...optionGroups: OptionGroups
): StaticSelectBuilder<{ option_groups: OptionGroups }>

export function staticSelect(...options: OptionObjectBuilder[] | OptionGroupBuilder<any>[]) {
	if (!options.length) throw new Error('Static select menus must have at least one element')

	if (options[0]! instanceof OptionObjectBuilder) {
		return new StaticSelectBuilder({ options: options as OptionObjectBuilder[] })
	} else {
		return new StaticSelectBuilder({ option_groups: options as OptionGroupBuilder<any>[] })
	}
}

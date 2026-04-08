import type { PlainTextOption } from '@slack/types'
import { Builder } from '../base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './text'

type TypedPlainTextOption<Value extends string | undefined> = PlainTextOption & { value: Value }

/**
 * Builder for option objects.
 *
 * Option objects are used in select menus to define the available choices.
 *
 * @template Value The option value type
 */
export class OptionObjectBuilder<
	Value extends string | undefined = string | undefined,
> extends Builder<TypedPlainTextOption<Value>> {
	constructor(
		private _text: TextObjectBuilder<false>,
		private _value: Value,
	) {
		super()
	}

	/**
	 * Sets the value for this option.
	 *
	 * @param value The option value
	 * @returns This builder with the value set
	 */
	value<Value extends string>(value: Value): OptionObjectBuilder<Value> {
		this._value = value as any
		return this as any
	}

	override build(): TypedPlainTextOption<Value> {
		return { text: this._text.build(), value: this._value }
	}
}

/**
 * Creates an option builder without an initial value.
 *
 * @param text The option text
 * @returns An option builder without a value
 */
export function option(text: string | TextObjectBuilder<false>): OptionObjectBuilder<undefined>
/**
 * Creates an option builder with an initial value.
 *
 * @param text The option text
 * @param value The option value
 * @returns An option builder with the value set
 */
export function option<Value extends string>(
	text: string | TextObjectBuilder<false>,
	value: Value,
): OptionObjectBuilder<Value>
export function option<Value extends string>(
	text: string | TextObjectBuilder<false>,
	value?: Value,
) {
	return new OptionObjectBuilder(ensureIsTextObjectBuilder(text).plain(), value)
}

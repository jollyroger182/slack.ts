import type { PlainTextOption } from '@slack/types'
import { Builder } from '../base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './text'

type TypedPlainTextOption<Value extends string | undefined> = PlainTextOption & { value: Value }

export class OptionObjectBuilder<
	Value extends string | undefined = string | undefined,
> extends Builder<TypedPlainTextOption<Value>> {
	constructor(
		private _text: TextObjectBuilder<false>,
		private _value: Value,
	) {
		super()
	}

	value<Value extends string>(value: Value): OptionObjectBuilder<Value> {
		this._value = value as any
		return this as any
	}

	override build(): TypedPlainTextOption<Value> {
		return { text: this._text.build(), value: this._value }
	}
}

export function option(text: string | TextObjectBuilder<false>): OptionObjectBuilder<undefined>
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

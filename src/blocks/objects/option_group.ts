import type { PlainTextOptionGroup } from '../../api/types/misc'
import { Builder } from '../base'
import type { OptionObjectBuilder } from './option'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './text'

type TypedOptionGroup<Options extends OptionObjectBuilder[]> = PlainTextOptionGroup & {
	options: { [K in keyof Options]: Options[K] extends Builder<infer Output> ? Output : never }
}

export class OptionGroupBuilder<Options extends OptionObjectBuilder[]> extends Builder<
	TypedOptionGroup<Options>
> {
	constructor(
		private label: TextObjectBuilder<false>,
		private _options: Options,
	) {
		super()
	}

	override build(): TypedOptionGroup<Options> {
		return {
			...this._build(),
			label: this.label.build(),
			options: this._options.map((o) => o.build()) as any,
		}
	}
}

export function optionGroup<Options extends OptionObjectBuilder[]>(
	label: string | TextObjectBuilder<false>,
	...options: Options
) {
	return new OptionGroupBuilder(ensureIsTextObjectBuilder(label).plain(), options)
}

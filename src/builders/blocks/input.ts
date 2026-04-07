import type { InputBlock } from '@slack/types'
import { BlockBuilder } from './base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { PlainTextInputBuilder } from './elements/plain_text_input'
import { SlackError } from '../../error'
import type { InteractiveElementBuilder } from './elements/base'

type InputElementBuilder = PlainTextInputBuilder<string>

type TypedInputBlock<Element extends InputElementBuilder> = InputBlock & {
	element: Element extends InteractiveElementBuilder<infer Output> ? Output : never
}

export class InputBlockBuilder<
	Element extends InputElementBuilder,
	HasLabel extends boolean = false,
> extends BlockBuilder<TypedInputBlock<Element>> {
	private _label?: TextObjectBuilder<false>

	constructor(private _element: Element) {
		super()
	}

	label(text: string | TextObjectBuilder<false>) {
		this._label = ensureIsTextObjectBuilder(text).plain()
		return this as InputBlockBuilder<Element, true>
	}

	override build(this: InputBlockBuilder<Element, true>): TypedInputBlock<Element> {
		if (!this._label) throw new SlackError('No label provided for input block')

		return { type: 'input', element: this._element.build() as any, label: this._label.build() }
	}
}

export function input<Element extends InputElementBuilder>(element: Element) {
	return new InputBlockBuilder(element)
}

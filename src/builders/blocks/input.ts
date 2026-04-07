import type { InputBlock } from '@slack/types'
import { BlockBuilder } from './base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { PlainTextInputBuilder } from './elements/plain_text_input'
import { SlackError } from '../../error'
import type { InteractiveElementBuilder } from './elements/base'

type InputElementBuilder = PlainTextInputBuilder<string>

type TypedInputBlock<Element extends InputElementBuilder, BlockID extends string> = InputBlock & {
	block_id: BlockID
	element: Element extends InteractiveElementBuilder<infer Output> ? Output : never
}

export class InputBlockBuilder<
	Element extends InputElementBuilder,
	HasLabel extends boolean = false,
	BlockID extends string = string,
> extends BlockBuilder<TypedInputBlock<Element, BlockID>, BlockID> {
	private _label?: TextObjectBuilder<false>

	constructor(private _element: Element) {
		super()
	}

	override id<BlockID extends string>(
		blockId: BlockID,
	): InputBlockBuilder<Element, HasLabel, BlockID> {
		return this._id(blockId)
	}

	label(text: string | TextObjectBuilder<false>) {
		this._label = ensureIsTextObjectBuilder(text).plain()
		return this as InputBlockBuilder<Element, true>
	}

	override build(
		this: InputBlockBuilder<Element, true, BlockID>,
	): TypedInputBlock<Element, BlockID> {
		if (!this._label) throw new SlackError('No label provided for input block')

		return {
			...this._build(),
			type: 'input',
			element: this._element.build() as any,
			label: this._label.build(),
		}
	}
}

export function input<Element extends InputElementBuilder>(element: Element) {
	return new InputBlockBuilder(element)
}

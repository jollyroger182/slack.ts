import type { InputBlock } from '@slack/types'
import { SlackError } from '../error'
import { BlockBuilder } from './base'
import type { BlockElementBuilder } from './elements/base'
import type { CheckboxesBuilder } from './elements/checkboxes'
import { DatePickerBuilder } from './elements/date_picker'
import type { PlainTextInputBuilder } from './elements/plain_text_input'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'

type InputElementBuilder =
	| CheckboxesBuilder<any, string>
	| DatePickerBuilder
	| PlainTextInputBuilder<string>

type TypedInputBlock<Element extends InputElementBuilder, BlockID extends string> = InputBlock & {
	block_id: BlockID
	element: Element extends BlockElementBuilder<infer Output> ? Output : never
}

/**
 * Builder for input blocks.
 *
 * Input blocks contain interactive elements for collecting user input.
 *
 * @template Element The input element type
 * @template HasLabel Whether a label has been set
 * @template BlockID The block ID type
 */
export class InputBlockBuilder<
	Element extends InputElementBuilder,
	HasLabel extends boolean = false,
	BlockID extends string = string,
> extends BlockBuilder<TypedInputBlock<Element, BlockID>, BlockID, HasLabel> {
	private _label?: TextObjectBuilder<false>

	constructor(private _element: Element) {
		super()
	}

	override id<BlockID extends string>(
		blockId: BlockID,
	): InputBlockBuilder<Element, HasLabel, BlockID> {
		return this._id(blockId)
	}

	/**
	 * Sets the label for this input block.
	 *
	 * @param text The label text
	 * @returns This builder with the label set
	 */
	label(text: string | TextObjectBuilder<false>): InputBlockBuilder<Element, true, BlockID> {
		this._label = ensureIsTextObjectBuilder(text).plain()
		return this as any
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

/**
 * Creates an input block builder.
 *
 * @param element The input element (typically a plain text input)
 * @returns An input block builder
 */
export function input<Element extends InputElementBuilder>(element: Element) {
	return new InputBlockBuilder(element)
}

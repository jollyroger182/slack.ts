import type { SectionBlock } from '@slack/types'
import { BlockBuilder, Builder } from './base'
import type { ButtonBuilder } from './elements/button'
import type { CheckboxesBuilder } from './elements/checkboxes'
import type { DatePickerBuilder } from './elements/date_picker'
import type { ImageBuilder } from './elements/image'
import type { OverflowBuilder } from './elements/overflow'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { StaticSelectBuilder } from './elements/static_select'

type SectionAccessoryBuilder =
	| ButtonBuilder
	| CheckboxesBuilder<any, string>
	| DatePickerBuilder
	| ImageBuilder<true>
	| OverflowBuilder<any>
	| StaticSelectBuilder<any>

type TypedSectionBlock<
	Mrkdwn extends boolean | undefined = boolean | undefined,
	Accessory extends SectionAccessoryBuilder | undefined = undefined,
	BlockID extends string = string,
> = SectionBlock & {
	block_id: BlockID
} & (Mrkdwn extends true
		? { text: { type: 'mrkdwn' } }
		: Mrkdwn extends false
			? { text: { type: 'plain_text' } }
			: { text?: never }) &
	(Accessory extends Builder<infer Output> ? { accessory: Output } : { accessory?: never })

/**
 * Builder for section blocks.
 *
 * Section blocks display text with optional fields and an accessory element.
 *
 * @template Mrkdwn Whether the text uses markdown formatting
 * @template HasFields Whether fields have been added
 * @template Accessory The accessory element type (button or overflow menu)
 * @template BlockID The block ID type
 */
export class SectionBlockBuilder<
	Mrkdwn extends boolean | undefined = boolean | undefined,
	HasFields extends boolean = false,
	Accessory extends SectionAccessoryBuilder | undefined = undefined,
	BlockID extends string = string,
> extends BlockBuilder<
	TypedSectionBlock<Mrkdwn, Accessory, BlockID>,
	BlockID,
	HasFields extends true ? true : Mrkdwn extends boolean ? true : false
> {
	private _accessory: Accessory = undefined as any
	private _expand?: boolean
	private _fields?: TextObjectBuilder[]

	constructor(private _text?: TextObjectBuilder<Mrkdwn extends boolean ? Mrkdwn : boolean>) {
		super()
	}

	override id<BlockID extends string>(
		blockId: BlockID,
	): SectionBlockBuilder<Mrkdwn, HasFields, Accessory, BlockID> {
		return this._id(blockId)
	}

	/**
	 * Sets the accessory element (button or overflow menu).
	 *
	 * @param accessory The accessory element to display
	 * @returns This builder with the accessory set
	 */
	accessory<Accessory extends SectionAccessoryBuilder>(
		accessory: Accessory,
	): SectionBlockBuilder<Mrkdwn, HasFields, Accessory, BlockID> {
		this._accessory = accessory as any
		return this as any
	}

	/**
	 * Sets whether the section should expand to fill the available width.
	 *
	 * @param expand Whether to expand the section
	 * @returns This builder
	 */
	expand(expand: boolean) {
		this._expand = expand
		return this
	}

	/**
	 * Adds field text to display in columns.
	 *
	 * @param fields Text or text objects for the fields
	 * @returns This builder with fields added
	 */
	fields(
		...fields: (string | TextObjectBuilder)[]
	): SectionBlockBuilder<Mrkdwn, true, Accessory, BlockID> {
		if (!this._fields) this._fields = []
		this._fields.push(...fields.map((f) => ensureIsTextObjectBuilder(f)))
		return this as any
	}

	override build(): TypedSectionBlock<Mrkdwn, Accessory, BlockID> {
		return {
			...this._build(),
			type: 'section',
			fields: this._fields ? this._fields.map((f) => f.build()) : undefined,
			text: this._text?.build(),
			accessory: this._accessory?.build(),
			expand: this._expand,
		} satisfies SectionBlock as any
	}
}

/**
 * Creates a section block builder without text.
 *
 * @returns A section block builder
 */
export function section(): SectionBlockBuilder<undefined>
/**
 * Creates a section block builder with markdown text.
 *
 * @param text The markdown text to display
 * @returns A section block builder
 */
export function section(text: string): SectionBlockBuilder<true>
/**
 * Creates a section block builder with text.
 *
 * @param text The text object with formatting
 * @returns A section block builder
 */
export function section<Mrkdwn extends boolean>(
	text: TextObjectBuilder<Mrkdwn>,
): SectionBlockBuilder<Mrkdwn>
/**
 * Creates a section block builder with fields.
 *
 * @param field0 The first field text
 * @param fields Additional field texts
 * @returns A section block builder with fields
 */
export function section(
	field0: string | TextObjectBuilder,
	...fields: (string | TextObjectBuilder)[]
): SectionBlockBuilder<undefined, true>
export function section(...texts: (string | TextObjectBuilder)[]) {
	if (texts.length === 0) {
		return new SectionBlockBuilder()
	}
	if (texts.length === 1) {
		return new SectionBlockBuilder(ensureIsTextObjectBuilder(texts[0]!))
	}
	return new SectionBlockBuilder().fields(...texts)
}

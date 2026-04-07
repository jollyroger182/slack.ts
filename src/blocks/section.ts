import { BlockBuilder } from './base'
import type { SectionBlock } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { OverflowBuilder } from './elements/overflow'
import type { ButtonBuilder } from './elements/button'
import type { InteractiveElementBuilder } from './elements/base'

type SectionAccessoryBuilder = ButtonBuilder | OverflowBuilder<any>

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
	(Accessory extends InteractiveElementBuilder<infer Output>
		? { accessory: Output }
		: { accessory?: never })

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

	accessory<Accessory extends SectionAccessoryBuilder>(
		accessory: Accessory,
	): SectionBlockBuilder<Mrkdwn, HasFields, Accessory, BlockID> {
		this._accessory = accessory as any
		return this as any
	}

	expand(expand: boolean) {
		this._expand = expand
		return this
	}

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

export function section(): SectionBlockBuilder<undefined>
export function section(text: string): SectionBlockBuilder<true>
export function section<Mrkdwn extends boolean>(
	text: TextObjectBuilder<Mrkdwn>,
): SectionBlockBuilder<Mrkdwn>
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

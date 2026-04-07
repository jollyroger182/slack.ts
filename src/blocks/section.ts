import { BlockBuilder } from './base'
import type { SectionBlock } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { OverflowBuilder } from './elements/overflow'
import type { ButtonBuilder } from './elements/button'
import type { InteractiveElementBuilder } from './elements/base'

type SectionAccessoryBuilder = ButtonBuilder | OverflowBuilder<any>

type TypedSectionBlock<
	Mrkdwn extends boolean = boolean,
	Accessory extends SectionAccessoryBuilder | undefined = undefined,
	BlockID extends string = string,
> = SectionBlock &
	(Mrkdwn extends true ? { text: { type: 'mrkdwn' } } : { text: { type: 'plain_text' } }) &
	(Accessory extends InteractiveElementBuilder<infer Output> ? { accessory: Output } : never) & {
		block_id: BlockID
	}

export class SectionBlockBuilder<
	Mrkdwn extends boolean = boolean,
	Accessory extends SectionAccessoryBuilder | undefined = undefined,
	BlockID extends string = string,
> extends BlockBuilder<TypedSectionBlock<Mrkdwn, Accessory, BlockID>, BlockID> {
	private _accessory: Accessory = undefined as any

	constructor(private _text: TextObjectBuilder<Mrkdwn>) {
		super()
	}

	override id<BlockID extends string>(
		blockId: BlockID,
	): SectionBlockBuilder<Mrkdwn, Accessory, BlockID> {
		return this._id(blockId)
	}

	accessory<Accessory extends SectionAccessoryBuilder>(
		accessory: Accessory,
	): SectionBlockBuilder<Mrkdwn, Accessory, BlockID> {
		this._accessory = accessory as any
		return this as any
	}

	override build(): TypedSectionBlock<Mrkdwn, Accessory, BlockID> {
		return {
			...this._build(),
			type: 'section',
			text: this._text.build(),
			accessory: this._accessory?.build(),
		} satisfies SectionBlock as any
	}
}

export function section(text: string): SectionBlockBuilder<true>
export function section<Mrkdwn extends boolean>(
	text: TextObjectBuilder<Mrkdwn>,
): SectionBlockBuilder<Mrkdwn>
export function section(text: string | TextObjectBuilder) {
	return new SectionBlockBuilder(ensureIsTextObjectBuilder(text))
}

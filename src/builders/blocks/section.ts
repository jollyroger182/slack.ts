import { BlockBuilder } from './base'
import type { SectionBlock } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'

type TypedSectionBlock<
	Mrkdwn extends boolean = boolean,
	BlockID extends string = string,
> = SectionBlock &
	(Mrkdwn extends true ? { text: { type: 'mrkdwn' } } : { text: { type: 'plain_text' } }) & {
		block_id: BlockID
	}

export class SectionBlockBuilder<
	Mrkdwn extends boolean = boolean,
	BlockID extends string = string,
> extends BlockBuilder<TypedSectionBlock<Mrkdwn, BlockID>, BlockID> {
	constructor(private _text: TextObjectBuilder<Mrkdwn>) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): SectionBlockBuilder<Mrkdwn, BlockID> {
		return this._id(blockId)
	}

	override build(): TypedSectionBlock<Mrkdwn, BlockID> {
		return {
			...this._build(),
			type: 'section',
			text: this._text.build(),
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

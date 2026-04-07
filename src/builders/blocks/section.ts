import { BlockBuilder } from './base'
import type { SectionBlock } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'

type TypedSectionBlock<Mrkdwn extends boolean = boolean> = SectionBlock &
	(Mrkdwn extends true ? { text: { type: 'mrkdwn' } } : { text: { type: 'plain_text' } })

export class SectionBlockBuilder<Mrkdwn extends boolean = boolean> extends BlockBuilder<
	TypedSectionBlock<Mrkdwn>
> {
	constructor(private _text: TextObjectBuilder<Mrkdwn>) {
		super()
	}

	override build(): TypedSectionBlock<Mrkdwn> {
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

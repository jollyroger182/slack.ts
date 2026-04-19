import type { HeaderBlock } from '@slack/types'
import { BlockBuilder } from './base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'

type TypedHeaderBlock<BlockID extends string> = HeaderBlock & { block_id: BlockID }

export class HeaderBlockBuilder<BlockID extends string = string> extends BlockBuilder<
	TypedHeaderBlock<BlockID>,
	BlockID
> {
	constructor(private _text: TextObjectBuilder<false>) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): HeaderBlockBuilder<BlockID> {
		return this._id(blockId)
	}

	override build(): TypedHeaderBlock<BlockID> {
		return { ...this._build(), type: 'header', text: this._text.build() }
	}
}

export function header(text: string | TextObjectBuilder<false>) {
	return new HeaderBlockBuilder(ensureIsTextObjectBuilder(text).plain())
}

import type { ContextBlock } from '@slack/types'
import { BlockBuilder } from './base'
import type { ImageBuilder } from './elements/image'
import { mrkdwn, type TextObjectBuilder } from './objects/text'

type ContextElementBuilder = ImageBuilder<true> | TextObjectBuilder

type TypedContextBlock<BlockID extends string> = ContextBlock & { block_id: BlockID }

export class ContextBlockBuilder<BlockID extends string> extends BlockBuilder<
	TypedContextBlock<BlockID>,
	BlockID
> {
	constructor(private elements: ContextElementBuilder[]) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): ContextBlockBuilder<BlockID> {
		return this._id(blockId)
	}

	override build(): TypedContextBlock<BlockID> {
		return { ...this._build(), type: 'context', elements: this.elements.map((e) => e.build()) }
	}
}

export function context(...elements: (ContextElementBuilder | string)[]) {
	return new ContextBlockBuilder(elements.map((e) => (typeof e === 'string' ? mrkdwn(e) : e)))
}

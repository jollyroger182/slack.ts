import type { DividerBlock } from '@slack/types'
import { BlockBuilder } from './base'

type TypedDividerBlock<BlockID extends string> = DividerBlock & { block_id: BlockID }

export class DividerBlockBuilder<BlockID extends string = string> extends BlockBuilder<
	TypedDividerBlock<BlockID>,
	BlockID
> {
	override id<BlockID extends string>(blockId: BlockID): DividerBlockBuilder<BlockID> {
		return this._id(blockId)
	}

	override build(): TypedDividerBlock<BlockID> {
		return { ...this._build(), type: 'divider' }
	}
}

export function divider() {
	return new DividerBlockBuilder()
}

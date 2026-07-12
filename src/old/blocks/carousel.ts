import { BlockBuilder } from './base'
import type { CardBlockBuilder } from './card'

type TypedCarouselBlock<
	BlockID extends string,
	Cards extends CardBlockBuilder<true, any[], string>[],
> = {
	type: 'carousel'
	elements: {
		[K in keyof Cards & number]: Cards[K] extends BlockBuilder<infer Output, any, true>
			? Output
			: never
	}
	block_id: BlockID
}

export class CarouselBlockBuilder<
	Cards extends CardBlockBuilder<true, any[], string>[],
	BlockID extends string = string,
> extends BlockBuilder<TypedCarouselBlock<BlockID, Cards>, BlockID> {
	constructor(private cards: Cards) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): CarouselBlockBuilder<Cards, BlockID> {
		return this._id(blockId)
	}

	override build(): TypedCarouselBlock<BlockID, Cards> {
		return {
			...this._build(),
			type: 'carousel',
			elements: this.cards.map((c) => c.build()) as any,
		}
	}
}

export function carousel<Cards extends CardBlockBuilder<true, any[], string>[]>(...cards: Cards) {
	return new CarouselBlockBuilder(cards)
}

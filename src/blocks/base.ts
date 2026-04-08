import { randomUUID } from 'crypto'

type BuilderResults<T extends BlockBuilder<unknown>[]> = {
	[K in keyof T]: T[K] extends BlockBuilder<infer Output> ? Output : never
}

/**
 * Builds an array of blocks that can be used in messages or views.
 *
 * @param blocks List of block builders to build
 * @returns Array of built blocks
 */
export function blocks<Builders extends BlockBuilder<unknown>[]>(
	...blocks: Builders
): BuilderResults<Builders> {
	return blocks.map((b) => b.build()) as BuilderResults<Builders>
}

/**
 * Base class for object builders.
 *
 * @template Output The type of object this builder creates when built
 */
export abstract class Builder<Output> {
	abstract build(): Output

	protected _build(): Record<never, never> {
		return {}
	}
}

/**
 * Base class for block builders.
 *
 * @template Output The type of block this builder creates when built
 * @template BlockID The block ID type
 * @template Complete Whether the block is complete and can be built
 */
export abstract class BlockBuilder<
	Output,
	BlockID extends string = string,
	Complete extends boolean = true,
> extends Builder<Output> {
	private _blockIsNotComplete?: Complete

	private _blockId: string = randomUUID()

	protected _id(id: string) {
		this._blockId = id
		return this as any
	}

	/**
	 * Sets the block ID.
	 *
	 * @param blockId The block ID to set
	 * @returns This builder with the new block ID type
	 */
	abstract id<BlockID extends string>(blockId: BlockID): BlockBuilder<unknown, BlockID, Complete>

	protected override _build(): { block_id: BlockID } {
		return { block_id: this._blockId as any }
	}
}

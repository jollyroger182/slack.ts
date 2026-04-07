import { randomUUID } from 'crypto'

type BuilderResults<T extends BlockBuilder<unknown>[]> = {
	[K in keyof T]: T[K] extends BlockBuilder<infer Output> ? Output : never
}

export function blocks<Builders extends BlockBuilder<unknown>[]>(
	...blocks: Builders
): BuilderResults<Builders> {
	return blocks.map((b) => b.build()) as BuilderResults<Builders>
}

export abstract class Builder<Output> {
	abstract build(): Output

	protected _build(): Record<never, never> {
		return {}
	}
}

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

	abstract id<BlockID extends string>(blockId: BlockID): BlockBuilder<unknown, BlockID, Complete>

	protected override _build(): { block_id: BlockID } {
		return { block_id: this._blockId as any }
	}
}

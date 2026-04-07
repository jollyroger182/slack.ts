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

export abstract class BlockBuilder<Output> extends Builder<Output> {
	private _blockId: string = randomUUID()

	id(blockId: string) {
		this._blockId = blockId
		return this
	}

	protected override _build(): { block_id?: string } {
		return { block_id: this._blockId }
	}
}

import { describe, expect, it } from 'bun:test'
import { blocks, Builder, BlockBuilder } from '../../src/blocks/base'

describe('Block Builders', () => {
	describe('Builder base class', () => {
		it('can be extended', () => {
			class TestBuilder extends Builder<{ type: string }> {
				build() {
					return { type: 'test' }
				}
			}
			const builder = new TestBuilder()
			expect(builder.build()).toEqual({ type: 'test' })
		})
	})

	describe('BlockBuilder base class', () => {
		it('generates UUID for block_id by default', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: string; block_id: string }> {
				override id<T extends string>() {
					return this
				}
				build() {
					return { type: 'test', ...this._build() }
				}
			}
			const builder = new TestBlockBuilder()
			const result = builder.build()
			expect(result.block_id).toBeDefined()
			expect(result.block_id).toHaveLength(36) // UUID length
		})

		it('can set custom block_id', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: string; block_id: string }> {
				override id<T extends string>(blockId: T) {
					this._id(blockId)
					return this
				}
				build() {
					return { type: 'test', ...this._build() }
				}
			}
			const builder = new TestBlockBuilder()
			const result = builder.id('custom-id').build()
			expect(result.block_id).toBe('custom-id')
		})

		it('can chain id() calls', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: string; block_id: string }> {
				override id<T extends string>(blockId: T) {
					this._id(blockId)
					return this
				}
				build() {
					return { type: 'test', ...this._build() }
				}
			}
			const builder = new TestBlockBuilder()
			builder.id('first').id('second')
			expect(builder.build().block_id).toBe('second')
		})

		it('returns this for method chaining', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: string; block_id: string }> {
				override id<T extends string>(blockId: T) {
					return this._id(blockId)
				}
				build() {
					return { type: 'test', ...this._build() }
				}
			}
			const builder = new TestBlockBuilder()
			const result = builder.id('test-id')
			expect(result).toEqual(builder)
		})
	})

	describe('blocks() utility', () => {
		it('builds array of blocks', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: string; block_id: string }> {
				override id<T extends string>(blockId: T) {
					this._id(blockId)
					return this
				}
				build() {
					return { type: 'test', ...this._build() }
				}
			}

			const builders = [new TestBlockBuilder(), new TestBlockBuilder()]
			const result = blocks(...builders)
			expect(result).toHaveLength(2)
			expect(result[0]?.type).toBe('test')
			expect(result[1]?.type).toBe('test')
		})

		it('returns typed array result', () => {
			class TestBlockBuilder extends BlockBuilder<{ value: number; block_id: string }> {
				override id<T extends string>(blockId: T) {
					this._id(blockId)
					return this
				}
				constructor(private value: number) {
					super()
				}
				build() {
					return { value: this.value, ...this._build() }
				}
			}

			const result = blocks(new TestBlockBuilder(1), new TestBlockBuilder(2))
			expect(result).toHaveLength(2)
			expect(result[0]?.value).toBe(1)
			expect(result[1]?.value).toBe(2)
		})

		it('preserves builder type information', () => {
			class TestBlockBuilder extends BlockBuilder<{ type: 'test'; block_id: string }> {
				override id<T extends string>(blockId: T) {
					this._id(blockId)
					return this
				}
				build() {
					return { type: 'test' as const, ...this._build() }
				}
			}

			const result = blocks(new TestBlockBuilder().id('id1'))
			expect(result[0]).toHaveProperty('type', 'test')
		})
	})
})

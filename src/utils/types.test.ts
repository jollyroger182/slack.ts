import { describe, expectTypeOf, it } from 'bun:test'

import type { Equals } from './types'

describe('Equals', () => {
	it('compares literal types correctly', () => {
		expectTypeOf<Equals<1, 1>>().toExtend<true>()
		expectTypeOf<Equals<1, 2>>().toExtend<false>()
		expectTypeOf<Equals<'1', '1'>>().toExtend<true>()
		expectTypeOf<Equals<'1', '2'>>().toExtend<false>()
		expectTypeOf<Equals<true, true>>().toExtend<true>()
		expectTypeOf<Equals<true, false>>().toExtend<false>()
	})

	it('compares object types correctly', () => {
		expectTypeOf<Equals<{}, {}>>().toExtend<true>()
		expectTypeOf<Equals<{}, { a: 1 }>>().toExtend<false>()
		expectTypeOf<Equals<{ a: 1 }, { a: 1 }>>().toExtend<true>()
	})

	it('compares object types with optional properties correctly', () => {
		expectTypeOf<Equals<{}, { a?: string }>>().toExtend<false>()
		expectTypeOf<Equals<{ a: string }, { a?: string }>>().toExtend<false>()
		expectTypeOf<Equals<{ a?: string }, { a?: string }>>().toExtend<true>()
	})
})

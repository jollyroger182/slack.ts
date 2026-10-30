import { describe, expectTypeOf, it } from 'bun:test'

import type {
	Action,
	ButtonAction,
	ButtonElement,
	Element,
	PlainTextInputAction,
	PlainTextInputElement,
} from './blocks/elements'
import type { BlockActions, DefaultAction } from './interactions'

describe('BlockActions', () => {
	it('defaults to allow any action', () => {
		expectTypeOf<BlockActions>().toEqualTypeOf<BlockActions<Action>>()
	})

	it('only allows the one defined element', () => {
		interface ElementMap extends Record<string, Element> {
			confirm: ButtonElement
		}

		expectTypeOf<BlockActions<DefaultAction<ElementMap>>>().toEqualTypeOf<
			BlockActions<ButtonAction & { action_id: 'confirm' }>
		>()
	})

	it('allows both defined elements', () => {
		interface ElementMap extends Record<string, Element> {
			confirm: ButtonElement
			deny: PlainTextInputElement
		}

		expectTypeOf<BlockActions<DefaultAction<ElementMap>>>().toEqualTypeOf<
			BlockActions<
				(ButtonAction & { action_id: 'confirm' }) | (PlainTextInputAction & { action_id: 'deny' })
			>
		>()
	})
})

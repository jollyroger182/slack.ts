import { section, SectionBlockBuilder } from '$/blocks/blocks/section'
import type { MrkdwnElement, PlainTextElement, SectionBlock } from '@slack/types'
import { describe, expect, expectTypeOf, it } from 'bun:test'

describe('section block builder', () => {
	it('works with text', () => {
		const block = section('hello world')

		expect(block).toMatchObject({ type: 'section', text: { type: 'mrkdwn', text: 'hello world' } })
		expectTypeOf(block).toEqualTypeOf<
			SectionBlockBuilder<{ type: 'section'; text: MrkdwnElement }>
		>()
	})

	it('works with setText', () => {
		const block = section().setText('hello world')

		expect(block).toMatchObject({ type: 'section', text: { type: 'mrkdwn', text: 'hello world' } })
		expectTypeOf(block).branded.toEqualTypeOf<
			SectionBlockBuilder<{
				type: 'section'
				text: MrkdwnElement
			}>
		>()
	})

	it('works with fields', () => {
		const block = section().addFields(
			'mrkdwn',
			{ type: 'plain_text', text: 'plain object' },
			{ type: 'mrkdwn', text: 'mrkdwn object' },
		)

		expect(block).toMatchObject({
			type: 'section',
			fields: [
				{ type: 'mrkdwn', text: 'mrkdwn' },
				{ type: 'plain_text', text: 'plain object' },
				{ type: 'mrkdwn', text: 'mrkdwn object' },
			],
		})
		expectTypeOf(block).branded.toEqualTypeOf<
			SectionBlockBuilder<{
				type: 'section'
				fields: [MrkdwnElement, PlainTextElement, MrkdwnElement]
			}>
		>()
	})

	it('works with text and fields', () => {
		const block = section('text').addFields('field')

		expect(block).toMatchObject({
			type: 'section',
			text: { type: 'mrkdwn', text: 'text' },
			fields: [{ type: 'mrkdwn', text: 'field' }],
		})
		expectTypeOf(block).branded.toEqualTypeOf<
			SectionBlockBuilder<{ type: 'section'; text: MrkdwnElement; fields: [MrkdwnElement] }>
		>()
	})

	it.skip('works with button accessory', () => {})

	it('can set expand', () => {
		const block = section('text')

		expect(block.setExpand()).toMatchObject({ expand: true })
		expect(block.setExpand(false)).toMatchObject({ expand: false })
		expectTypeOf(block.setExpand()).branded.toEqualTypeOf<
			SectionBlockBuilder<{ type: 'section'; text: MrkdwnElement; expand: boolean }>
		>()
	})

	it('works with generic block type', () => {
		const block: SectionBlockBuilder<SectionBlock> = section()

		block.setText('123')
	})

	it('can set block id', () => {
		const block = section().setId('id')

		expect(block).toMatchObject({ type: 'section', block_id: 'id' })
		expectTypeOf(block).branded.toEqualTypeOf<
			SectionBlockBuilder<{ type: 'section'; block_id: 'id' }>
		>
	})
})

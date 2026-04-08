import { describe, expect, it } from 'bun:test'
import { section, input, actions, button, plainTextInput, mrkdwn, blocks } from '../../src/blocks'
import type {
	ExtractValues,
	ExtractBlockValues,
	ExtractActions,
	ExtractBlockActions,
	ActionsToPrefixedID,
} from '../../src/blocks/utils/extract'

describe('Block Type Extraction', () => {
	describe('Block building with type safety', () => {
		it('builds section blocks with typed action_ids', () => {
			const sect = section('text').id('section-1')
			const built = sect.build()
			expect(built.block_id).toBe('section-1')
		})

		it('builds input blocks with element action_ids', () => {
			const inp = input(plainTextInput().id('email-input')).id('email-form').label('Email')
			const built = inp.build()
			expect(built.block_id).toBe('email-form')
			expect(built.element.action_id).toBe('email-input')
		})

		it('builds actions blocks with multiple element action_ids', () => {
			const act = actions(
				button('Submit').id('submit-btn').value('yes'),
				button('Cancel').id('cancel-btn').value('no'),
			).id('form-actions')

			const built = act.build()
			expect(built.block_id).toBe('form-actions')
			expect(built.elements[0]?.action_id).toBe('submit-btn')
			expect(built.elements[1]?.action_id).toBe('cancel-btn')
		})

		it('extracts individual block values', () => {
			const block = input(plainTextInput().id('name')).id('form-1').label('Name').build()
			expect(block).toHaveProperty('element')
			expect(block.element).toHaveProperty('action_id', 'name')
		})

		it('handles multiple blocks in array', () => {
			const blockArr = blocks(
				section('heading').id('header'),
				input(plainTextInput().id('field-1')).id('input-1').label('Field'),
				actions(button('Go').id('btn-1')).id('actions-1'),
			)

			expect(blockArr).toHaveLength(3)
			expect(blockArr[0]?.block_id).toBe('header')
			expect(blockArr[1]?.block_id).toBe('input-1')
			expect(blockArr[2]?.block_id).toBe('actions-1')
		})
	})

	describe('Complex block combinations', () => {
		it('builds section with accessory element', () => {
			const sect = section('Choose an action')
				.id('section-1')
				.accessory(button('Click').id('action-btn'))

			const built = sect.build()
			expect(built.block_id).toBe('section-1')
			expect(built.accessory?.type).toBe('button')
			expect(built.accessory?.action_id).toBe('action-btn')
		})

		it('builds input with label', () => {
			const inp = input(plainTextInput().id('username')).id('user-input').label('Username')

			const built = inp.build()
			expect(built.block_id).toBe('user-input')
			expect(built.label?.text).toBe('Username')
			expect(built.element.action_id).toBe('username')
		})

		it('builds actions with multiple buttons', () => {
			const act = actions(
				button('Yes').id('yes-btn').value('yes'),
				button('No').id('no-btn').value('no'),
				button('Maybe').id('maybe-btn').value('maybe'),
			).id('decision-block')

			const built = act.build()
			expect(built.block_id).toBe('decision-block')
			expect(built.elements).toHaveLength(3)
		})
	})

	describe('Type inference', () => {
		it('preserves block_id type through compilation', () => {
			const customId = 'my-unique-id' as const
			const sect = section('text').id(customId)
			const built = sect.build()
			expect(built.block_id).toBe('my-unique-id')
		})

		it('preserves action_id type through compilation', () => {
			const customAction = 'email-action' as const
			const btn = button('Email').id(customAction)
			const built = btn.build()
			expect(built.action_id).toBe('email-action')
		})

		it('combines multiple id types in blocks array', () => {
			const blockArray = blocks(
				section('Section').id('section-1'),
				input(plainTextInput().id('name')).id('form-name').label('Name'),
			)

			expect(blockArray[0]?.block_id).toBe('section-1')
			expect(blockArray[1]?.block_id).toBe('form-name')
			expect(blockArray[1]?.element.action_id).toBe('name')
		})
	})

	describe('Runtime block structure validation', () => {
		it('extracts correct structure from input block', () => {
			const block = input(plainTextInput().id('field')).id('input-block').label('Field').build()

			// Verify the structure matches expected extraction
			expect(block).toHaveProperty('block_id')
			expect(block).toHaveProperty('element')
			expect(block.element).toHaveProperty('type', 'plain_text_input')
			expect(block.element).toHaveProperty('action_id', 'field')
		})

		it('extracts correct structure from actions block', () => {
			const block = actions(button('Btn1').id('action1'), button('Btn2').id('action2'))
				.id('actions-block')
				.build()

			// Verify the structure
			expect(block).toHaveProperty('block_id')
			expect(block).toHaveProperty('elements')
			expect(block.elements).toHaveLength(2)
			expect(block.elements[0]).toHaveProperty('type', 'button')
			expect(block.elements[0]).toHaveProperty('action_id', 'action1')
		})

		it('extracts correct structure from section block', () => {
			const block = section('Section text').id('section-block').build()

			expect(block).toHaveProperty('block_id', 'section-block')
			expect(block).toHaveProperty('type', 'section')
			expect(block).toHaveProperty('text')
		})
	})

	describe('Generic type parameters', () => {
		it('handles generic block arrays with proper typing', () => {
			const section1 = section('S1').id('s1')
			const section2 = section('S2').id('s2')

			const builtBlocks = blocks(section1, section2)
			expect(builtBlocks).toHaveLength(2)
			expect(builtBlocks[0]?.block_id).toBe('s1')
			expect(builtBlocks[1]?.block_id).toBe('s2')
		})

		it('preserves element type through generics', () => {
			// Input blocks with specific element types
			const textInput = input(plainTextInput().id('text')).id('text-input').label('Text')
			const built = textInput.build()

			expect(built.element.type).toBe('plain_text_input')
		})
	})
})

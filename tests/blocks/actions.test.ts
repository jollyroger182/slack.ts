import { describe, expect, it } from 'bun:test'
import { actions, button } from '../../src/blocks'

describe('Actions Block', () => {
	describe('Factory function', () => {
		it('creates actions block with elements', () => {
			const act = actions(button('Click me'))
			const built = act.build()
			expect(built.type).toBe('actions')
			expect(built.elements).toHaveLength(1)
			expect(built.elements[0]?.type).toBe('button')
		})

		it('creates actions block with multiple elements', () => {
			const act = actions(button('Btn1'), button('Btn2'))
			const built = act.build()
			expect(built.elements).toHaveLength(2)
		})

		it('initializes block_id', () => {
			const act = actions(button('Test'))
			const built = act.build()
			expect(built.block_id).toBeDefined()
			expect(built.block_id).toHaveLength(36) // UUID
		})
	})

	describe('ActionsBlockBuilder methods', () => {
		it('sets custom block_id', () => {
			const act = actions(button('Click')).id('actions-1')
			const built = act.build()
			expect(built.block_id).toBe('actions-1')
		})

		it('adds actions after creation', () => {
			const act = actions(button('First')).action(button('Second'))
			const built = act.build()
			expect(built.elements).toHaveLength(2)
		})

		it('chains multiple action() calls', () => {
			const act = actions(button('First')).action(button('Second')).action(button('Third'))

			const built = act.build()
			expect(built.elements).toHaveLength(3)
		})

		it('chains with id() setter', () => {
			const act = actions(button('Click')).id('my-actions').action(button('Another'))

			const built = act.build()
			expect(built.block_id).toBe('my-actions')
			expect(built.elements).toHaveLength(2)
		})
	})

	describe('Build output', () => {
		it('has correct slack block type', () => {
			const act = actions(button('Test'))
			const built = act.build()
			expect(built.type).toBe('actions')
		})

		it('elements are built', () => {
			const act = actions(
				button('Button 1').id('btn1').value('val1'),
				button('Button 2').id('btn2'),
			)
			const built = act.build()
			expect(built.elements).toHaveLength(2)
			expect(built.elements[0]?.action_id).toBe('btn1')
			expect(built.elements[0]?.value).toBe('val1')
		})
	})
})

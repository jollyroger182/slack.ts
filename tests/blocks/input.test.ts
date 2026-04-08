import { describe, expect, it } from 'bun:test'
import { input, plainTextInput, plain } from '../../src/blocks'

describe('Input Block', () => {
	describe('Factory function', () => {
		it('creates input block with element', () => {
			const inp = input(plainTextInput()).label('Enter value')
			const built = inp.build()
			expect(built.type).toBe('input')
			expect(built.element.type).toBe('plain_text_input')
		})

		it('initializes with automatic block_id', () => {
			const inp = input(plainTextInput()).label('Enter value')
			const built = inp.build()
			expect(built.block_id).toBeDefined()
			expect(built.block_id).toHaveLength(36) // UUID
		})
	})

	describe('InputBlockBuilder methods', () => {
		it('sets block_id', () => {
			const inp = input(plainTextInput()).id('input-1').label('Label')
			const built = inp.build()
			expect(built.block_id).toBe('input-1')
		})

		it('sets label', () => {
			const inp = input(plainTextInput()).label('Enter your name')
			const built = inp.build()
			expect(built.label?.text).toBe('Enter your name')
			expect(built.label?.type).toBe('plain_text')
		})

		it('sets label with text object', () => {
			const inp = input(plainTextInput()).label(plain('Label text'))
			const built = inp.build()
			expect(built.label?.text).toBe('Label text')
		})

		it('chains multiple methods', () => {
			const inp = input(plainTextInput()).id('name-input').label('Your Name')

			const built = inp.build()
			expect(built.block_id).toBe('name-input')
			expect(built.label?.text).toBe('Your Name')
		})
	})

	describe('Build output', () => {
		it('has correct slack block type', () => {
			const inp = input(plainTextInput()).label('L')
			const built = inp.build()
			expect(built.type).toBe('input')
		})

		it('includes label and element', () => {
			const inp = input(plainTextInput()).label('Test Label').id('test-input')

			const built = inp.build()
			expect(built).toHaveProperty('label')
			expect(built).toHaveProperty('element')
			expect(built).toHaveProperty('block_id', 'test-input')
		})

		it('element is properly built', () => {
			const inp = input(plainTextInput().id('pti-1').default('initial value')).label('L')
			const built = inp.build()
			expect(built.element.action_id).toBe('pti-1')
			expect(built.element.initial_value).toBe('initial value')
		})
	})
})

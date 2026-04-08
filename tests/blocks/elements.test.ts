import { describe, expect, it } from 'bun:test'
import { button, plainTextInput, overflow, option, confirm, plain } from '../../src/blocks'

describe('Block Elements', () => {
	describe('ButtonBuilder', () => {
		it('creates button with text', () => {
			const btn = button('Click Me')
			const built = btn.build()
			expect(built.type).toBe('button')
			expect(built.text.type).toBe('plain_text')
			expect(built.text.text).toBe('Click Me')
		})

		it('auto-generates action_id', () => {
			const btn = button('Test')
			const built = btn.build()
			expect(built.action_id).toBeDefined()
			expect(built.action_id).toHaveLength(36) // UUID
		})

		it('sets custom action_id', () => {
			const btn = button('Test').id('btn-123')
			const built = btn.build()
			expect(built.action_id).toBe('btn-123')
		})

		it('sets value', () => {
			const btn = button('Submit').value('form_data')
			const built = btn.build()
			expect(built.value).toBe('form_data')
		})

		it('sets url', () => {
			const btn = button('Link').url('https://example.com')
			const built = btn.build()
			expect(built.url).toBe('https://example.com')
		})

		it('sets style', () => {
			const btn = button('Danger').style('danger')
			const built = btn.build()
			expect(built.style).toBe('danger')
		})

		it('sets accessibility label', () => {
			const btn = button('🎯').accessibilityLabel('Bullseye emoji')
			const built = btn.build()
			expect(built.accessibility_label).toBe('Bullseye emoji')
		})

		it('chains method calls', () => {
			const btn = button('Action').id('action-btn').value('data').style('primary')

			const built = btn.build()
			expect(built.action_id).toBe('action-btn')
			expect(built.value).toBe('data')
			expect(built.style).toBe('primary')
		})
	})

	describe('PlainTextInputBuilder', () => {
		it('creates plain text input', () => {
			const inp = plainTextInput()
			const built = inp.build()
			expect(built.type).toBe('plain_text_input')
			expect(built.action_id).toBeDefined()
		})

		it('sets action_id', () => {
			const inp = plainTextInput().id('text-input')
			const built = inp.build()
			expect(built.action_id).toBe('text-input')
		})

		it('sets multiline', () => {
			const inp = plainTextInput().multiline(true)
			let built = inp.build()
			expect(built.multiline).toBe(true)

			const inp2 = plainTextInput().multiline(false)
			built = inp2.build()
			expect(built.multiline).toBe(false)
		})

		it('sets default value', () => {
			const inp = plainTextInput().default('initial text')
			const built = inp.build()
			expect(built.initial_value).toBe('initial text')
		})

		it('sets placeholder', () => {
			const inp = plainTextInput().placeholder('Enter text...')
			const built = inp.build()
			expect(built.placeholder?.text).toBe('Enter text...')
		})

		it('sets autofocus', () => {
			const inp = plainTextInput().autofocus(true)
			const built = inp.build()
			expect(built.focus_on_load).toBe(true)
		})

		it('sets min/max length', () => {
			const inp = plainTextInput().min(5).max(100)
			const built = inp.build()
			expect(built.min_length).toBe(5)
			expect(built.max_length).toBe(100)
		})

		it('chains method calls', () => {
			const inp = plainTextInput()
				.id('bio')
				.multiline(true)
				.placeholder('Tell us about yourself')
				.min(10)
				.max(500)

			const built = inp.build()
			expect(built.action_id).toBe('bio')
			expect(built.multiline).toBe(true)
			expect(built.max_length).toBe(500)
		})
	})

	describe('OverflowBuilder', () => {
		it('creates overflow menu', () => {
			const over = overflow(option('Option 1', 'val1'))
			const built = over.build()
			expect(built.type).toBe('overflow')
			expect(built.action_id).toBeDefined()
		})

		it('auto-generates action_id', () => {
			const over = overflow(option('Option', 'val'))
			const built = over.build()
			expect(built.action_id).toHaveLength(36) // UUID
		})

		it('sets custom action_id', () => {
			const over = overflow(option('Opt', 'v')).id('menu-1')
			const built = over.build()
			expect(built.action_id).toBe('menu-1')
		})

		it('builds multiple options', () => {
			const over = overflow(
				option('First', 'first'),
				option('Second', 'second'),
				option('Third', 'third'),
			)
			const built = over.build()
			expect(built.options).toHaveLength(3)
		})

		it('sets confirm dialog', () => {
			const conf = confirm({
				title: 'Delete?',
				text: 'Confirm deletion',
				confirm: 'Delete',
				deny: 'Cancel',
			})
			const over = overflow(option('Delete', 'del')).confirm(conf)
			const built = over.build()
			expect(built.confirm).toBeDefined()
		})

		it('chains method calls', () => {
			const conf = confirm({
				title: 'Are you sure?',
				text: 'This action cannot be undone',
				confirm: 'Continue',
				deny: 'Cancel',
			})
			const over = overflow(option('Edit', 'edit'), option('Delete', 'delete'))
				.id('item-menu')
				.confirm(conf)

			const built = over.build()
			expect(built.action_id).toBe('item-menu')
			expect(built.options).toHaveLength(2)
			expect(built.confirm).toBeDefined()
		})
	})
})

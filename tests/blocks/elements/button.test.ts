import { button, ButtonElementBuilder, plain } from '$/blocks'
import { describe, expect, expectTypeOf, it } from 'bun:test'

describe('button element builder', () => {
	it('creates a button object with text', () => {
		const obj = button('text')

		expect(obj).toMatchObject({ type: 'button', text: { type: 'plain_text', text: 'text' } })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('creates a button object with plain text element', () => {
		const obj = button(plain('plain'))

		expect(obj).toMatchObject({ type: 'button', text: { type: 'plain_text', text: 'plain' } })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('can set action id', () => {
		const obj = button('text').setId('action')

		expect(obj).toMatchObject({ action_id: 'action' })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<'action'>>()
	})

	it('can set text', () => {
		const obj = button('text').setText('new text')

		expect(obj).toMatchObject({ text: { text: 'new text' } })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it.skip('can set confirm', () => {})

	it('can set value', () => {
		const obj = button('text').setValue('value')

		expect(obj).toMatchObject({ value: 'value' })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('can set url', () => {
		const obj = button('text').setUrl('https://example.com')

		expect(obj).toMatchObject({ url: 'https://example.com' })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('can set style', () => {
		const danger = button('text').setStyle('danger')

		expect(danger).toMatchObject({ style: 'danger' })
		expectTypeOf(danger).toEqualTypeOf<ButtonElementBuilder<string>>()

		const primary = button('text').setStyle('primary')

		expect(primary).toMatchObject({ style: 'primary' })
		expectTypeOf(primary).toEqualTypeOf<ButtonElementBuilder<string>>()

		const dangerShortcut = button('text').setDanger()

		expect(dangerShortcut).toMatchObject({ style: 'danger' })
		expectTypeOf(dangerShortcut).toEqualTypeOf<ButtonElementBuilder<string>>()

		const primaryShortcut = button('text').setPrimary()

		expect(primaryShortcut).toMatchObject({ style: 'primary' })
		expectTypeOf(primaryShortcut).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('can set accessibility label', () => {
		const obj = button('text').setAccessibilityLabel('label')

		expect(obj).toMatchObject({ accessibility_label: 'label' })
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<string>>()
	})

	it('can chain methods', () => {
		const obj = button('text')
			.setId('id')
			.setText('new text')
			.setValue('value')
			.setUrl('https://example.com')
			.setStyle('primary')
			.setAccessibilityLabel('label')

		expect(obj).toMatchObject({
			type: 'button',
			action_id: 'id',
			text: { type: 'plain_text', text: 'new text' },
			value: 'value',
			url: 'https://example.com',
			style: 'primary',
			accessibility_label: 'label',
		})
		expectTypeOf(obj).toEqualTypeOf<ButtonElementBuilder<'id'>>()
	})
})

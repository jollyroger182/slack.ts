import { confirm, ConfirmObjectBuilder } from '$/blocks'
import type { PlainTextElement } from '@slack/types'
import { describe, expect, expectTypeOf, it } from 'bun:test'

describe('confirm object builder', () => {
	it('creates a confirm object', () => {
		const obj = confirm()
			.setTitle('title')
			.setText('text')
			.setConfirm('confirm')
			.setDeny('deny')
			.setStyle('primary')

		expect(obj).toMatchObject({
			title: { type: 'plain_text', text: 'title' },
			text: { type: 'plain_text', text: 'text' },
			confirm: { type: 'plain_text', text: 'confirm' },
			deny: { type: 'plain_text', text: 'deny' },
			style: 'primary',
		})
		expectTypeOf(obj).toEqualTypeOf<
			ConfirmObjectBuilder<PlainTextElement, PlainTextElement, PlainTextElement, PlainTextElement>
		>()
	})

	it('style shortcuts work', () => {
		const primary = confirm().setPrimary()
		expect(primary).toMatchObject({ style: 'primary' })

		const danger = confirm().setDanger()
		expect(danger).toMatchObject({ style: 'danger' })
	})
})

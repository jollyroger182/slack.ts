import { describe, expect, it } from 'bun:test'
import { mrkdwn, plain, text, option, confirm } from '../../src/blocks'

describe('Block Objects', () => {
	describe('TextObjectBuilder', () => {
		it('creates markdown text', () => {
			const txt = mrkdwn('*bold* text')
			const built = txt.build()
			expect(built.type).toBe('mrkdwn')
			expect(built.text).toBe('*bold* text')
		})

		it('creates plain text', () => {
			const txt = plain('plain text')
			const built = txt.build()
			expect(built.type).toBe('plain_text')
			expect(built.text).toBe('plain text')
		})

		it('uses text() factory which defaults to markdown', () => {
			const txt = text('some text')
			const built = txt.build()
			expect(built.type).toBe('mrkdwn')
			expect(built.text).toBe('some text')
		})

		it('converts between formats', () => {
			let txt = mrkdwn('*bold*')
			let built = txt.build()
			expect(built.type).toBe('mrkdwn')

			txt = txt.plain()
			built = txt.build()
			expect(built.type).toBe('plain_text')
		})

		it('enables emoji for plain text', () => {
			const txt = plain('text').emoji(true)
			const built = txt.build()
			expect(built.emoji).toBe(true)
		})

		it('sets emoji with method chain', () => {
			const txt = plain('text').emoji()
			const built = txt.build()
			expect(built.emoji).toBe(true)
		})

		it('enables verbatim for markdown', () => {
			const txt = mrkdwn('*not bold*').verbatim(true)
			const built = txt.build()
			expect(built.verbatim).toBe(true)
		})

		it('chains multiple format methods', () => {
			const txt = text('text').mrkdwn(true).verbatim(true)

			const built = txt.build()
			expect(built.type).toBe('mrkdwn')
			expect(built.verbatim).toBe(true)
		})
	})

	describe('OptionObjectBuilder', () => {
		it('creates option with text and value', () => {
			const opt = option('Display Text', 'value')
			const built = opt.build()
			expect(built.text?.type).toBe('plain_text')
			expect(built.text?.text).toBe('Display Text')
			expect(built.value).toBe('value')
		})

		it('creates option with text and explicit value', () => {
			const opt = option('Option', 'option-value')
			const built = opt.build()
			expect(built.text?.text).toBe('Option')
			expect(built.value).toBe('option-value')
		})

		it('sets value using value() method', () => {
			const opt = option('Option Text').value('opt-1')
			const built = opt.build()
			expect(built.text?.text).toBe('Option Text')
			expect(built.value).toBe('opt-1')
		})

		it('accepts string or text object', () => {
			const opt1 = option('String option', 'val')
			let built = opt1.build()
			expect(built.text?.text).toBe('String option')

			const opt2 = option(plain('Object option'), 'val')
			built = opt2.build()
			expect(built.text?.text).toBe('Object option')
		})

		it('builds multiple options in array', () => {
			const opts = [
				option('First', 'first'),
				option('Second', 'second'),
				option('Third', 'third'),
			].map((o) => o.build())

			expect(opts).toHaveLength(3)
			expect(opts[0]?.value).toBe('first')
			expect(opts[2]?.value).toBe('third')
		})
	})

	describe('ConfirmBuilder', () => {
		it('creates confirm dialog', () => {
			const conf = confirm({
				title: 'Confirm',
				text: 'Are you sure?',
				confirm: 'Yes',
				deny: 'No',
			})
			const built = conf.build()
			expect(built).toHaveProperty('title')
			expect(built).toHaveProperty('text')
			expect(built).toHaveProperty('confirm')
			expect(built).toHaveProperty('deny')
		})

		it('sets title', () => {
			const conf = confirm({
				title: 'Confirm Action',
				text: 'Are you sure?',
				confirm: 'Yes',
				deny: 'No',
			})
			const built = conf.build()
			expect(built.title?.text).toBe('Confirm Action')
		})

		it('sets text', () => {
			const conf = confirm({
				title: 'Confirm',
				text: 'Are you sure?',
				confirm: 'Yes',
				deny: 'No',
			})
			const built = conf.build()
			expect(built.text?.text).toBe('Are you sure?')
		})

		it('sets confirm button text', () => {
			const conf = confirm({
				title: 'Confirm',
				text: 'Delete?',
				confirm: 'Yes, delete',
				deny: 'No',
			})
			const built = conf.build()
			expect(built.confirm?.text).toBe('Yes, delete')
		})

		it('sets deny button text', () => {
			const conf = confirm({
				title: 'Confirm',
				text: 'Delete?',
				confirm: 'Delete',
				deny: 'Cancel',
			})
			const built = conf.build()
			expect(built.deny?.text).toBe('Cancel')
		})

		it('sets style', () => {
			const conf = confirm({
				title: 'Confirm',
				text: 'Delete?',
				confirm: 'Delete',
				deny: 'Cancel',
				style: 'danger',
			})
			const built = conf.build()
			expect(built.style).toBe('danger')
		})

		it('chains multiple setters', () => {
			const conf = confirm()
				.title('Delete Item?')
				.text('This cannot be undone.')
				.confirm('Delete Forever')
				.deny('Keep It')
				.style('danger')

			const built = conf.build()
			expect(built.title?.text).toBe('Delete Item?')
			expect(built.text?.text).toBe('This cannot be undone.')
			expect(built.confirm?.text).toBe('Delete Forever')
			expect(built.deny?.text).toBe('Keep It')
			expect(built.style).toBe('danger')
		})

		it('accepts text objects', () => {
			const conf = confirm({
				title: 'Delete?',
				text: plain('Plain text confirmation'),
				confirm: 'Yes',
				deny: 'No',
			})
			const built = conf.build()
			expect(built.text?.type).toBe('plain_text')
		})
	})
})

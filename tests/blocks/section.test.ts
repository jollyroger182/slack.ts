import { describe, expect, it } from 'bun:test'
import { section, mrkdwn, plain, button } from '../../src/blocks'

describe('Section Block', () => {
	describe('Factory functions', () => {
		it('creates section without text', () => {
			const sect = section()
			const built = sect.build()
			expect(built.type).toBe('section')
			expect(built.text).toBeUndefined()
			expect(built.block_id).toBeDefined()
		})

		it('creates section with string text (markdown)', () => {
			const sect = section('*bold* text')
			const built = sect.build()
			expect(built.type).toBe('section')
			expect(built.text?.type).toBe('mrkdwn')
			expect(built.text?.text).toBe('*bold* text')
		})

		it('creates section with text object', () => {
			const sect = section(mrkdwn('markdown text'))
			const built = sect.build()
			expect(built.type).toBe('section')
			expect(built.text?.type).toBe('mrkdwn')
			expect(built.text?.text).toBe('markdown text')
		})

		it('creates section with fields', () => {
			const sect = section('field1', 'field2', 'field3')
			const built = sect.build()
			expect(built.type).toBe('section')
			expect(built.fields).toHaveLength(3)
			expect(built.fields?.[0]?.text).toBe('field1')
		})

		it('creates section with mixed field types', () => {
			const sect = section('string field', plain('plain text'))
			const built = sect.build()
			expect(built.fields).toHaveLength(2)
			expect(built.fields?.[0]?.type).toBe('mrkdwn')
			expect(built.fields?.[1]?.type).toBe('plain_text')
		})
	})

	describe('Section builder methods', () => {
		it('sets block_id', () => {
			const sect = section('text').id('section-123')
			const built = sect.build()
			expect(built.block_id).toBe('section-123')
		})

		it('sets accessory element', () => {
			const sect = section('text').accessory(button('Click me'))
			const built = sect.build()
			expect(built.accessory).toBeDefined()
			expect(built.accessory?.type).toBe('button')
		})

		it('sets expand property', () => {
			const sect = section('text').expand(true)
			let built = sect.build()
			expect(built.expand).toBe(true)

			const sect2 = section('text').expand(false)
			built = sect2.build()
			expect(built.expand).toBe(false)
		})

		it('adds fields to field array', () => {
			const sect = section().fields('field1', 'field2').fields('field3')

			const built = sect.build()
			expect(built.fields).toHaveLength(3)
			expect(built.fields?.[0]?.text).toBe('field1')
			expect(built.fields?.[2]?.text).toBe('field3')
		})

		it('chains multiple method calls', () => {
			const sect = section('Section title').id('my-section').expand(true).fields('extra', 'fields')

			const built = sect.build()
			expect(built.block_id).toBe('my-section')
			expect(built.text?.text).toBe('Section title')
			expect(built.expand).toBe(true)
			expect(built.fields).toHaveLength(2)
		})
	})

	describe('Text formatting', () => {
		it('preserves markdown text', () => {
			const sect = section('*bold* _italic_ `code`')
			const built = sect.build()
			expect(built.text?.text).toBe('*bold* _italic_ `code`')
			expect(built.text?.type).toBe('mrkdwn')
		})

		it('supports plain text', () => {
			const sect = section(plain('plain text'))
			const built = sect.build()
			expect(built.text?.type).toBe('plain_text')
			expect(built.text?.text).toBe('plain text')
		})

		it('defaults to markdown for string input', () => {
			const sect = section('some text')
			const built = sect.build()
			expect(built.text?.type).toBe('mrkdwn')
		})
	})

	describe('Build output', () => {
		it('includes all Slack block properties', () => {
			const sect = section('text').id('sec-1')
			const built = sect.build()
			expect(built).toHaveProperty('type', 'section')
			expect(built).toHaveProperty('block_id', 'sec-1')
			expect(built).toHaveProperty('text')
		})

		it('omits undefined properties', () => {
			const sect = section()
			const built = sect.build()
			// Check that undefined properties are omitted or explicitly undefined
			expect(built.type).toBe('section')
			expect(built.block_id).toBeDefined()
		})
	})
})

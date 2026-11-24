import { describe, expect, expectTypeOf, it, spyOn } from 'bun:test'

import { Confirm } from '../jsx'
import * as jsxUtils from './jsx'
import {
	ensureChildren,
	isBlock,
	isElement,
	isImageElement,
	isTextObject,
	JSXError,
	makeComponent,
	toConfirm,
	toMrkdwn,
	toPlain,
	toTextObject,
} from './jsx'

describe('jsx utils', () => {
	describe('ensureChildren', () => {
		it('flattens arrays', () => {
			expect(ensureChildren(['a', ['b', 'c'], 'd'])).toEqual(['a', 'b', 'c', 'd'])
		})

		it('converts numbers to strings', () => {
			expect(ensureChildren([1])).toEqual(['1'])
		})

		it('filters out falsy values and booleans', () => {
			expect(ensureChildren([null, false, true, undefined])).toBeArrayOfSize(0)
		})
	})

	describe('makeComponent', () => {
		it('adds children to the component type', () => {
			expectTypeOf(makeComponent<{ id: string }>(() => {})).branded.toEqualTypeOf<
				(props: { id: string; children?: any }) => any
			>()
		})

		it('calls ensureChildren on the children prop', () => {
			const ensureChildrenSpy = spyOn(jsxUtils, 'ensureChildren')
			ensureChildrenSpy.mockReturnValueOnce(['spy value'])

			try {
				const Component = makeComponent(({ children }) => children)

				expect(Component({ children: ['input value'] })).toEqual(['spy value'])
				expect(ensureChildrenSpy).toBeCalledTimes(1)
				expect(ensureChildrenSpy).toBeCalledWith(['input value'])
			} finally {
				ensureChildrenSpy.mockRestore()
			}
		})
	})

	describe('toTextObject', () => {
		it('creates mrkdwn objects', () => {
			expect(toTextObject(['hello world'])).toEqual({ type: 'mrkdwn', text: 'hello world' })
			expect(toTextObject(['hello world'], { verbatim: true })).toEqual({
				type: 'mrkdwn',
				text: 'hello world',
				verbatim: true,
			})
		})

		it('creates plain text objects', () => {
			expect(toTextObject(['hello world'], { plain: true })).toEqual({
				type: 'plain_text',
				text: 'hello world',
			})
			expect(toTextObject(['hello world'], { plain: true, emoji: false })).toEqual({
				type: 'plain_text',
				text: 'hello world',
				emoji: false,
			})
		})

		it('joins input parameters', () => {
			expect(toTextObject(['hello', ' world'])).toEqual({ type: 'mrkdwn', text: 'hello world' })
		})

		it('parses intrinsic tags in mrkdwn mode', () => {
			expect(
				toTextObject(
					<>
						<b>bold</b> <i>italic</i> <s>strike</s> <code>code</code>{' '}
						<a href="https://example.com">link</a>
					</>,
				),
			).toEqual({
				type: 'mrkdwn',
				text: '*bold* _italic_ ~strike~ `code` <https://example.com|link>',
			})
		})

		it('intrinsic tags throw in plain text mode', () => {
			expect(() =>
				toTextObject(
					<>
						<b>test</b>
					</>,
					{ plain: true },
				),
			).toThrow(JSXError)
		})

		it('returns undefined when no text is provided', () => {
			expect(toTextObject([])).toBeUndefined()
			expect(toTextObject([], { plain: true })).toBeUndefined()
		})
	})

	describe('toPlain', () => {
		it('converts text to text (i know right)', () => {
			expect(toPlain(['hello world'])).toBe('hello world')
		})

		it('drops nullish values', () => {
			expect(toPlain(['hello', undefined, null, ' world'])).toBe('hello world')
		})

		it('throws on anything not a string', () => {
			expect(() => toPlain([0])).toThrow(JSXError)
			expect(() => toPlain([{ type: 'plain_text', text: 'hello' }])).toThrow(JSXError)
			expect(() => toPlain([true])).toThrow(JSXError)
		})
	})

	describe('toMrkdwn', () => {
		it('converts text to text', () => {
			expect(toMrkdwn(['hello world'])).toBe('hello world')
		})

		it('converts formatting objects to text', () => {
			expect(
				toMrkdwn([
					<b>bold</b>,
					<i>italic</i>,
					<s>strike</s>,
					<code>code</code>,
					<a href="https://example.com">link</a>,
				]),
			).toBe('*bold*_italic_~strike~`code`<https://example.com|link>')
		})

		it('throws on underlines', () => {
			expect(() => toMrkdwn([<u>text</u>])).toThrow(JSXError)
		})

		it('throws on unsupported objects', () => {
			expect(() => toMrkdwn([0])).toThrow(JSXError)
			expect(() => toMrkdwn([{ type: 'plain_text', text: 'hello' }])).toThrow(JSXError)
			expect(() => toMrkdwn([true])).toThrow(JSXError)
		})
	})

	describe('toConfirm', () => {
		it('wraps text in a confirm object', () => {
			expect(toConfirm('hello world')).toEqual({
				text: { type: 'plain_text', text: 'hello world' },
			})
		})

		it('lets confirm objects through unchanged', () => {
			const confirm = (
				<Confirm title="title" confirm="confirm" deny="deny" primary>
					hello world
				</Confirm>
			)

			expect(toConfirm(confirm)).toEqual(confirm)
		})

		it('throws an error on invalid objects', () => {
			expect(() => toConfirm(0)).toThrow(JSXError)
			expect(() => toConfirm({})).toThrow(JSXError)
			expect(() => toConfirm({ text: 'hello world' })).toThrow(JSXError)
		})

		it('lets through undefined', () => {
			expect(toConfirm(undefined)).toBeUndefined()
		})
	})

	describe('isBlock', () => {
		it('returns true for a block', () => {
			expect(isBlock({ type: 'actions' })).toBeTrue()
		})

		it('returns true for images', () => {
			expect(isBlock({ type: 'image' })).toBeTrue()
		})

		it('returns false for non-block elements', () => {
			expect(isBlock({ type: 'button' })).toBeFalse()
		})

		it('returns false for non-objects', () => {
			expect(isBlock(0)).toBeFalse()
			expect(isBlock('text')).toBeFalse()
			expect(isBlock(false)).toBeFalse()
			expect(isBlock(null)).toBeFalse()
		})
	})

	describe('isElement', () => {
		it('returns true for an element', () => {
			expect(isElement({ type: 'button' })).toBeTrue()
		})

		it('returns true for images', () => {
			expect(isElement({ type: 'image' })).toBeTrue()
		})

		it('returns false for non-element blocks', () => {
			expect(isElement({ type: 'section' })).toBeFalse()
		})

		it('returns false for non-objects', () => {
			expect(isElement(0)).toBeFalse()
			expect(isElement('text')).toBeFalse()
			expect(isElement(false)).toBeFalse()
			expect(isElement(null)).toBeFalse()
		})
	})

	describe('isTextObject', () => {
		it('returns true for text objects', () => {
			expect(isTextObject({ type: 'mrkdwn', text: 'hello world' })).toBeTrue()
			expect(isTextObject({ type: 'plain_text', text: 'hello world' })).toBeTrue()
		})

		it('returns false for non-text objects', () => {
			expect(isTextObject({ type: 'death' })).toBeFalse()
			expect(isTextObject(0)).toBeFalse()
			expect(isTextObject('text')).toBeFalse()
			expect(isTextObject(false)).toBeFalse()
			expect(isTextObject(null)).toBeFalse()
		})
	})

	describe('isImageElement', () => {
		it('returns true for image elements', () => {
			expect(
				isImageElement({ type: 'image', alt_text: 'text', image_url: 'https://example.com' }),
			).toBeTrue()
			expect(
				isImageElement({ type: 'image', alt_text: 'text', slack_file: { id: 'F123' } }),
			).toBeTrue()
			expect(
				isImageElement({
					type: 'image',
					alt_text: 'text',
					slack_file: { url: 'https://example.com' },
				}),
			).toBeTrue()
		})

		it('returns false for non-images', () => {
			expect(isImageElement({ type: 'button' })).toBeFalse()
			expect(isImageElement(0)).toBeFalse()
			expect(isImageElement('text')).toBeFalse()
			expect(isImageElement(false)).toBeFalse()
			expect(isImageElement(null)).toBeFalse()
		})

		it('returns false for image blocks', () => {
			expect(
				isImageElement({
					type: 'image',
					alt_text: 'text',
					image_url: 'https://example.com',
					block_id: 'blkid',
				}),
			).toBeFalse()
			expect(
				isImageElement({
					type: 'image',
					alt_text: 'text',
					image_url: 'https://example.com',
					title: 'title',
				}),
			).toBeFalse()
		})
	})
})

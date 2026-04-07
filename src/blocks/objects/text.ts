import type { MrkdwnElement, PlainTextElement } from '@slack/types'
import { Builder } from '../base'

export class TextObjectBuilder<Mrkdwn extends boolean = boolean> extends Builder<
	Mrkdwn extends true ? MrkdwnElement : PlainTextElement
> {
	private _emoji = false
	private _verbatim = false

	constructor(
		private _text: string,
		private _mrkdwn: Mrkdwn,
	) {
		super()
	}

	emoji(this: TextObjectBuilder<false>, emoji: boolean = true) {
		this._emoji = emoji
		return this
	}

	verbatim(this: TextObjectBuilder<true>, verbatim: boolean = true) {
		this._verbatim = verbatim
		return this
	}

	mrkdwn(): TextObjectBuilder<true>
	mrkdwn<Mrkdwn extends boolean = true>(mrkdwn: Mrkdwn): TextObjectBuilder<Mrkdwn>
	mrkdwn(mrkdwn: boolean = true) {
		this._mrkdwn = mrkdwn as any
		return this as any
	}

	plain(): TextObjectBuilder<false> {
		return this.mrkdwn(false)
	}

	override build(): Mrkdwn extends true ? MrkdwnElement : PlainTextElement {
		if (this._mrkdwn) {
			return {
				type: 'mrkdwn',
				text: this._text,
				verbatim: this._verbatim,
			} satisfies MrkdwnElement as any
		} else {
			return {
				type: 'plain_text',
				text: this._text,
				emoji: this._emoji,
			} satisfies PlainTextElement as any
		}
	}
}

export function mrkdwn(text: string): TextObjectBuilder<true> {
	return new TextObjectBuilder(text, true)
}

export { mrkdwn as text }

export function plain(text: string): TextObjectBuilder<false> {
	return new TextObjectBuilder(text, false)
}

export function ensureIsTextObjectBuilder(text: string): TextObjectBuilder<true>
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(text: T): T
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(
	text: string | T,
): TextObjectBuilder<true> | T
export function ensureIsTextObjectBuilder(text?: string): TextObjectBuilder<true> | undefined
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(text?: T): T | undefined
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(
	text?: string | T,
): TextObjectBuilder<true> | T | undefined
export function ensureIsTextObjectBuilder(text?: string | TextObjectBuilder) {
	return text === undefined
		? undefined
		: typeof text === 'string'
			? new TextObjectBuilder(text, true)
			: text
}

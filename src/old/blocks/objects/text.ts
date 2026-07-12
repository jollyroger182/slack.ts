import type { MrkdwnElement, PlainTextElement } from '@slack/types'
import { Builder } from '../base'

/**
 * Builder for text objects.
 *
 * Text objects support both plain text and markdown formatting.
 *
 * @template Mrkdwn Whether markdown formatting is enabled
 */
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

	/**
	 * Enables emoji rendering for plain text (converts `:emoji_name:` to emoji).
	 *
	 * Only applicable to plain text objects.
	 *
	 * @param emoji Whether to enable emoji rendering
	 * @returns This builder
	 */
	emoji(this: TextObjectBuilder<false>, emoji: boolean = true) {
		this._emoji = emoji
		return this
	}

	/**
	 * Disables automatic parsing of markdown formatting.
	 *
	 * Only applicable to markdown text objects.
	 *
	 * @param verbatim Whether to disable formatting
	 * @returns This builder
	 */
	verbatim(this: TextObjectBuilder<true>, verbatim: boolean = true) {
		this._verbatim = verbatim
		return this
	}

	/**
	 * Switches to markdown formatting.
	 *
	 * @returns This builder with markdown enabled
	 */
	mrkdwn(): TextObjectBuilder<true>
	/**
	 * Switches between plain text and markdown formatting.
	 *
	 * @param mrkdwn Whether to enable markdown
	 * @returns This builder with the specified format
	 */
	mrkdwn<Mrkdwn extends boolean = true>(mrkdwn: Mrkdwn): TextObjectBuilder<Mrkdwn>
	mrkdwn(mrkdwn: boolean = true) {
		this._mrkdwn = mrkdwn as any
		return this as any
	}

	/**
	 * Switches to plain text formatting.
	 *
	 * @returns This builder with plain text formatting
	 */
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

/**
 * Creates a markdown text object builder.
 *
 * @param text The markdown text
 * @returns A text object builder with markdown enabled
 */
export function mrkdwn(text: string): TextObjectBuilder<true> {
	return new TextObjectBuilder(text, true)
}

/** Alias for `mrkdwn()`. */
export { mrkdwn as text }

/**
 * Creates a plain text object builder.
 *
 * @param text The plain text
 * @returns A text object builder with plain text format
 */
export function plain(text: string): TextObjectBuilder<false> {
	return new TextObjectBuilder(text, false)
}

/**
 * Converts a string to a text object builder if needed.
 *
 * If the input is already a text object builder, it is returned as-is. If the input is a string, it
 * is converted to a markdown text object builder.
 *
 * @param text A string or text object builder
 * @returns A markdown text object builder
 */
export function ensureIsTextObjectBuilder(text: string): TextObjectBuilder<true>
/**
 * Returns the text object builder as-is if it's already one.
 *
 * @param text A text object builder
 * @returns The same text object builder
 */
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(text: T): T
/**
 * Converts a string to a text object builder or returns the builder as-is.
 *
 * @param text A string or text object builder
 * @returns A text object builder
 */
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(
	text: string | T,
): TextObjectBuilder<true> | T
/**
 * Converts an optional string to a text object builder if present.
 *
 * @param text An optional string
 * @returns A markdown text object builder or undefined
 */
export function ensureIsTextObjectBuilder(text?: string): TextObjectBuilder<true> | undefined
/**
 * Returns an optional text object builder as-is if present.
 *
 * @param text An optional text object builder
 * @returns The text object builder or undefined
 */
export function ensureIsTextObjectBuilder<T extends TextObjectBuilder>(text?: T): T | undefined
/**
 * Converts an optional string to a text object builder or returns the builder as-is.
 *
 * @param text An optional string or text object builder
 * @returns A text object builder or undefined
 */
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

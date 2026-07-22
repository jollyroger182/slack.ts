import type { MrkdwnElement, PlainTextElement } from '@slack/types'

export class MrkdwnTextObjectBuilder implements MrkdwnElement {
	readonly type: 'mrkdwn' = 'mrkdwn'
	verbatim?: boolean

	constructor(public text: string) {}

	setVerbatim(verbatim = true) {
		this.verbatim = verbatim
		return this
	}

	plain() {
		return new PlainTextObjectBuilder(this.text)
	}
}

export class PlainTextObjectBuilder implements PlainTextElement {
	readonly type: 'plain_text' = 'plain_text'
	emoji?: boolean = true

	constructor(public text: string) {}

	setEmoji(emoji: boolean = true) {
		this.emoji = emoji
		return this
	}

	mrkdwn() {
		return new MrkdwnTextObjectBuilder(this.text)
	}
}

export function mrkdwn(text: string | MrkdwnTextObjectBuilder | PlainTextObjectBuilder) {
	return typeof text === 'string'
		? new MrkdwnTextObjectBuilder(text)
		: text.type === 'mrkdwn'
			? text
			: text.mrkdwn()
}

export function plain(text: string | MrkdwnTextObjectBuilder | PlainTextObjectBuilder) {
	return typeof text === 'string'
		? new PlainTextObjectBuilder(text)
		: text.type === 'plain_text'
			? text
			: text.plain()
}

export function textOrMrkdwn(text: string | MrkdwnTextObjectBuilder): MrkdwnTextObjectBuilder
export function textOrMrkdwn(text: PlainTextElement): PlainTextObjectBuilder
export function textOrMrkdwn(
	text: string | MrkdwnElement | PlainTextElement,
): MrkdwnTextObjectBuilder | PlainTextObjectBuilder
export function textOrMrkdwn(text: string | MrkdwnElement | PlainTextElement) {
	return typeof text === 'string' ? new MrkdwnTextObjectBuilder(text) : text
}

export function textOrPlain(text: string | PlainTextElement): PlainTextObjectBuilder
export function textOrPlain(text: MrkdwnElement): MrkdwnTextObjectBuilder
export function textOrPlain(
	text: string | MrkdwnElement | PlainTextElement,
): MrkdwnTextObjectBuilder | PlainTextObjectBuilder
export function textOrPlain(text: string | MrkdwnElement | PlainTextElement) {
	return typeof text === 'string' ? new PlainTextObjectBuilder(text) : text
}

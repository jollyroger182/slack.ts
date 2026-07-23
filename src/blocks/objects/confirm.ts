import type { ColorScheme, ConfirmationDialog, PlainTextElement } from '@slack/types'
import { textOrPlain } from './text'

export class ConfirmObjectBuilder<
	Title extends PlainTextElement | undefined = PlainTextElement,
	Text extends PlainTextElement | undefined = PlainTextElement,
	Confirm extends PlainTextElement | undefined = PlainTextElement,
	Deny extends PlainTextElement | undefined = PlainTextElement,
> implements Partial<ConfirmationDialog> {
	title: Title
	text: Text
	confirm: Confirm
	deny: Deny
	style?: ColorScheme

	constructor(data: {
		title: Title
		text: Text
		confirm: Confirm
		deny: Deny
		style?: ColorScheme
	}) {
		this.title = data.title
		this.text = data.text
		this.confirm = data.confirm
		this.deny = data.deny
		this.style = data.style
	}

	setTitle(title: string | PlainTextElement) {
		return new ConfirmObjectBuilder<PlainTextElement, Text, Confirm, Deny>({
			...this,
			title: textOrPlain(title),
		})
	}

	setText(text: string | PlainTextElement) {
		return new ConfirmObjectBuilder<Title, PlainTextElement, Confirm, Deny>({
			...this,
			text: textOrPlain(text),
		})
	}

	setConfirm(confirm: string | PlainTextElement) {
		return new ConfirmObjectBuilder<Title, Text, PlainTextElement, Deny>({
			...this,
			confirm: textOrPlain(confirm),
		})
	}

	setDeny(deny: string | PlainTextElement) {
		return new ConfirmObjectBuilder<Title, Text, Confirm, PlainTextElement>({
			...this,
			deny: textOrPlain(deny),
		})
	}

	setStyle(style: ColorScheme) {
		return new ConfirmObjectBuilder({ ...this, style })
	}

	setPrimary() {
		return this.setStyle('primary')
	}

	setDanger() {
		return this.setStyle('danger')
	}
}

export function confirm() {
	return new ConfirmObjectBuilder({
		title: undefined,
		text: undefined,
		confirm: undefined,
		deny: undefined,
	})
}

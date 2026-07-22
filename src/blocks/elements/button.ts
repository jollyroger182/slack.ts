import type { Button, ColorScheme, ConfirmationDialog, PlainTextElement } from '@slack/types'
import { textOrPlain } from '../objects'

export class ButtonElementBuilder<ActionID extends string = string> implements Button {
	readonly type: 'button' = 'button'
	action_id?: ActionID
	// @ts-expect-error
	text: PlainTextElement
	confirm?: ConfirmationDialog
	value?: string
	url?: string
	style?: ColorScheme
	accessibility_label?: string

	constructor(data: Button & { action_id?: ActionID }) {
		Object.assign(this, data)
	}

	setId<NewActionID extends string = string>(id: NewActionID): ButtonElementBuilder<NewActionID> {
		return new ButtonElementBuilder({ ...this, action_id: id })
	}

	setText(text: string | PlainTextElement) {
		return new ButtonElementBuilder({ ...this, text: textOrPlain(text) })
	}

	// setConfirm()

	setValue(value: string) {
		return new ButtonElementBuilder({ ...this, value })
	}

	setUrl(url: string) {
		return new ButtonElementBuilder({ ...this, url })
	}

	setStyle(style: ColorScheme) {
		return new ButtonElementBuilder({ ...this, style })
	}

	setPrimary() {
		return this.setStyle('primary')
	}

	setDanger() {
		return this.setStyle('danger')
	}

	setAccessibilityLabel(accessibilityLabel: string) {
		return new ButtonElementBuilder({ ...this, accessibility_label: accessibilityLabel })
	}
}

export function button(text: string | PlainTextElement) {
	return new ButtonElementBuilder({ type: 'button', text: textOrPlain(text) })
}

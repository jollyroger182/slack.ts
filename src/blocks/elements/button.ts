import type { Button, ColorScheme } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedButton<ActionID extends string> = Button & { action_id: ActionID }

export class ButtonBuilder<ActionID extends string = string> extends BlockElementBuilder<
	TypedButton<ActionID>,
	ActionID
> {
	private _value?: string
	private _url?: string
	private _style?: ColorScheme
	private _accessibilityLabel?: string

	constructor(private _text: TextObjectBuilder<false>) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): ButtonBuilder<ActionID> {
		return this._id(actionId)
	}

	value(value: string) {
		this._value = value
		return this
	}

	url(url: string) {
		this._url = url
		return this
	}

	style(style: ColorScheme) {
		this._style = style
		return this
	}

	accessibilityLabel(accessibilityLabel: string) {
		this._accessibilityLabel = accessibilityLabel
		return this
	}

	override build(): TypedButton<ActionID> {
		return {
			...this._build(),
			type: 'button',
			text: this._text.build(),
			value: this._value,
			url: this._url,
			style: this._style,
			accessibility_label: this._accessibilityLabel,
		}
	}
}

export function button(text: string | TextObjectBuilder<false>) {
	return new ButtonBuilder(ensureIsTextObjectBuilder(text).plain())
}

import type { Button, ColorScheme } from '@slack/types'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'

type TypedButton<ActionID extends string> = Button & { action_id: ActionID }

/**
 * Builder for button elements.
 *
 * Button elements are interactive elements that can be clicked to trigger actions.
 *
 * @template ActionID The action ID type used to identify this button
 */
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

	/**
	 * Sets the value for this button.
	 *
	 * @param value The button value sent with the action
	 * @returns This builder
	 */
	value(value: string) {
		this._value = value
		return this
	}

	/**
	 * Sets a URL for this button to open.
	 *
	 * @param url The URL to open when clicked
	 * @returns This builder
	 */
	url(url: string) {
		this._url = url
		return this
	}

	/**
	 * Sets the style for this button.
	 *
	 * @param style The button style ('primary' or 'danger')
	 * @returns This builder
	 */
	style(style: ColorScheme) {
		this._style = style
		return this
	}

	/**
	 * Sets the accessibility label for this button.
	 *
	 * @param accessibilityLabel The accessibility label
	 * @returns This builder
	 */
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

/**
 * Creates a button element builder.
 *
 * @param text The button text
 * @returns A button element builder
 */
export function button(text: string | TextObjectBuilder<false>) {
	return new ButtonBuilder(ensureIsTextObjectBuilder(text).plain())
}

import type { ColorScheme, ConfirmationDialog } from '@slack/types'
import { Builder } from '../base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './text'
import { SlackError } from '../../error'

/**
 * Builder for confirmation dialogs.
 *
 * Confirmation dialogs are displayed when users interact with interactive elements and require
 * confirmation before the action is executed.
 *
 * @template HasTitle Whether a title has been set
 * @template HasText Whether text has been set
 * @template HasConfirm Whether the confirm button text has been set
 * @template HasDeny Whether the deny button text has been set
 */
export class ConfirmBuilder<
	HasTitle extends boolean = false,
	HasText extends boolean = false,
	HasConfirm extends boolean = false,
	HasDeny extends boolean = false,
> extends Builder<ConfirmationDialog> {
	private _brand?: [HasTitle, HasText, HasConfirm, HasDeny]

	constructor(
		private _title?: TextObjectBuilder<false>,
		private _text?: TextObjectBuilder,
		private _confirm?: TextObjectBuilder<false>,
		private _deny?: TextObjectBuilder<false>,
		private _style?: ColorScheme,
	) {
		super()
	}

	/**
	 * Sets the title for this confirmation dialog.
	 *
	 * @param title The dialog title
	 * @returns This builder with the title set
	 */
	title(
		title: string | TextObjectBuilder<false>,
	): ConfirmBuilder<true, HasText, HasConfirm, HasDeny> {
		this._title = ensureIsTextObjectBuilder(title).plain()
		return this as any
	}

	/**
	 * Sets the text for this confirmation dialog.
	 *
	 * @param text The dialog text
	 * @returns This builder with the text set
	 */
	text(text: string | TextObjectBuilder): ConfirmBuilder<HasTitle, true, HasConfirm, HasDeny> {
		this._text = ensureIsTextObjectBuilder(text)
		return this as any
	}

	/**
	 * Sets the text for the confirm button.
	 *
	 * @param confirm The confirm button text
	 * @returns This builder with the confirm button text set
	 */
	confirm(
		confirm: string | TextObjectBuilder<false>,
	): ConfirmBuilder<HasTitle, HasText, true, HasDeny> {
		this._confirm = ensureIsTextObjectBuilder(confirm).plain()
		return this as any
	}

	/**
	 * Sets the text for the deny button.
	 *
	 * @param deny The deny button text
	 * @returns This builder with the deny button text set
	 */
	deny(
		deny: string | TextObjectBuilder<false>,
	): ConfirmBuilder<HasTitle, HasText, HasConfirm, true> {
		this._deny = ensureIsTextObjectBuilder(deny).plain()
		return this as any
	}

	/**
	 * Sets the style for the confirm button.
	 *
	 * @param style The button style ('primary' or 'danger')
	 * @returns This builder
	 */
	style(style: ColorScheme) {
		this._style = style
		return this
	}

	override build(this: ConfirmBuilder<true, true, true, true>): ConfirmationDialog {
		if (!this._title || !this._text || !this._confirm || !this._deny) {
			throw new SlackError('title, text, confirm, or deny missing for confirmation dialog')
		}
		return {
			title: this._title.build(),
			text: this._text.build(),
			confirm: this._confirm.build(),
			deny: this._deny.build(),
			style: this._style,
		}
	}
}

/**
 * Creates a confirmation dialog builder.
 *
 * Accepts partial field configuration. The `title`, `text`, `confirm`, and `deny` fields must be
 * set before calling `build()`.
 *
 * @param fields Optional initial configuration fields
 * @returns A confirmation dialog builder
 */
export function confirm<
	Fields extends {
		title?: string | TextObjectBuilder<false>
		text?: string | TextObjectBuilder
		confirm?: string | TextObjectBuilder<false>
		deny?: string | TextObjectBuilder<false>
		style?: ColorScheme
	} = {},
>(
	fields?: Fields,
): ConfirmBuilder<
	Fields extends { title: string | TextObjectBuilder<false> } ? true : false,
	Fields extends { text: string | TextObjectBuilder } ? true : false,
	Fields extends { confirm: string | TextObjectBuilder<false> } ? true : false,
	Fields extends { deny: string | TextObjectBuilder<false> } ? true : false
> {
	return new ConfirmBuilder(
		ensureIsTextObjectBuilder(fields?.title)?.plain(),
		ensureIsTextObjectBuilder(fields?.text),
		ensureIsTextObjectBuilder(fields?.confirm)?.plain(),
		ensureIsTextObjectBuilder(fields?.deny)?.plain(),
		fields?.style,
	)
}

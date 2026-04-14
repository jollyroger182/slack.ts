import type { ColorScheme, IconButton } from '@slack/types'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import { BlockElementBuilder } from './base'
import type { UserRef } from '../../resources'
import type { User } from '../../../dist'

type TypedIconButton<ActionID extends string> = IconButton & {
	action_id: ActionID
}

type Icon = 'trash'

export class IconButtonBuilder<ActionID extends string = string> extends BlockElementBuilder<
	TypedIconButton<ActionID>,
	ActionID
> {
	private _value?: string
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _accessibilityLabel?: string
	private _visibleToUserIds?: string[]

	constructor(
		private _icon: Icon,
		private _text: TextObjectBuilder<false>,
	) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): IconButtonBuilder<ActionID> {
		return this._id(actionId)
	}

	value(value: string) {
		this._value = value
		return this
	}

	/**
	 * Adds a confirmation dialog when the user clicks the button.
	 *
	 * @param confirm A confirmation builder or configuration object
	 * @returns This builder
	 */
	confirm(
		confirm:
			| ConfirmBuilder<true, true, true, true>
			| {
					title: string | TextObjectBuilder<false>
					text: string | TextObjectBuilder
					confirm: string | TextObjectBuilder<false>
					deny: string | TextObjectBuilder<false>
					style?: ColorScheme
			  },
	) {
		this._confirm = confirm instanceof ConfirmBuilder ? confirm : buildConfirm(confirm)
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

	/**
	 * Sets the users who can see this icon button. By default, all users can see it.
	 *
	 * @param users The users who can see this icon button
	 * @returns This builder
	 */
	visibleTo(...users: (string | UserRef | User)[]) {
		this._visibleToUserIds = users.map((u) => (typeof u === 'string' ? u : u.id))
		return this
	}

	override build(): TypedIconButton<ActionID> {
		return {
			...this._build(),
			type: 'icon_button',
			icon: this._icon,
			text: this._text.build(),
			value: this._value,
			confirm: this._confirm?.build(),
			accessibility_label: this._accessibilityLabel,
			visible_to_user_ids: this._visibleToUserIds,
		}
	}
}

export function iconButton(icon: Icon, text: string | TextObjectBuilder<false>) {
	return new IconButtonBuilder(icon, ensureIsTextObjectBuilder(text).plain())
}

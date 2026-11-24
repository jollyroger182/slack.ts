import type { ColorScheme as ButtonStyle } from '@slack/types'

import type { ConfirmationDialogObject } from '../types'
import { JSXError, makeComponent, toTextObject } from '../utils/jsx'

export const Confirm = makeComponent<{
	title?: string
	confirm?: string
	deny?: string
	style?: ButtonStyle
	primary?: boolean
	danger?: boolean
}>(({ title, confirm, deny, style, primary, danger, children }) => {
	if (style && (primary || danger)) {
		throw new JSXError('Button style and primary/danger cannot be used together')
	}

	const text = toTextObject(children, { plain: true })
	if (!text) {
		throw new JSXError('Confirm must have text')
	}

	return {
		title: toTextObject([title], { plain: true }),
		text,
		confirm: toTextObject([confirm], { plain: true }),
		deny: toTextObject([deny], { plain: true }),
		style: primary ? 'primary' : danger ? 'danger' : style,
	} satisfies ConfirmationDialogObject
})

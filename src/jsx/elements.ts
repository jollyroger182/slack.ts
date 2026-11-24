import type { ColorScheme as ButtonStyle } from '@slack/types'

import type { JSX } from '../jsx-runtime'
import type { ButtonElement, ImageBlock } from '../types'
import { JSXError, makeComponent, toConfirm, toTextObject } from '../utils/jsx'

export const Button = makeComponent<{
	id?: string
	value?: string
	url?: string
	style?: ButtonStyle
	primary?: boolean
	danger?: boolean
	accessibilityLabel?: string
	confirm?: any
}>(({ id, value, url, style, primary, danger, accessibilityLabel, confirm, children }) => {
	if (style && (primary || danger)) {
		throw new JSXError('Confirm style and primary/danger cannot be used together')
	}
	const text = toTextObject(children, { plain: true })
	if (!text) {
		throw new JSXError('Confirm must have text')
	}

	return {
		type: 'button',
		action_id: id,
		value,
		url,
		style: primary ? 'primary' : danger ? 'danger' : style,
		accessibility_label: accessibilityLabel,
		confirm: toConfirm(confirm),
		text,
	} satisfies ButtonElement
})

export function Image(props: { id?: string; title?: string; alt: string; src: string }): JSX.Element
export function Image(props: {
	id?: string
	title?: string
	alt: string
	fileId: string
}): JSX.Element
export function Image(props: {
	id?: string
	title?: string
	alt: string
	fileUrl: string
}): JSX.Element
export function Image(props: {
	id?: string
	title?: string
	alt: string
	src?: string
	fileId?: string
	fileUrl?: string
}) {
	if (
		(props.src && props.fileId) ||
		(props.src && props.fileUrl) ||
		(props.fileId && props.fileUrl)
	) {
		throw new JSXError('Image cannot have more than one of `src`, `fileId`, and `fileUrl`')
	}
	if (!props.src && !props.fileId && !props.fileUrl) {
		throw new JSXError('Image must have one of `src`, `fileId`, or `fileUrl`')
	}

	const fileProp: { slack_file: { id: string } | { url: string } } | { image_url: string } =
		props.src
			? { image_url: props.src }
			: { slack_file: props.fileId ? { id: props.fileId } : { url: props.fileUrl! } }

	return {
		type: 'image',
		block_id: props.id,
		title: props.title ? { type: 'plain_text', text: props.title } : undefined,
		alt_text: props.alt,
		...fileProp,
	} satisfies ImageBlock
}

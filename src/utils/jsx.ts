import type { JSX } from '../jsx-runtime'
import type {
	ConfirmationDialogObject,
	ImageElement,
	KnownBlock,
	KnownElement,
	MrkdwnObject,
	PlainTextObject,
} from '../types'

export function ensureChildren(children: any) {
	return flatten(Array.isArray(children) ? children : [children])
}

function flatten(array: any[]): any[] {
	return array
		.flatMap((x) => (Array.isArray(x) ? flatten(x) : [x]))
		.filter((x) => x !== null && x !== undefined && typeof x !== 'boolean')
		.map((x) => (typeof x === 'number' ? x.toString() : x))
}

export interface MrkdwnableProps {
	/** @inheritDoc @slack/types#MrkdwnElement.verbatim */
	verbatim?: boolean

	/**
	 * When set to `true`, the text will not be treated as `mrkdwn` (the default) and will be rendered
	 * as plain text. Any formatting will result in an error.
	 */
	plain?: boolean

	/** @inheritDoc @slack/types#PlainTextElement.emoji */
	emoji?: boolean
}

export function makeComponent<Props extends object = {}>(
	fn: (props: Props & { children: any[] }) => any,
): (props: Props & { children?: any }) => any {
	return (props) => fn({ ...props, children: ensureChildren(props.children) })
}

export function toTextObject(things: any[]): MrkdwnObject | undefined
export function toTextObject(
	things: any[],
	props: MrkdwnableProps & { plain: true },
): PlainTextObject | undefined
export function toTextObject(
	things: any[],
	props: MrkdwnableProps & { plain: false },
): MrkdwnObject | undefined
export function toTextObject(
	things: any[],
	props: MrkdwnableProps,
): PlainTextObject | MrkdwnObject | undefined
export function toTextObject(things: any[], props: MrkdwnableProps = {}) {
	if (props.plain) {
		const text = toPlain(things)
		return text
			? ({ type: 'plain_text', text, emoji: props.emoji } satisfies PlainTextObject)
			: undefined
	}
	const text = toMrkdwn(things)
	return text
		? ({ type: 'mrkdwn', text, verbatim: props.verbatim } satisfies MrkdwnObject)
		: undefined
}

export function toPlain(things: any[]): string {
	let result = ''

	for (const thing of things) {
		if (typeof thing === 'string') {
			result += thing
		} else if (thing === undefined || thing === null) {
		} else if (typeof thing === 'object' && thing !== null) {
			throw new JSXError(`Unsupported object with type "${thing.type}" in text`)
		} else {
			throw new JSXError(`Unsupported ${typeof thing} in text`)
		}
	}

	return result
}

export function toMrkdwn(things: any[]): string {
	let result = ''

	for (const thing of things) {
		if (typeof thing === 'string') {
			result += thing
		} else if (thing === undefined || thing === null) {
		} else if (typeof thing === 'object' && thing !== null && '$inline' in thing) {
			const tag = thing.$inline as keyof JSX.IntrinsicElements
			switch (tag) {
				case 'b':
				case 'strong':
					result += `*${toMrkdwn(thing.children)}*`
					break
				case 'i':
				case 'em':
					result += `_${toMrkdwn(thing.children)}_`
					break
				case 's':
				case 'del':
					result += `~${toMrkdwn(thing.children)}~`
					break
				case 'u':
					throw new JSXError('<u> not supported by Slack mrkdwn')
				case 'code':
					result += `\`${toMrkdwn(thing.children)}\``
					break
				case 'a':
					// TODO: escape links properly
					result += `<${thing.props.href.replace(/\|/g, '%7C').replace(/>/g, '%3E')}|${toMrkdwn(thing.children)}>`
					break
				default:
					tag satisfies never
			}
		} else if (typeof thing === 'object' && thing !== null) {
			throw new JSXError(`Unsupported object with type "${thing.type}" in text`)
		} else {
			throw new JSXError(`Unsupported ${typeof thing} in text`)
		}
	}

	return result
}

export function toConfirm(thing: any): ConfirmationDialogObject | undefined {
	if (thing === undefined) {
		return
	}
	if (typeof thing === 'string') {
		return { text: { type: 'plain_text', text: thing } } satisfies ConfirmationDialogObject
	}
	if (
		typeof thing === 'object' &&
		thing !== null &&
		isTextObject(thing.text) &&
		thing.text.type === 'plain_text'
	) {
		return thing
	}
	throw new JSXError('confirm must be a string or <Confirm>')
}

export const BLOCK_TYPES = new Set(
	Object.keys({
		image: true,
		call: true,
		callout: true,
		canvas_table: true,
		channel_section: true,
		channel_set: true,
		condition: true,
		contact_card: true,
		data_visualization: true,
		event: true,
		loading: true,
		message_embed: true,
		share_prompt: true,
		share_shortcut: true,
		timeline: true,
		actions: true,
		alert: true,
		card: true,
		carousel: true,
		container: true,
		context_actions: true,
		context: true,
		data_table: true,
		divider: true,
		file: true,
		header: true,
		input: true,
		markdown: true,
		plan: true,
		rich_text: true,
		section: true,
		table: true,
		task_card: true,
		video: true,
	} satisfies Record<KnownBlock['type'], true>),
)

export const ELEMENT_TYPES = new Set(
	Object.keys({
		image: true,
		button: true,
		channels_select: true,
		checkboxes: true,
		conversations_select: true,
		datepicker: true,
		datetimepicker: true,
		email_text_input: true,
		external_select: true,
		feedback_buttons: true,
		file_input: true,
		icon_button: true,
		multi_channels_select: true,
		multi_conversations_select: true,
		multi_external_select: true,
		multi_static_select: true,
		multi_users_select: true,
		number_input: true,
		overflow: true,
		plain_text_input: true,
		radio_buttons: true,
		rich_text_input: true,
		static_select: true,
		timepicker: true,
		url_text_input: true,
		users_select: true,
		workflow_button: true,
	} satisfies Record<KnownElement['type'], true>),
)

export function isBlock(thing: any): thing is KnownBlock {
	return (
		typeof thing === 'object' && thing !== null && 'type' in thing && BLOCK_TYPES.has(thing.type)
	)
}

export function isElement(thing: any): thing is KnownElement
export function isElement<T extends string>(
	thing: any,
	types: Set<T>,
): thing is Extract<KnownElement, { type: T }>
export function isElement(thing: any, types: Set<string> = ELEMENT_TYPES): thing is KnownElement {
	return (
		typeof thing === 'object' &&
		thing !== null &&
		'type' in thing &&
		types.has(thing.type) &&
		(thing.type !== 'image' || isImageElement(thing))
	)
}

export function isTextObject(thing: any): thing is MrkdwnObject | PlainTextObject {
	return (
		typeof thing === 'object' &&
		thing !== null &&
		'type' in thing &&
		(thing.type === 'plain_text' || thing.type === 'mrkdwn')
	)
}

export function isImageElement(thing: any): thing is ImageElement {
	return (
		typeof thing === 'object' &&
		thing !== null &&
		'type' in thing &&
		thing.type === 'image' &&
		thing.title === undefined &&
		thing.block_id === undefined
	)
}

export class JSXError extends Error {}

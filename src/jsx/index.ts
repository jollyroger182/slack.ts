import type { JSX } from '../jsx-runtime'
import type {
	ActionsBlock,
	ActionsBlockElement,
	AlertBlock,
	ButtonElement,
	ButtonStyle,
	CardBlock,
	CardBlockAction,
	ConfirmationDialogObject,
	ImageBlock,
	ImageElement,
	KnownBlock,
	KnownElement,
	MrkdwnObject,
	PlainTextObject,
	SectionBlock,
	SectionBlockAccessory,
} from '../types'
import { ensureChildren } from '../utils/jsx'

interface MrkdwnableProps {
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

function makeComponent<Props extends object = {}>(
	fn: (props: Props & { children: any[] }) => any,
): (props: Props & { children?: any }) => any {
	return (props) => fn({ ...props, children: ensureChildren(props.children) })
}

function toTextObject(things: any[]): MrkdwnObject | undefined
function toTextObject(
	things: any[],
	props: MrkdwnableProps & { plain: true },
): PlainTextObject | undefined
function toTextObject(
	things: any[],
	props: MrkdwnableProps & { plain: false },
): MrkdwnObject | undefined
function toTextObject(
	things: any[],
	props: MrkdwnableProps,
): PlainTextObject | MrkdwnObject | undefined
function toTextObject(things: any[], props: MrkdwnableProps = {}) {
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

function toPlain(things: any[]): string {
	let result = ''

	for (const thing of things) {
		if (typeof thing === 'string') {
			result += thing
		} else if (thing === undefined || thing === null) {
		} else if (typeof thing === 'object') {
			throw new JSXError(`Unsupported object with type "${thing.type}" in text`)
		} else {
			throw new JSXError(`Unsupported ${typeof thing} in text`)
		}
	}

	return result
}

function toMrkdwn(things: any[]): string {
	let result = ''

	for (const thing of things) {
		if (typeof thing === 'string') {
			result += thing
		} else if (thing === undefined || thing === null) {
		} else if (typeof thing === 'object' && '$inline' in thing) {
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
		} else if (typeof thing === 'object') {
			throw new JSXError(`Unsupported object with type "${thing.type}" in text`)
		} else {
			throw new JSXError(`Unsupported ${typeof thing} in text`)
		}
	}

	return result
}

function toConfirm(thing: any) {
	if (thing === undefined) {
		return
	}
	if (typeof thing === 'string') {
		return { text: { type: 'plain_text', text: thing } } satisfies ConfirmationDialogObject
	}
	if (typeof thing === 'object' && isTextObject(thing.text) && thing.text.type === 'plain_text') {
		return thing
	}
	throw new JSXError('confirm must be a string or <Confirm>')
}

const BLOCK_TYPES = new Set(
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

const ELEMENT_TYPES = new Set(
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

function isBlock(thing: any): thing is KnownBlock {
	return typeof thing === 'object' && 'type' in thing && BLOCK_TYPES.has(thing.type)
}

function isElement(thing: any): thing is KnownElement
function isElement<T extends string>(
	thing: any,
	types: Set<T>,
): thing is Extract<KnownElement, { type: T }>
function isElement(thing: any, types: Set<string> = ELEMENT_TYPES): thing is KnownElement {
	return (
		typeof thing === 'object' &&
		'type' in thing &&
		types.has(thing.type) &&
		(thing.type !== 'image' || isImageElement(thing))
	)
}

function isTextObject(thing: any): thing is MrkdwnObject | PlainTextObject {
	return (
		typeof thing === 'object' &&
		'type' in thing &&
		(thing.type === 'plain_text' || thing.type === 'mrkdwn')
	)
}

function isImageElement(thing: any): thing is ImageElement {
	return (
		typeof thing === 'object' &&
		'type' in thing &&
		thing.type === 'image' &&
		thing.title === undefined &&
		thing.block_id === undefined
	)
}

// blocks

const ACTIONS_ELEMENT = new Set(
	Object.keys({
		button: true,
		channels_select: true,
		conversations_select: true,
		datepicker: true,
		external_select: true,
		multi_channels_select: true,
		multi_conversations_select: true,
		multi_static_select: true,
		multi_users_select: true,
		overflow: true,
		static_select: true,
		timepicker: true,
		users_select: true,
		checkboxes: true,
		multi_external_select: true,
		radio_buttons: true,
		workflow_button: true,
		datetimepicker: true,
		rich_text_input: true,
	} satisfies Record<ActionsBlockElement['type'], true>) as ActionsBlockElement['type'][],
)

export const Actions = makeComponent<{ id?: string }>(({ id, children }) => {
	for (const child of children) {
		if (!isElement(child, ACTIONS_ELEMENT)) {
			throw new JSXError(`Actions must have valid elements`)
		}
	}

	const elements = children as ActionsBlockElement[]
	if (!elements.length) {
		throw new JSXError('Actions must have at least 1 element')
	}

	return { type: 'actions', block_id: id, elements } satisfies ActionsBlock
})

export const Alert = makeComponent<MrkdwnableProps & { id?: string; level?: AlertBlock['level'] }>(
	({ children, id, level, plain, verbatim, emoji }) => {
		const text = toTextObject(children, { plain, verbatim, emoji })
		if (!text) {
			throw new JSXError('Alert must have text')
		}

		return { type: 'alert', block_id: id, level, text } satisfies AlertBlock
	},
)

const CARD_ACTION = new Set(
	Object.keys({ button: true } satisfies Record<
		CardBlockAction['type'],
		true
	>) as CardBlockAction['type'][],
)

export const Card = makeComponent<{
	id?: string
	title?: any
	subtitle?: any
	icon?: any
	heroImage?: any
}>(({ id, title, subtitle, icon, heroImage, children }) => {
	if (icon && !isImageElement(icon)) {
		throw new JSXError('Card icon must be an image element')
	}
	if (heroImage && !isImageElement(heroImage)) {
		throw new JSXError('Card hero image must be an image element')
	}

	const textBits = []
	const actions: ButtonElement[] = []
	for (const child of children) {
		if (isElement(child, CARD_ACTION)) {
			actions.push(child)
		} else {
			textBits.push(child)
		}
	}

	return {
		type: 'card',
		block_id: id,
		hero_image: heroImage,
		icon,
		title: toTextObject(ensureChildren(title)),
		subtitle: toTextObject(ensureChildren(subtitle)),
		body: toTextObject(textBits),
		actions: actions.length ? actions : undefined,
	} satisfies CardBlock
})

const SECTION_ACCESSORY = new Set(
	Object.keys({
		image: true,
		button: true,
		channels_select: true,
		checkboxes: true,
		conversations_select: true,
		datepicker: true,
		external_select: true,
		multi_channels_select: true,
		multi_conversations_select: true,
		multi_external_select: true,
		multi_static_select: true,
		multi_users_select: true,
		overflow: true,
		radio_buttons: true,
		static_select: true,
		timepicker: true,
		users_select: true,
		workflow_button: true,
	} satisfies Record<SectionBlockAccessory['type'], true>) as SectionBlockAccessory['type'][],
)

export const Section = Object.assign(
	makeComponent<{ id?: string; accessory?: any } & MrkdwnableProps>(
		({ id, accessory, children, verbatim, plain, emoji }) => {
			if (accessory && !isElement(accessory, SECTION_ACCESSORY)) {
				throw new JSXError('Section accessory must be a valid element')
			}

			const textBits = []
			const fields: (PlainTextObject | MrkdwnObject)[] = []
			for (const child of children) {
				if (isTextObject(child)) {
					fields.push(child)
				} else {
					textBits.push(child)
				}
			}

			const text = toTextObject(textBits, { verbatim, plain, emoji })

			if (!text && !fields.length) {
				throw new JSXError('Section has no text or fields')
			}

			return {
				block_id: id,
				type: 'section',
				text,
				fields: fields.length ? fields : undefined,
				accessory,
			} satisfies SectionBlock
		},
	),
	{
		Field: makeComponent<MrkdwnableProps>(({ children, verbatim, plain, emoji }) => {
			return toTextObject(children, { verbatim, plain, emoji })
		}),
	},
)

// elements

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

// other stuff

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

export class JSXError extends Error {}

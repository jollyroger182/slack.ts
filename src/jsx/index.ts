import type { JSX } from '../jsx-runtime'
import type {
	KnownBlock,
	KnownElement,
	MrkdwnObject,
	PlainTextObject,
	SectionBlock,
	SectionBlockAccessory,
} from '../types'
import { ensureChildren } from '../utils/jsx'

type MrkdwnableProps = {
	verbatim?: boolean
	plain?: boolean
	emoji?: boolean
}

function makeComponent<Props extends Record<string, unknown> = {}>(
	fn: (props: Props & { children: any[] }) => any,
): (props: Props & { children?: any }) => any {
	return (props) => fn({ ...props, children: ensureChildren(props.children) })
}

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
	return typeof thing === 'object' && 'type' in thing && types.has(thing.type)
}

function isTextObject(thing: any): thing is MrkdwnObject | PlainTextObject {
	return (
		typeof thing === 'object' &&
		'type' in thing &&
		(thing.type === 'plain_text' || thing.type === 'mrkdwn')
	)
}

// blocks

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
				throw new JSXError('Section accessory must be an element')
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

export class JSXError extends Error {}

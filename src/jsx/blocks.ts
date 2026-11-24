import type {
	ActionsBlock,
	ActionsBlockElement,
	AlertBlock,
	ButtonElement,
	CardBlock,
	CardBlockAction,
	MrkdwnObject,
	PlainTextObject,
	SectionBlock,
	SectionBlockAccessory,
} from '../types'
import {
	ensureChildren,
	isElement,
	isImageElement,
	isTextObject,
	JSXError,
	makeComponent,
	type MrkdwnableProps,
	toTextObject,
} from '../utils/jsx'

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

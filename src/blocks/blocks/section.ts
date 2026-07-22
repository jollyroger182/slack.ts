import type {
	MrkdwnElement,
	PlainTextElement,
	SectionBlock,
	SectionBlockAccessory,
	TextObject,
} from '@slack/types'
import { textOrMrkdwn } from '../objects'
import type { ForceArray, Replace } from '$/utils/types'

// @ts-expect-error
export interface SectionBlockBuilder<T extends SectionBlock> extends T {}

export class SectionBlockBuilder<T extends SectionBlock> {
	// #data?: T
	block_id?: string
	text?: MrkdwnElement | PlainTextElement

	constructor(data: T) {
		Object.assign(this, data)
	}

	setId<ID extends string>(newId: ID) {
		return new SectionBlockBuilder({ ...this, block_id: newId } as unknown as Replace<
			T,
			{ block_id: ID }
		>)
	}

	setText(newText: MrkdwnElement | string): SectionBlockBuilder<Replace<T, { text: MrkdwnElement }>>
	setText(newText: PlainTextElement): SectionBlockBuilder<Replace<T, { text: PlainTextElement }>>
	setText(newText: string | TextObject) {
		const text = typeof newText === 'string' ? { type: 'mrkdwn', text: newText } : newText
		return new SectionBlockBuilder({ ...this, text } as any)
	}

	addFields<Fields extends (string | TextObject)[]>(...newFields: Fields) {
		const fields = (this.fields || []).concat(
			newFields.map((f) => (typeof f === 'string' ? { type: 'mrkdwn', text: f } : f)),
		)
		return new SectionBlockBuilder({ ...this, fields } as unknown as Replace<
			T,
			{
				fields: [
					...ForceArray<T['fields']>,
					...{ [K in keyof Fields]: Fields[K] extends TextObject ? Fields[K] : MrkdwnElement },
				]
			}
		>)
	}

	setAccessory<Accessory extends SectionBlockAccessory>(accessory: Accessory) {
		return new SectionBlockBuilder({ ...this, accessory } as unknown as Replace<
			T,
			{ accessory: Accessory }
		>)
	}

	removeAccessory() {
		const obj = { ...this }
		delete obj.accessory
		return new SectionBlockBuilder(obj as unknown as Replace<T, { accessory?: never }>)
	}

	setExpand(expand: boolean = true) {
		return new SectionBlockBuilder({ ...this, expand } as unknown as Replace<
			T,
			{ expand: boolean }
		>)
	}
}

export function section(): SectionBlockBuilder<{ type: 'section' }>
export function section(
	text: string | MrkdwnElement,
): SectionBlockBuilder<{ type: 'section'; text: MrkdwnElement }>
export function section(
	text: PlainTextElement,
): SectionBlockBuilder<{ type: 'section'; text: PlainTextElement }>
export function section(text?: string | TextObject) {
	const textObject: MrkdwnElement | PlainTextElement | undefined = text
		? textOrMrkdwn(text)
		: undefined
	return new SectionBlockBuilder({ type: 'section', text: textObject })
}

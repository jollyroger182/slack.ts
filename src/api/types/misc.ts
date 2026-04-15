import type { PlainTextElement, PlainTextOption } from '@slack/types'

export interface PlainTextOptionGroup {
	label: PlainTextElement
	options: PlainTextOption[]
}

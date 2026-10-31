import type {
	ConfirmationDialog,
	MrkdwnElement,
	MrkdwnOption,
	PlainTextElement,
	PlainTextOption,
} from '@slack/types'

/** {@inheritDoc @slack/types#MrkdwnElement} */
export interface MrkdwnObject extends MrkdwnElement {}

/** {@inheritDoc @slack/types#PlainTextElement} */
export interface PlainTextObject extends PlainTextElement {}

/** An option in checkboxes or radio buttons. Its `text` and `description` can also be `mrkdwn`. */
export interface CheckboxOptionObject extends Omit<
	PlainTextOptionObject,
	'text' | 'description' | 'url'
> {
	text: PlainTextObject | MrkdwnObject
	description?: PlainTextObject | MrkdwnObject
}

/** {@inheritDoc @slack/types#MrkdwnOption} */
export interface MrkdwnOptionObject extends MrkdwnOption {}

/** {@inheritDoc @slack/types#PlainTextOption} */
export interface PlainTextOptionObject extends PlainTextOption {}

/** {@inheritDoc @slack/types#ConfirmationDialog} */
export interface ConfirmationDialogObject extends ConfirmationDialog {}

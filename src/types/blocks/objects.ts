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

/** {@inheritDoc @slack/types#MrkdwnOption} */
export interface MrkdwnOptionObject extends MrkdwnOption {}

/** {@inheritDoc @slack/types#PlainTextOption} */
export interface PlainTextOptionObject extends PlainTextOption {}

/** {@inheritDoc @slack/types#ConfirmationDialog} */
export interface ConfirmationDialogObject extends ConfirmationDialog {}

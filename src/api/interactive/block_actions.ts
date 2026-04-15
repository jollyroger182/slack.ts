import type { ConfirmationDialog, PlainTextElement, PlainTextOption } from '@slack/types'
import type { AnyMessage } from '../types/message'
import type { InteractionCommon } from './common'
import type { StateValue } from '../types/value'
import type { IconButtonIcon } from '../../blocks/elements/icon_button'

export interface BlockActions extends InteractionCommon {
	type: 'block_actions'
	container: BlockActionContainer
	channel?: { id: string; name: string }
	message?: AnyMessage
	state?: { values: Record<string, Record<string, StateValue>> } // TODO type
	response_url?: string
	actions: BlockAction[]
}

interface MessageAttachmentContainer {
	type: 'message_attachment'
	message_ts: string
	attachment_id: number
	channel_id: string
	is_ephemeral: boolean
	is_app_unfurl: boolean
}

interface ViewContainer {
	type: 'view'
	view_id: string
}

interface MessageContainer {
	type: 'message'
	message_ts: string
	channel_id: string
	is_ephemeral: boolean
}

type BlockActionContainer = MessageAttachmentContainer | ViewContainer | MessageContainer

interface ActionCommon {
	block_id: string
	action_id: string
	action_ts: string
}

export interface ButtonAction extends ActionCommon {
	type: 'button'
	text: PlainTextElement
	value?: string
	style?: 'primary' | 'danger'
}

export interface CheckboxesAction extends ActionCommon {
	type: 'checkboxes'
	selected_options: PlainTextOption[]
}

export interface DatePickerAction extends ActionCommon {
	type: 'date_picker'
	initial_date?: string
	selected_date: string
}

export interface DatetimePickerAction extends ActionCommon {
	type: 'datetimepicker'
	initial_date_time?: number
	selected_date_time: number
}

export interface EmailInputAction extends ActionCommon {
	type: 'email_text_input'
	value: string
}

export interface FeedbackButtonsAction extends ActionCommon {
	type: 'feedback_buttons'
	text: PlainTextElement
	value: string
}

export interface IconButtonAction extends ActionCommon {
	type: 'icon_button'
	icon: IconButtonIcon
	text: PlainTextElement
}

export interface MultiStaticSelectAction extends ActionCommon {
	type: 'multi_static_select'
	selected_options: PlainTextOption[]
}

export interface PlainTextInputAction extends ActionCommon {
	type: 'plain_text_input'
	value: string | null
}

export interface OverflowAction extends ActionCommon {
	type: 'overflow'
	confirm?: ConfirmationDialog
	selected_option: PlainTextOption
}

export interface StaticSelectAction extends ActionCommon {
	type: 'static_select'
	selected_option: PlainTextOption
}

export type BlockAction =
	| ButtonAction
	| CheckboxesAction
	| FeedbackButtonsAction
	| IconButtonAction
	| MultiStaticSelectAction
	| PlainTextInputAction
	| OverflowAction
	| StaticSelectAction

export type BlockActionTypes = BlockAction['type']

export type BlockActionMap = {
	[K in BlockActionTypes]: Extract<BlockAction, { type: K }>
}

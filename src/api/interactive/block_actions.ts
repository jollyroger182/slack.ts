import type { ConfirmationDialog, PlainTextElement, PlainTextOption } from '@slack/types'
import type { IconButtonIcon } from '../../blocks/elements/icon_button'
import type { AnyMessage } from '../types/message'
import type { StateValue } from '../types/value'
import type { AnyView } from '../types/view'
import type { InteractionCommon } from './common'

export interface BlockActions extends InteractionCommon {
	type: 'block_actions'
	container: BlockActionContainer
	channel?: { id: string; name: string }
	message?: AnyMessage
	view?: AnyView
	state?: { values: Record<string, Record<string, StateValue>> }
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

export type BlockActionContainer = MessageAttachmentContainer | ViewContainer | MessageContainer

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

export interface ChannelsSelectAction extends ActionCommon {
	type: 'channels_select'
	initial_channel?: string
	selected_channel: string
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export interface CheckboxesAction extends ActionCommon {
	type: 'checkboxes'
	selected_options: PlainTextOption[]
}

export interface ConversationsSelectAction extends ActionCommon {
	type: 'conversations_select'
	initial_conversation?: string
	selected_conversation: string
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
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

export interface MultiChannelsSelectAction extends ActionCommon {
	type: 'multi_channels_select'
	initial_channels?: string[]
	selected_channels: string[]
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export interface MultiConversationsSelectAction extends ActionCommon {
	type: 'multi_conversations_select'
	initial_conversations?: string[]
	selected_conversations: string[]
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export interface MultiUsersSelectAction extends ActionCommon {
	type: 'multi_users_select'
	initial_users?: string[]
	selected_users: string[]
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export interface MultiStaticSelectAction extends ActionCommon {
	type: 'multi_static_select'
	initial_options?: PlainTextOption[]
	selected_options: PlainTextOption[]
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
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
	initial_option?: PlainTextOption
	selected_option: PlainTextOption
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export interface UsersSelectAction extends ActionCommon {
	type: 'users_select'
	initial_user?: string
	selected_user: string
	placeholder?: PlainTextElement
	confirm?: ConfirmationDialog
}

export type BlockAction =
	| ButtonAction
	| ChannelsSelectAction
	| CheckboxesAction
	| ConversationsSelectAction
	| FeedbackButtonsAction
	| IconButtonAction
	| MultiChannelsSelectAction
	| MultiConversationsSelectAction
	| MultiUsersSelectAction
	| MultiStaticSelectAction
	| PlainTextInputAction
	| OverflowAction
	| StaticSelectAction

export type BlockActionTypes = BlockAction['type']

export type BlockActionMap = {
	[K in BlockActionTypes]: Extract<BlockAction, { type: K }>
}

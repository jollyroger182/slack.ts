import type { ConfirmationDialog, PlainTextElement, PlainTextOption } from '@slack/types'
import type { AnyMessage } from '../types/message'
import type { InteractionCommon } from './common'
import type { StateValue } from '../types/value'

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

export interface PlainTextInputAction extends ActionCommon {
	type: 'plain_text_input'
	value: string | null
}

export interface OverflowAction extends ActionCommon {
	type: 'overflow'
	confirm?: ConfirmationDialog
	selected_option: PlainTextOption
}

export type BlockAction = ButtonAction | PlainTextInputAction | OverflowAction

export type BlockActionTypes = BlockAction['type']

export type BlockActionMap = {
	[K in BlockActionTypes]: Extract<BlockAction, { type: K }>
}

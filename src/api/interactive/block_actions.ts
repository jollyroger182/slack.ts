import type { PlainTextElement } from '@slack/types'
import type { AnyMessage } from '../types/message'

export interface BlockActions {
	type: 'block_actions'
	user: { id: string; username: string; name: string; team_id: string }
	api_app_id: string
	token: string
	container: BlockActionContainer
	trigger_id: string
	team: { id: string; domain: string; enterprise_id?: string; enterprise_name?: string }
	enterprise?: { id: string; name: string }
	is_enterprise_install?: boolean
	channel?: { id: string; name: string }
	message?: AnyMessage
	state?: { values: Record<string, Record<string, unknown>> } // TODO type
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

export type BlockAction = ButtonAction | PlainTextInputAction

export type BlockActionTypes = BlockAction['type']

export type BlockActionMap = {
	[K in BlockActionTypes]: BlockAction & { type: K }
}

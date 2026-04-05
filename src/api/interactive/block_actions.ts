import type { PlainTextElement } from '@slack/types'
import type { AnyMessage } from '../types/message'

export interface BlockActions {
	type: 'block_actions'
	user: { id: string; username: string; name: string; team_id: string }
	api_app_id: string
	token: string
	container: unknown // TODO type
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

interface ActionCommon {
	block_id: string
	action_id: string
	action_ts: string
}

export interface ButtonAction extends ActionCommon {
	type: 'button'
	text: PlainTextElement
	value?: string
}

export type BlockAction = ButtonAction

export type BlockActionTypes = BlockAction['type']

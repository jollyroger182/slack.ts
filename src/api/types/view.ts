import type { KnownBlock, PlainTextElement } from '@slack/types'
import type { StateValue } from './value'

export interface ModalView {
	type: 'modal'
	id: string
	team_id: string
	title: PlainTextElement
	blocks: KnownBlock[]
	close: PlainTextElement | null
	submit: PlainTextElement | null
	private_metadata: string
	callback_id: string
	state: { values: Record<string, Record<string, StateValue>> } // TODO type
	hash: string
	clear_on_close: boolean
	notify_on_close: boolean
	external_id: string
	previous_view_id: string | null
	root_view_id: string | null
	app_id: string
	app_installed_team_id: string
	bot_id: string
}

import type { KnownBlock, PlainTextElement } from '@slack/types'
import type { ExtractValues } from '../../blocks/utils/extract'

export interface ModalView<Blocks extends KnownBlock[] = KnownBlock[]> {
	type: 'modal'
	id: string
	team_id: string
	title: PlainTextElement
	blocks: Blocks
	close: PlainTextElement | null
	submit: PlainTextElement | null
	private_metadata: string
	callback_id: string
	state: { values: ExtractValues<Blocks> }
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

export type AnyView<Blocks extends KnownBlock[] = KnownBlock[]> = ModalView<Blocks>

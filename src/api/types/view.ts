import type { KnownBlock, PlainTextElement } from '@slack/types'
import type { ExtractValues } from '../../blocks/utils/extract'

// so. slack actually has all of these fields for both home and modal views...
// ...
// i don't know what to think about this.

export interface BaseView<Blocks extends KnownBlock[] = KnownBlock[]> {
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

export interface ModalView<Blocks extends KnownBlock[] = KnownBlock[]> extends BaseView<Blocks> {
	type: 'modal'
}

export interface HomeView<Blocks extends KnownBlock[] = KnownBlock[]> extends BaseView<Blocks> {
	type: 'home'
}

export type AnyView<Blocks extends KnownBlock[] = KnownBlock[]> =
	| ModalView<Blocks>
	| HomeView<Blocks>

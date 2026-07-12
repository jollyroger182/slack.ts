import type { AnyBlock, PlainTextElement } from '@slack/types'
import type { ExtractValues } from '../../blocks/utils/extract'

// so. slack actually has all of these fields for both home and modal views...
// ...
// i don't know what to think about this.

export interface BaseViewData<Blocks extends AnyBlock[] = AnyBlock[]> {
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

export interface ModalViewData<
	Blocks extends AnyBlock[] = AnyBlock[],
> extends BaseViewData<Blocks> {
	type: 'modal'
}

export interface HomeViewData<Blocks extends AnyBlock[] = AnyBlock[]> extends BaseViewData<Blocks> {
	type: 'home'
}

export type AnyViewData<Blocks extends AnyBlock[] = AnyBlock[]> =
	| ModalViewData<Blocks>
	| HomeViewData<Blocks>

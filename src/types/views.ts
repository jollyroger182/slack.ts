import type { HomeView as SlackHomeView, ModalView as SlackModalView } from '@slack/types'

import type { Action, KnownValue, Value } from './blocks/elements'

export type ViewStateValue<A extends Action = Action> = [
	Extract<KnownValue, { type: A['type'] }>,
] extends [never]
	? Value<A['type']>
	: Extract<KnownValue, { type: A['type'] }>

export interface ModalView extends SlackModalView {}

export interface HomeView extends SlackHomeView {}

export type View = ModalView | HomeView

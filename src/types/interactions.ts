import type { KnownKeys } from '../utils/types'
import type { Action, Element, KnownAction, ValueOf } from './blocks/elements'
import type { View } from './views'

/**
 * Augment this interface to define your interactive elements. Each entry is a mapping from an
 * `action_id` to an element type.
 *
 * @example
 * 	import type { ButtonElement } from 'slack.ts'
 * 	declare module 'slack.ts' {
 * 		interface ElementMap {
 * 			confirm: ButtonElement
 * 		}
 * 	}
 */
export interface ElementMap extends Record<string, Element> {}

type ExtractAction<M extends Record<string, Element>, ID extends KnownKeys<M>> = Extract<
	KnownAction,
	{ type: M[ID]['type'] }
> & { action_id: ID }

export type ActionMap<M extends Record<string, Element> = ElementMap> = {
	[ID in KnownKeys<M>]: [ExtractAction<M, ID>] extends [never]
		? Action<M[ID]['type']>
		: ExtractAction<M, ID>
}

/**
 * The default type used in `BlockActions` and other places that expect an action. If anything is
 * registered in `ElementMap`, use the defined values; otherwise, allow any action.
 *
 * @typeParam M - Optionally override the `ElementMap` used, primarily for testing.
 */
export type DefaultAction<M extends Record<string, Element> = ElementMap> = [KnownKeys<M>] extends [
	never,
]
	? Action
	: ActionMap<M>[KnownKeys<M>]

// adapted from https://github.com/slackapi/bolt-js/blob/3f8823c/src/types/actions/block-action.ts#L249
export type BlockActions<A extends Action = DefaultAction> = {
	type: 'block_actions'
	actions: A[]
	team: {
		id: string
		domain: string
		enterprise_id?: string
		enterprise_name?: string
	} | null
	user: {
		id: string
		/** Name will be present if the block_action originates from the Home tab */
		name?: string
		username: string
		team_id?: string
	}
	channel?: {
		id: string
		name: string
	}
	// TODO: this should not be optional, but should be conditionally tacked on based on the specific block_action subtype
	message?: {
		type: 'message'
		user?: string // undocumented that this is optional, it won't be there for bot messages
		ts: string
		text?: string // undocumented that this is optional, but how could it exist on block kit based messages?
		// biome-ignore lint/suspicious/noExplicitAny: TODO: poorly typed message here
		[key: string]: any
	}
	view?: View
	state?: {
		values: {
			[blockId: string]: {
				[ID in A['action_id']]?: ValueOf<Extract<A, { action_id: ID }>>
			}
		}
	}
	token: string
	response_url: string
	trigger_id: string
	api_app_id: string

	container: unknown

	app_unfurl?: unknown

	// exists for enterprise installs
	is_enterprise_install?: boolean
	enterprise?: {
		id: string
		name: string
	}
}

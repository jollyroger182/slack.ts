import type { BlockAction, BlockActions } from '../api/interactive/block_actions'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class Action<Type extends BlockAction = BlockAction> {
	#data: Type
	#event: BlockActions

	constructor(
		protected client: App,
		action: Type,
		event: BlockActions,
	) {
		this.#data = action
		this.#event = event
		return makeProxy(this, () => this.#data)
	}

	get event() {
		return this.#event
	}

	get raw() {
		return this.#data
	}

	get respond(): Responder<true> {
		return new Responder(this.client, this.#event.response_url, this.#event.trigger_id)
	}
}

export type ActionInstance<Type extends BlockAction = BlockAction> = Action<Type> & Type

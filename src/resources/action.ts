import type { BlockAction, BlockActions } from '../api/interactive/block_actions'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class ActionImpl<Type extends BlockAction = BlockAction> {
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

	static create<Type extends BlockAction = BlockAction>(
		client: App,
		action: Type,
		event: BlockActions,
	) {
		return new ActionImpl(client, action, event) as Action<Type>
	}

	get event() {
		return this.#event
	}

	get raw() {
		return this.#data
	}

	get respond(): Responder<true> {
		return new Responder(
			this.client,
			this.#event.response_url,
			this.#event.trigger_id,
			this.#event.message?.thread_ts,
		)
	}
}

export type Action<Type extends BlockAction = BlockAction> = ActionImpl<Type> & Type

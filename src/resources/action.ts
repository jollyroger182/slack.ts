import type { ActionData, BlockActionsData } from '../api/interactive/block_actions'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class ActionImpl<Type extends ActionData = ActionData> {
	#data: Type
	#event: BlockActionsData

	constructor(
		protected client: App,
		action: Type,
		event: BlockActionsData,
	) {
		this.#data = action
		this.#event = event
		return makeProxy(this, () => this.#data)
	}

	static create<Type extends ActionData = ActionData>(
		client: App,
		action: Type,
		event: BlockActionsData,
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

export type Action<Type extends ActionData = ActionData> = ActionImpl<Type> & Type

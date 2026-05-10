import type { BlockSuggestionData } from '../api/interactive/block_suggestion'
import { OptionObjectBuilder } from '../blocks/objects/option'
import type { OptionGroupBuilder } from '../blocks/objects/option_group'
import type { App } from '../client'
import type { BlockSuggestionResponder } from '../receivers/base'
import { makeProxy } from '../utils'

export class AutocompleteImpl {
	#data: BlockSuggestionData

	constructor(
		protected client: App,
		event: BlockSuggestionData,
		private responder: BlockSuggestionResponder,
	) {
		this.#data = event
		return makeProxy(this, () => this.#data)
	}

	static create(client: App, event: BlockSuggestionData, responder: BlockSuggestionResponder) {
		return new AutocompleteImpl(client, event, responder) as Autocomplete
	}

	get raw() {
		return this.#data
	}

	async respond(...options: OptionObjectBuilder[]): Promise<void>
	async respond(...optionGroups: OptionGroupBuilder<OptionObjectBuilder[]>[]): Promise<void>
	async respond(...items: OptionObjectBuilder[] | OptionGroupBuilder<OptionObjectBuilder[]>[]) {
		if (!items.length) {
			await this.responder({ options: [] })
		} else if (items[0] instanceof OptionObjectBuilder) {
			await this.responder({ options: (items as OptionObjectBuilder[]).map((o) => o.build()) })
		} else {
			await this.responder({
				option_groups: (items as OptionGroupBuilder<OptionObjectBuilder[]>[]).map((g) => g.build()),
			})
		}
	}
}

export type Autocomplete = AutocompleteImpl & BlockSuggestionData

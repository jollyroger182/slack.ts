import type { PlainTextOption } from '@slack/types'
import type { BlockSuggestion } from '../api/interactive/block_suggestion'
import type { App } from '../client'
import { makeProxy } from '../utils'
import type { BlockSuggestionResponder } from '../receivers/base'
import type { PlainTextOptionGroup } from '../api/types/misc'
import { OptionObjectBuilder } from '../blocks/objects/option'
import type { OptionGroupBuilder } from '../blocks/objects/option_group'

export class Autocomplete {
	#data: BlockSuggestion

	constructor(
		protected client: App,
		event: BlockSuggestion,
		private responder: BlockSuggestionResponder,
	) {
		this.#data = event
		return makeProxy(this, () => this.#data)
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

export type AutocompleteInstance = Autocomplete & BlockSuggestion

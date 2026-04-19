import type { AnyBlock } from '@slack/types'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class Submission<Blocks extends AnyBlock[] = AnyBlock[]> {
	#data: ViewSubmission<Blocks>

	constructor(
		protected client: App,
		data: ViewSubmission<Blocks>,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	get respond(): Responder {
		return new Responder(this.client, this.#data.response_urls[0], this.#data.trigger_id)
	}

	get values() {
		return this.#data.view.state.values
	}
}

export type SubmissionInstance<Blocks extends AnyBlock[] = AnyBlock[]> = Submission<Blocks> &
	ViewSubmission<Blocks>

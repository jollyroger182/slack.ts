import type { AnyBlock } from '@slack/types'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class SubmissionImpl<Blocks extends AnyBlock[] = AnyBlock[]> {
	#data: ViewSubmission<Blocks>

	constructor(
		protected client: App,
		data: ViewSubmission<Blocks>,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	static create<Blocks extends AnyBlock[] = AnyBlock[]>(client: App, data: ViewSubmission<Blocks>) {
		return new SubmissionImpl(client, data) as Submission<Blocks>
	}

	get respond(): Responder {
		return new Responder(this.client, this.#data.response_urls[0], this.#data.trigger_id)
	}

	get values() {
		return this.#data.view.state.values
	}
}

export type Submission<Blocks extends AnyBlock[] = AnyBlock[]> = SubmissionImpl<Blocks> &
	ViewSubmission<Blocks>

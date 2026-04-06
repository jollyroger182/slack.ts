import type { ViewSubmission } from '../api/interactive/view_submission'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { ResponderImpl, type Responder } from '../utils/respond'

export class Submission {
	#data: ViewSubmission

	constructor(
		protected client: App,
		data: ViewSubmission,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	get respond(): Responder {
		return new ResponderImpl(this.client, this.#data.response_urls[0], this.#data.trigger_id)
	}
}

export type SubmissionInstance = Submission & ViewSubmission

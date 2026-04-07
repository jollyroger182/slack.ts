import type { KnownBlock } from '@slack/types'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { App } from '../client'
import { makeProxy } from '../utils'
import { Responder } from '../utils/respond'

export class Submission<Blocks extends KnownBlock[] = KnownBlock[]> {
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
}

export type SubmissionInstance<Blocks extends KnownBlock[] = KnownBlock[]> = Submission<Blocks> &
	ViewSubmission<Blocks>

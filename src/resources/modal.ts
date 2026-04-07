import type { KnownBlock } from '@slack/types'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { ModalView } from '../api/types/view'
import type { App } from '../client'
import { SlackTimeoutError } from '../error'
import { makeProxy } from '../utils'
import { Submission, type SubmissionInstance } from './submission'

export class Modal<Blocks extends KnownBlock[] = KnownBlock[]> {
	#data: ModalView<Blocks>

	constructor(
		protected client: App,
		data: ModalView<Blocks>,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	get raw() {
		return this.#data
	}

	get wait() {
		return new ModalWait(this.client, makeProxy(this, () => this.#data) as ModalInstance<Blocks>)
	}
}

export type ModalInstance<Blocks extends KnownBlock[] = KnownBlock[]> = Modal<Blocks> &
	ModalView<Blocks>

class ModalWait<Blocks extends KnownBlock[] = KnownBlock[]> {
	private _timeout: number = 60000

	constructor(
		private client: App,
		private modal: ModalInstance<Blocks>,
	) {}

	timeout(timeout: number) {
		this._timeout = timeout
		return this
	}

	async submit() {
		return new Promise<SubmissionInstance<Blocks>>((resolve, reject) => {
			const cleanup = () => {
				this.client.off(key, callback)
				if (timeout) clearTimeout(timeout)
			}

			const callback = (event: ViewSubmission) => {
				if (event.view.id === this.modal.id) {
					cleanup()
					resolve(new Submission(this.client, event) as SubmissionInstance<Blocks>)
				}
			}

			const key = `submit.${this.modal.callback_id}` as const
			this.client.on(key, callback)

			const timeout =
				this._timeout > 0
					? setTimeout(() => {
							cleanup()
							reject(new SlackTimeoutError(`Timed out waiting for action (${this._timeout} ms)`))
						}, this._timeout)
					: null
		})
	}
}

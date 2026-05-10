import type { AnyBlock } from '@slack/types'
import type { ModalViewData } from '../api/types/view'
import type { App } from '../client'
import { SlackTimeoutError } from '../error'
import { makeProxy } from '../utils'
import { type Submission } from './submission'

export class ModalImpl<Blocks extends AnyBlock[] = AnyBlock[]> {
	#data: ModalViewData<Blocks>

	constructor(
		protected client: App,
		data: ModalViewData<Blocks>,
	) {
		this.#data = data
		return makeProxy(this, () => this.#data)
	}

	static create<Blocks extends AnyBlock[] = AnyBlock[]>(client: App, data: ModalViewData<Blocks>) {
		return new ModalImpl(client, data) as Modal<Blocks>
	}

	get raw() {
		return this.#data
	}

	get wait() {
		return new ModalWait(this.client, this)
	}
}

export type Modal<Blocks extends AnyBlock[] = AnyBlock[]> = ModalImpl<Blocks> &
	ModalViewData<Blocks>

class ModalWait<Blocks extends AnyBlock[] = AnyBlock[]> {
	private _timeout: number = 60000

	constructor(
		private client: App,
		private modal: ModalImpl<Blocks>,
	) {}

	timeout(timeout: number) {
		this._timeout = timeout
		return this
	}

	async submit() {
		return new Promise<Submission<Blocks>>((resolve, reject) => {
			const cleanup = () => {
				this.client.off(key, callback)
				if (timeout) clearTimeout(timeout)
			}

			const callback = (event: Submission) => {
				if (event.view.id === this.modal.raw.id) {
					cleanup()
					resolve(event as Submission<Blocks>)
				}
			}

			const key = `submit.${this.modal.raw.callback_id}` as const
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

import type { AnyBlock } from '@slack/types'
import { SlackError } from '../error'
import type { App } from '../client'
import type { ViewsOpenParams } from '../api/web/views'
import { Modal, type ModalInstance } from '../resources/modal'
import { randomUUID } from 'crypto'

export class Responder<HasResponseURL extends boolean = true> {
	constructor(
		private client: App,
		private response_url: string | undefined,
		private trigger_id: string,
		private thread_ts?: string,
	) {}

	async message(this: Responder<true>, message: string | MessageResponseParams) {
		if (typeof message === 'string') message = { text: message }

		const payload = {
			thread_ts: this.thread_ts,
			text: message.text,
			blocks: message.blocks,
			response_type: message.ephemeral ? 'ephemeral' : 'in_channel',
			replace_original: false,
		}

		await this.#send(payload)
	}

	async edit(this: Responder<true>, message: string | MessageResponseParams) {
		if (typeof message === 'string') message = { text: message }

		const payload = {
			text: message.text,
			blocks: message.blocks,
			response_type: message.ephemeral ? 'ephemeral' : 'in_channel',
			replace_original: true,
		}

		await this.#send(payload)
	}

	async delete(this: Responder<true>) {
		await this.#send({ delete_original: true })
	}

	async modal<View extends ViewsOpenParams['view']>(view: View) {
		if (!view.callback_id) view.callback_id = randomUUID()
		const resp = await this.client.request('views.open', { view, trigger_id: this.trigger_id })
		return new Modal(this.client, resp.view) as ModalInstance<View['blocks']>
	}

	async #send(payload: any) {
		if (!this.response_url) throw new SlackError('Cannot respond to this event')

		const resp = await fetch(this.response_url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify(payload),
		})

		if (!resp.ok) {
			throw new SlackError(`Responding to response_url failed with status code ${resp.status}`)
		}
	}
}

export type MessageResponseParams = {
	ephemeral?: boolean
	text?: string
	blocks?: AnyBlock[]
} & ({ text: string } | { blocks: AnyBlock[] })

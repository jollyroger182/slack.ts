import type { KnownBlock } from '@slack/types'
import { SlackError } from '../error'
import type { App } from '../client'

export class ResponderImpl implements Responder {
	constructor(
		private client: App,
		private response_url: string | undefined,
		private trigger_id: string,
	) {}

	async message(message: string | MessageResponseParams) {
		if (!this.response_url) throw new SlackError('Cannot respond to this event with a message')

		if (typeof message === 'string') message = { text: message }

		const payload = {
			text: message.text,
			blocks: message.blocks,
			response_type: message.ephemeral ? 'ephemeral' : 'in_channel',
			replace_original: false,
		}

		const resp = await fetch(this.response_url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify(payload),
		})

		if (!resp.ok) {
			throw new SlackError(`Responding to response_url failed with status code ${resp.status}`)
		}
	}

	async edit(message: string | MessageResponseParams) {
		if (!this.response_url) throw new SlackError('Cannot respond to this event with an edit')

		if (typeof message === 'string') message = { text: message }

		const payload = {
			text: message.text,
			blocks: message.blocks,
			response_type: message.ephemeral ? 'ephemeral' : 'in_channel',
			replace_original: true,
		}

		const resp = await fetch(this.response_url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify(payload),
		})

		if (!resp.ok) {
			throw new SlackError(`Responding to response_url failed with status code ${resp.status}`)
		}
	}

	async delete() {
		if (!this.response_url) throw new SlackError('Cannot respond to this event with deletion')

		const resp = await fetch(this.response_url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({ delete_original: true }),
		})

		if (!resp.ok) {
			throw new SlackError(`Responding to response_url failed with status code ${resp.status}`)
		}
	}
}

export type Responder<HasResponseURL extends boolean = true> = {} & (HasResponseURL extends true
	? {
			message(message: string | MessageResponseParams): Promise<void>
			edit(message: string | MessageResponseParams): Promise<void>
			delete(): Promise<void>
		}
	: {})

export type MessageResponseParams = {
	ephemeral?: boolean
	text?: string
	blocks?: KnownBlock[]
} & ({ text: string } | { blocks: KnownBlock[] })

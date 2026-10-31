import { createHmac, timingSafeEqual } from 'node:crypto'

import type { Action } from '../types/blocks/elements'
import type { EventWrapper } from '../types/events'
import type { BlockActions } from '../types/interactions'

export type SlackHTTPPayload =
	| { type: 'event_callback'; payload: EventWrapper }
	| {
			type: 'url_verification'
			payload: { type: 'url_verification'; token: string; challenge: string }
	  }
	| { type: 'block_actions'; payload: BlockActions<Action> }

export function parseHTTPPayload(
	body: string,
	signingSecret: string,
	getHeader: (name: string) => string | undefined,
): SlackHTTPPayload | undefined {
	const signature = getHeader('X-Slack-Signature')
	const timestamp = Number(getHeader('X-Slack-Request-Timestamp'))
	if (!signature || !timestamp) {
		throw new RequestParsingError('Slack request missing signature and/or timestamp headers')
	}
	if (Math.abs(timestamp - Date.now() / 1000) > 60) {
		throw new RequestParsingError('Slack timestamp more than 1 minute off, possible replay attack')
	}

	const expectedSignature = calculateSignature(body, timestamp, signingSecret)

	const encodedSignature = new TextEncoder().encode(signature)
	const encodedExpectedSignature = new TextEncoder().encode(expectedSignature)

	if (encodedSignature.byteLength !== encodedExpectedSignature.byteLength) {
		throw new RequestParsingError('Slack signature length mismatch')
	}
	if (!timingSafeEqual(encodedSignature, encodedExpectedSignature)) {
		throw new RequestParsingError('Slack signature mismatch')
	}

	// parse request

	const contentType = getHeader('Content-Type')
	if (!contentType) {
		throw new RequestParsingError('No Content-Type header on Slack request')
	}

	if (contentType.includes('json')) {
		let payload
		try {
			payload = JSON.parse(body)
		} catch {
			throw new RequestParsingError('Invalid JSON data')
		}

		if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') {
			throw new RequestParsingError('Invalid Slack JSON request body')
		}

		if (!['event_callback', 'url_verification'].includes(payload.type)) return

		return { type: payload.type, payload }
	}

	if (contentType.includes('form-urlencoded')) {
		const data = new URLSearchParams(body)

		if (!data.has('payload')) {
			throw new RequestParsingError('Invalid form body')
		}

		let payload
		try {
			payload = JSON.parse(data.get('payload')!)
		} catch {
			throw new RequestParsingError('Invalid JSON data in form body')
		}

		if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') {
			throw new RequestParsingError('Invalid JSON content in form body')
		}

		if (!['block_actions'].includes(payload.type)) return

		return { type: payload.type, payload }
	}

	// TODO: other payload types
}

export function calculateSignature(body: string, timestamp: number, signingSecret: string) {
	const baseString = `v0:${timestamp}:${body}`
	const expectedSignature = `v0=${createHmac('sha256', signingSecret).update(baseString).digest('hex')}`
	return expectedSignature
}

export class RequestParsingError extends Error {}

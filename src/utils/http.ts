import { createHmac, timingSafeEqual } from 'node:crypto'

import type { EventWrapper } from '../types/events'

export type SlackHTTPPayload =
	| { type: 'event_callback'; payload: EventWrapper }
	| {
			type: 'url_verification'
			payload: { type: 'url_verification'; token: string; challenge: string }
	  }

export function parseHTTPPayload(
	body: string,
	signingSecret: string,
	getHeader: (name: string) => string | undefined,
): SlackHTTPPayload | undefined {
	const signature = getHeader('X-Slack-Signature')
	const timestamp = Number(getHeader('X-Slack-Request-Timestamp'))
	if (!signature || !timestamp) {
		throw new Error('Slack request missing signature and/or timestamp headers')
	}
	if (Math.abs(timestamp - Date.now() / 1000) > 60) {
		throw new Error('Slack timestamp more than 1 minute off, possible replay attack')
	}

	const baseString = `v0:${timestamp}:${body}`
	const expectedSignature = `v0=${createHmac('sha256', signingSecret).update(baseString).digest('hex')}`

	if (signature.length !== expectedSignature.length) {
		throw new Error('Slack signature length mismatch')
	}
	if (
		!timingSafeEqual(
			new TextEncoder().encode(signature),
			new TextEncoder().encode(expectedSignature),
		)
	) {
		throw new Error('Slack signature mismatch')
	}

	// parse request

	const contentType = getHeader('Content-Type')
	if (!contentType) {
		throw new Error('No Content-Type header on Slack request')
	}

	if (contentType.includes('json')) {
		const payload = JSON.parse(body)

		if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') {
			throw new Error('Invalid Slack JSON request body')
		}

		return { type: payload.type, payload }
	}

	// TODO: other payload types
}

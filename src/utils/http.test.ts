import { afterEach, beforeAll, beforeEach, describe, expect, it, spyOn } from 'bun:test'

import { ContentType } from '../tests/fixtures.test'
import { calculateSignature, parseHTTPPayload } from './http'

const SIGNING_SECRET = 'abcd1234'

describe('parseHTTPPayload', () => {
	const parsePayload = (
		body: string,
		contentType: keyof typeof ContentType,
		headers: Record<string, string> = {},
	) => {
		const timestamp = Math.floor(Date.now() / 1000)
		const signature = calculateSignature(body, timestamp, SIGNING_SECRET)
		return parseHTTPPayload(
			body,
			SIGNING_SECRET,
			(name) =>
				({
					'x-slack-request-timestamp': timestamp.toString(),
					'x-slack-signature': signature,
					'content-type': ContentType[contentType],
					...headers,
				})[name.toLowerCase()],
		)
	}

	it('parses json payloads', () => {
		const data = parsePayload('{"type":"event_callback","key":"value"}', 'json')

		expect(data).toEqual({
			type: 'event_callback',
			payload: { type: 'event_callback', key: 'value' } as any,
		})
	})

	// it('parses form payloads', () => {
	// 	const payload = { type: 'block_actions', key: 'value' }
	// 	const data = parsePayload(`payload=${encodeURIComponent(JSON.stringify(payload))}`, 'form')

	// 	expect(data).toEqual({ type: 'block_actions', payload })
	// })
})

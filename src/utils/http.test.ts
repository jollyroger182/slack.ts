import { describe, expect, it } from 'bun:test'

import { ContentType } from '../tests/fixtures.test'
import { calculateSignature, parseHTTPPayload } from './http'

const SIGNING_SECRET = 'abcd1234'

describe('parseHTTPPayload', () => {
	const parsePayload = (
		body: string,
		contentType: keyof typeof ContentType,
		headers: Record<string, string> = {},
		{ timestamp = Math.floor(Date.now() / 1000) }: { timestamp?: number } = {},
	) => {
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

	it('parses form payloads', () => {
		const payload = { type: 'block_actions', key: 'value' }
		const data = parsePayload(`payload=${encodeURIComponent(JSON.stringify(payload))}`, 'form')

		expect(data).toEqual({ type: 'block_actions', payload } as any)
	})

	it('rejects missing content-type', () => {
		expect(() => parsePayload('{}', '' as any, { 'content-type': undefined as any })).toThrow(
			'No Content-Type header',
		)
	})

	it('rejects missing signature and timestamp', () => {
		expect(() =>
			parsePayload('{}', 'json', { 'x-slack-request-timestamp': undefined as any }),
		).toThrow('missing signature and/or timestamp')
		expect(() => parsePayload('{}', 'json', { 'x-slack-signature': undefined as any })).toThrow(
			'missing signature and/or timestamp',
		)
	})

	it('rejects timestamps too old or new', () => {
		expect(() => parsePayload('{}', 'json', {}, { timestamp: 10 })).toThrow(
			'possible replay attack',
		)
		expect(() => parsePayload('{}', 'json', {}, { timestamp: 1e9 })).toThrow(
			'possible replay attack',
		)
	})

	it('rejects invalid signatures', () => {
		expect(() => parsePayload('{}', 'json', { 'x-slack-signature': 'x' })).toThrow(
			'signature length mismatch',
		)

		const timestamp = Math.floor(Date.now() / 1000)
		const signature = calculateSignature('{}', timestamp, SIGNING_SECRET)
		const changed = '!' + signature.substring(1)
		expect(() => parsePayload('{}', 'json', { 'x-slack-signature': changed })).toThrow(
			'signature mismatch',
		)
	})

	it('rejects unicode characters in signature', () => {
		const timestamp = Math.floor(Date.now() / 1000)
		const signature = calculateSignature('{}', timestamp, SIGNING_SECRET)

		expect(() =>
			parsePayload('{}', 'json', { 'x-slack-signature': '\xE9' + signature.substring(1) }),
		).toThrow('signature length mismatch')
	})

	it('rejects incomplete bodies (json)', () => {
		expect(() => parsePayload('{', 'json')).toThrow('Invalid JSON data')
	})

	it('rejects invalid bodies (json)', () => {
		expect(() => parsePayload('{}', 'json')).toThrow('Invalid Slack JSON request body')
	})

	it('does not return invalid payloads (json)', () => {
		expect(parsePayload('{"type":"invalid_type"}', 'json')).toBeUndefined()
	})

	it('rejects invalid bodies (form)', () => {
		expect(() => parsePayload(`unknown=1234`, 'form')).toThrow('Invalid form body')
	})

	it('rejects invalid payload bodies (form)', () => {
		expect(() => parsePayload(`payload=${JSON.stringify({ unknown: 1234 })}`, 'form')).toThrow(
			'Invalid JSON content in form body',
		)
	})

	it('rejects incomplete bodies (form)', () => {
		expect(() => parsePayload(`payload=${encodeURIComponent('{"')}`, 'form')).toThrow(
			'Invalid JSON data in form body',
		)
	})
})

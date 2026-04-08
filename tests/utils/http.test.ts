import { beforeEach, describe, expect, it } from 'bun:test'
import { createHmac } from 'crypto'
import { parseSlackRequest } from '../../src/utils/http'

const SIGNING_SECRET = 'test-secret'

function createSignedRequest(body: string, timestamp: number = Math.floor(Date.now() / 1000)) {
	const baseString = `v0:${timestamp}:${body}`
	const signature = 'v0=' + createHmac('sha256', SIGNING_SECRET).update(baseString).digest('hex')

	return new Request('http://localhost/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Slack-Request-Timestamp': timestamp.toString(),
			'X-Slack-Signature': signature,
		},
		body,
	})
}

function createSignedFormRequest(body: string, timestamp: number = Math.floor(Date.now() / 1000)) {
	const baseString = `v0:${timestamp}:${body}`
	const signature = 'v0=' + createHmac('sha256', SIGNING_SECRET).update(baseString).digest('hex')

	return new Request('http://localhost/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-Slack-Request-Timestamp': timestamp.toString(),
			'X-Slack-Signature': signature,
		},
		body,
	})
}

describe('parseSlackRequest', () => {
	describe('signature validation', () => {
		it('accepts valid signatures', async () => {
			const payload = { type: 'url_verification', challenge: 'test-challenge' }
			const body = JSON.stringify(payload)
			const request = createSignedRequest(body)
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result).toBeDefined()
		})

		it('rejects invalid signatures', async () => {
			const payload = { type: 'url_verification', challenge: 'test-challenge' }
			const body = JSON.stringify(payload)
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': Math.floor(Date.now() / 1000).toString(),
					'X-Slack-Signature': 'v0=invalid',
				},
				body,
			})
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect(e).toBeInstanceOf(Error)
				expect((e as Error).message).toContain('Invalid signature')
			}
		})

		it('rejects requests with missing timestamp header', async () => {
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Signature': 'v0=test',
				},
				body: '{}',
			})
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Missing timestamp or signature headers')
			}
		})

		it('rejects requests with missing signature header', async () => {
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': Math.floor(Date.now() / 1000).toString(),
				},
				body: '{}',
			})
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Missing timestamp or signature headers')
			}
		})
	})

	describe('timestamp validation', () => {
		it('rejects request with old timestamp', async () => {
			const oldTimestamp = Math.floor(Date.now() / 1000) - 600 // 10 minutes ago
			const request = createSignedRequest('{}', oldTimestamp)
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Timestamp outside acceptable window')
			}
		})

		it('rejects request with future timestamp', async () => {
			const futureTimestamp = Math.floor(Date.now() / 1000) + 600 // 10 minutes in future
			const request = createSignedRequest('{}', futureTimestamp)
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Timestamp outside acceptable window')
			}
		})

		it('accepts request within timestamp window', async () => {
			const validTimestamp = Math.floor(Date.now() / 1000)
			const request = createSignedRequest('{}', validTimestamp)
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
			} catch (e) {
				// May fail due to invalid payload, but timestamp should pass
				expect((e as Error).message).not.toContain('Timestamp outside acceptable window')
			}
		})

		it('rejects invalid timestamp format', async () => {
			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': 'invalid',
					'X-Slack-Signature': 'v0=test',
				},
				body: '{}',
			})
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Timestamp outside acceptable window')
			}
		})

		it('uses custom timestamp window', async () => {
			const oldTimestamp = Math.floor(Date.now() / 1000) - 600
			const baseString = `v0:${oldTimestamp}:{}`
			const signature =
				'v0=' + createHmac('sha256', SIGNING_SECRET).update(baseString).digest('hex')

			const request = new Request('http://localhost/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Slack-Request-Timestamp': oldTimestamp.toString(),
					'X-Slack-Signature': signature,
				},
				body: '{}',
			})

			try {
				await parseSlackRequest(request, SIGNING_SECRET, 1000)
			} catch (e) {
				// May fail for other reasons, but timestamp should pass with larger window
				expect((e as Error).message).not.toContain('Timestamp outside acceptable window')
			}
		})
	})

	describe('payload parsing - JSON', () => {
		it('parses url_verification payload', async () => {
			const payload = { type: 'url_verification', challenge: 'test-challenge-123' }
			const request = createSignedRequest(JSON.stringify(payload))
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('url_verification')
			if (result.type === 'url_verification') {
				expect(result.challenge).toBe('test-challenge-123')
			}
		})

		it('parses event callback payload', async () => {
			const payload = {
				type: 'event_callback',
				event: { type: 'app_mention', user: 'U12345' },
				team_id: 'T12345',
			}
			const request = createSignedRequest(JSON.stringify(payload))
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('event')
		})

		it('parses block_actions payload', async () => {
			const payload = {
				type: 'block_actions',
				actions: [{ type: 'button', action_id: 'test' }],
				team: { id: 'T12345' },
			}
			const request = createSignedRequest(JSON.stringify(payload))
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('block_actions')
		})

		it('parses view_submission payload', async () => {
			const payload = {
				type: 'view_submission',
				view: { id: 'V12345', callback_id: 'test' },
				team: { id: 'T12345' },
			}
			const request = createSignedRequest(JSON.stringify(payload))
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('view_submission')
		})

		it('rejects invalid JSON', async () => {
			const request = createSignedRequest('invalid JSON')
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Invalid JSON payload')
			}
		})

		it('rejects non-object JSON', async () => {
			const request = createSignedRequest('"not an object"')
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Invalid payload')
			}
		})
	})

	describe('payload parsing - Form-urlencoded', () => {
		it('parses slash command from form data', async () => {
			const body = new URLSearchParams({
				command: '/test',
				text: 'hello',
				trigger_id: 'T12345',
				team_id: 'T12345',
				user_id: 'U12345',
				channel_id: 'C12345',
			}).toString()

			const request = createSignedFormRequest(body)
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('slash_command')
		})

		it('parses block_actions from form data with payload field', async () => {
			const payload = {
				type: 'block_actions',
				actions: [{ type: 'button', action_id: 'test' }],
				team: { id: 'T12345' },
			}
			const body = new URLSearchParams({
				payload: JSON.stringify(payload),
			}).toString()

			const request = createSignedFormRequest(body)
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('block_actions')
		})

		it('parses view_submission from form data with payload field', async () => {
			const payload = {
				type: 'view_submission',
				view: { id: 'V12345', callback_id: 'test' },
				team: { id: 'T12345' },
			}
			const body = new URLSearchParams({
				payload: JSON.stringify(payload),
			}).toString()

			const request = createSignedFormRequest(body)
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('view_submission')
		})

		it('rejects invalid JSON in payload field', async () => {
			const body = new URLSearchParams({
				payload: '{invalid}',
			}).toString()

			const request = createSignedFormRequest(body)
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Invalid JSON in form payload')
			}
		})
	})

	describe('content type handling', () => {
		it('accepts application/json content type', async () => {
			const payload = { type: 'url_verification', challenge: 'test' }
			const request = createSignedRequest(JSON.stringify(payload))
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result).toBeDefined()
		})

		it('accepts application/x-www-form-urlencoded content type', async () => {
			const body = new URLSearchParams({
				command: '/test',
				text: 'hello',
				trigger_id: 'T12345',
				team_id: 'T12345',
				user_id: 'U12345',
				channel_id: 'C12345',
			}).toString()

			const request = createSignedFormRequest(body)
			const result = await parseSlackRequest(request, SIGNING_SECRET)
			expect(result.type).toBe('slash_command')
		})
	})

	describe('payload type detection', () => {
		it('detects unrecognized payload type', async () => {
			const payload = { type: 'unknown', data: 'test' }
			const request = createSignedRequest(JSON.stringify(payload))
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Unrecognized payload type')
			}
		})

		it('requires event property for event_callback', async () => {
			const payload = { type: 'event_callback' }
			const request = createSignedRequest(JSON.stringify(payload))
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Unrecognized payload type')
			}
		})

		it('requires actions array for block_actions', async () => {
			const payload = { type: 'block_actions' }
			const request = createSignedRequest(JSON.stringify(payload))
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Unrecognized payload type')
			}
		})

		it('requires view property for view_submission', async () => {
			const payload = { type: 'view_submission' }
			const request = createSignedRequest(JSON.stringify(payload))
			try {
				await parseSlackRequest(request, SIGNING_SECRET)
				expect.unreachable()
			} catch (e) {
				expect((e as Error).message).toContain('Unrecognized payload type')
			}
		})
	})
})

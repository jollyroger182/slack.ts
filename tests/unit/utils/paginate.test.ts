import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { App, type SlackAPIResponse } from 'slack.ts'
import { paginate } from '../../../src/utils/paginate'
import type { AnyMessage } from '../../../src/api/types/message'

describe('paginate', () => {
	let app: App

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
	})

	it('follows next_cursor to paginate', async () => {
		const requestSpy = spyOn(app, 'request')
			.mockResolvedValueOnce({
				ok: true,
				pin_count: 0,
				messages: [
					{ type: 'message', ts: '123456.789', text: 'hello world', user: 'U123', team: 'T123' },
				],
				has_more: true,
				response_metadata: { next_cursor: 'abcdef123' },
			} satisfies SlackAPIResponse<'conversations.history'>)
			.mockResolvedValueOnce({
				ok: true,
				pin_count: 0,
				messages: [
					{ type: 'message', ts: '123457.789', text: 'second message', user: 'U123', team: 'T123' },
				],
				has_more: false,
			} satisfies SlackAPIResponse<'conversations.history'>)

		const messages: (AnyMessage & { mapped: boolean })[] = []
		for await (const message of paginate(app, 'conversations.history', { channel: 'C123' }, (r) =>
			r.messages.map((m) => ({ ...m, mapped: true })),
		)) {
			messages.push(message)
		}

		expect(requestSpy).toHaveBeenCalledTimes(2)
		expect(requestSpy.mock.calls[0]![0]).toBe('conversations.history')
		expect(requestSpy.mock.calls[0]![1]).toMatchObject({ channel: 'C123' })
		expect(requestSpy.mock.calls[0]![1].cursor).toBeUndefined()
		expect(requestSpy.mock.calls[1]![1]).toMatchObject({ channel: 'C123', cursor: 'abcdef123' })
		expect(messages).toHaveLength(2)
		expect(messages[0]).toMatchObject({ mapped: true })
	})
})

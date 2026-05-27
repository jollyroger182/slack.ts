import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { App, UnfurlImpl, type AttachmentData, type SlackAPIResponse, type Unfurl } from 'slack.ts'
import { LINK_SHARED_DATA } from '../../fixtures'

describe('Unfurl', () => {
	let app: App
	let unfurl: Unfurl

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		unfurl = UnfurlImpl.create(app, LINK_SHARED_DATA)
	})

	it('has raw property', () => {
		expect(unfurl.raw).toEqual(LINK_SHARED_DATA)
	})

	it('proxies raw properties', () => {
		expect(unfurl.message_ts).toBe(LINK_SHARED_DATA.message_ts)
		expect(unfurl.channel).toBe(LINK_SHARED_DATA.channel)
	})

	it('can respond with chat.unfurl', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
		} satisfies SlackAPIResponse<'chat.unfurl'>)

		const payload = {
			'https://example.com/unfurl': {
				blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'hello world' } }],
			},
		} satisfies Record<string, AttachmentData>

		await unfurl.respond(payload)

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('chat.unfurl', {
			channel: LINK_SHARED_DATA.channel,
			ts: LINK_SHARED_DATA.message_ts,
			unfurls: payload,
		})
	})
})

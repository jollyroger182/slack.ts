import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { App, HomeOpened, type HomeOpenedInstance, type SlackAPIResponse } from 'slack.ts'
import { HOME_OPENED_DATA, HOME_VIEW_DATA } from '../../fixtures'

describe('HomeOpened', () => {
	let app: App
	let homeOpened: HomeOpenedInstance

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		homeOpened = new HomeOpened(app, HOME_OPENED_DATA) as HomeOpenedInstance
	})

	it('has raw property', () => {
		expect(homeOpened.raw).toEqual(HOME_OPENED_DATA)
	})

	it('proxies raw properties', () => {
		expect(homeOpened.user).toBe(HOME_OPENED_DATA.user)
		expect(homeOpened.tab).toBe(HOME_OPENED_DATA.tab)
	})

	it('can respond with a view', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			view: HOME_VIEW_DATA,
		} satisfies SlackAPIResponse<'views.publish'>)

		const resp = await homeOpened.respond({ type: 'home', blocks: HOME_VIEW_DATA.blocks })

		expect(resp).toEqual({ ok: true, view: HOME_VIEW_DATA })
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('views.publish', {
			user_id: HOME_OPENED_DATA.user,
			view: { type: 'home', blocks: HOME_VIEW_DATA.blocks },
		})
	})
})

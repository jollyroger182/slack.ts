import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { Action, App, type ActionInstance } from 'slack.ts'
import type { ButtonAction } from '../../../src/api/interactive/block_actions'
import { blockActionsEx, BUTTON_DATA } from '../../fixtures'

const EVENT_DATA = blockActionsEx({ response_url: 'http://localhost:3003/respond' }, BUTTON_DATA)

describe('Action', () => {
	let app: App
	let action: ActionInstance<ButtonAction>
	let originalFetch: typeof fetch

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		action = new Action(app, BUTTON_DATA, EVENT_DATA) as ActionInstance<ButtonAction>
		originalFetch = globalThis.fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
	})

	it('has event property', () => {
		expect(action.event).toEqual(EVENT_DATA)
	})

	it('has raw property', () => {
		expect(action.raw).toEqual(BUTTON_DATA)
	})

	it('proxies raw properties', () => {
		expect(action.action_id).toBe(BUTTON_DATA.action_id)
	})

	it('can respond with a message', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response())

		await action.respond.message('Hello world')

		expect(fetchSpy).toBeCalledTimes(1)
		expect(fetchSpy.mock.calls[0]![0]).toBe('http://localhost:3003/respond')
	})
})

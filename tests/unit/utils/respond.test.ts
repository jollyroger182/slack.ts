import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { App, Modal, SlackError, type SlackAPIResponse } from 'slack.ts'
import { Responder } from '../../../src/utils/respond'
import { MODAL_VIEW_DATA } from '../../fixtures'

describe('Responder', () => {
	let app: App
	let responder: Responder<true>
	let originalFetch: typeof fetch

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		responder = new Responder(app, 'http://localhost:3003/respond', 'trigger_123abc')
		originalFetch = globalThis.fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
	})

	it('responds with a message', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response())

		await responder.message('Hello world')

		expect(fetchSpy).toBeCalledTimes(1)
		expect(fetchSpy.mock.calls[0]![0]).toBe('http://localhost:3003/respond')
		expect(fetchSpy.mock.calls[0]![1]).toMatchObject({
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		})
		const { body } = fetchSpy.mock.calls[0]![1]!
		expect(body).toBeString()
		const payload = JSON.parse(body as string)
		expect(payload).toEqual({
			text: 'Hello world',
			response_type: 'in_channel',
			replace_original: false,
		})
	})

	it('responds with an ephemeral message', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response())

		await responder.message({ text: 'Hello world', ephemeral: true })

		const { body } = fetchSpy.mock.calls[0]![1]!
		const payload = JSON.parse(body as string)
		expect(payload).toEqual({
			text: 'Hello world',
			response_type: 'ephemeral',
			replace_original: false,
		})
	})

	it('responds with an edit', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response())

		await responder.edit('Hello world')

		const { body } = fetchSpy.mock.calls[0]![1]!
		const payload = JSON.parse(body as string)
		expect(payload).toEqual({
			text: 'Hello world',
			response_type: 'in_channel',
			replace_original: true,
		})
	})

	it('responds with deletion', async () => {
		const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response())

		await responder.delete()

		const { body } = fetchSpy.mock.calls[0]![1]!
		const payload = JSON.parse(body as string)
		expect(payload).toEqual({ delete_original: true })
	})

	it('responds with a modal', async () => {
		const requestSpy = spyOn(app, 'request').mockResolvedValueOnce({
			ok: true,
			view: MODAL_VIEW_DATA,
		} satisfies SlackAPIResponse<'views.open'>)

		const modal = await responder.modal({
			type: 'modal',
			title: MODAL_VIEW_DATA.title,
			blocks: MODAL_VIEW_DATA.blocks,
		})

		expect(modal).toBeInstanceOf(Modal)
		expect(modal.raw).toEqual(MODAL_VIEW_DATA as any)
		expect(modal.callback_id).toBe(MODAL_VIEW_DATA.callback_id)
		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy.mock.calls[0]![0]).toBe('views.open')
		expect(requestSpy.mock.calls[0]![1]).toMatchObject({
			view: {
				type: 'modal',
				title: MODAL_VIEW_DATA.title,
				blocks: MODAL_VIEW_DATA.blocks,
			},
			trigger_id: 'trigger_123abc',
		})
	})

	it('throws when no response_url is provided', async () => {
		const noUrlResponder = new Responder(app, undefined, 'trigger_123abc')

		expect(noUrlResponder.message('error')).rejects.toThrow(
			new SlackError('Cannot respond to this event'),
		)
	})
})

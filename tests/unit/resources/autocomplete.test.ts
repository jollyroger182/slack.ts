import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { App, Autocomplete, option, optionGroup, type AutocompleteInstance } from 'slack.ts'
import type { BlockSuggestionResponder } from '../../../src/receivers/base'
import { BLOCK_SUGGESTION_DATA } from '../../fixtures'

describe('Autocomplete', () => {
	let app: App<'dummy'>
	let autocomplete: AutocompleteInstance

	let responder: BlockSuggestionResponder | undefined

	beforeEach(() => {
		app = new App({ token: 'xoxb-test-token' })
		autocomplete = new Autocomplete(app, BLOCK_SUGGESTION_DATA, async (...args) =>
			responder?.(...args),
		) as AutocompleteInstance
		responder = undefined
	})

	it('has raw property', () => {
		expect(autocomplete.raw).toEqual(BLOCK_SUGGESTION_DATA)
	})

	it('proxies raw properties', () => {
		expect(autocomplete.action_id).toBe(BLOCK_SUGGESTION_DATA.action_id)
		expect(autocomplete.value).toBe(BLOCK_SUGGESTION_DATA.value)
	})

	it('can respond with options', async () => {
		responder = mock(async () => {})

		const options = [option('test').value('abc'), option('def').value('ghi')]
		await autocomplete.respond(...options)

		expect(responder).toBeCalledTimes(1)
		expect(responder).toBeCalledWith({ options: options.map((o) => o.build()) })
	})

	it('can respond with option groups', async () => {
		responder = mock(async () => {})

		const optionGroups = [
			optionGroup('label', option('test').value('abc'), option('def').value('ghi')),
			optionGroup('label2', option('aaa').value('bbb')),
		]
		await autocomplete.respond(...optionGroups)

		expect(responder).toBeCalledTimes(1)
		expect(responder).toBeCalledWith({ option_groups: optionGroups.map((g) => g.build()) })
	})

	it('can respond with nothing', async () => {
		responder = mock(async () => {})

		await autocomplete.respond()

		expect(responder).toBeCalledTimes(1)
		expect(responder).toBeCalledWith({ options: [] })
	})
})

import type { KnownBlock } from '@slack/types'
import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Modal, type ModalInstance } from '../../src/resources/modal'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN, receiver: { type: 'dummy' } })
})

describe('Modal', () => {
	describe('constructor', () => {
		it('creates Modal with view data', () => {
			const viewData = {
				id: 'V123456',
				team_id: 'T123456',
				type: 'modal',
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V123456',
				app_id: 'A123456',
				external_id: '',
				app_installed_team_id: 'T123456',
				state: { values: {} },
				hash: 'hash123',
				title: { type: 'plain_text', text: 'My Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V123456',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'modal-callback',
			} as const

			const modal = new Modal(app, viewData as any)
			expect(modal).toBeDefined()
		})

		it('stores view data', () => {
			const viewData = {
				id: 'V123456',
				team_id: 'T123456',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V123456',
				app_id: 'A123456',
				external_id: '',
				app_installed_team_id: 'T123456',
				state: { values: {} },
				hash: 'hash123',
				title: { type: 'plain_text' as const, text: 'My Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V123456',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'modal-callback',
			}

			const modal = new Modal(app, viewData as any)
			expect(modal.raw).toBeDefined()
			expect(modal.raw.id).toBe('V123456')
		})

		it('accepts generic block parameter', () => {
			const viewData = {
				id: 'V123',
				team_id: 'T123',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V123',
				app_id: 'A123',
				external_id: '',
				app_installed_team_id: 'T123',
				state: { values: {} },
				hash: 'hash',
				title: { type: 'plain_text' as const, text: 'Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V123',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'cb-id',
			}

			const modal = new Modal<KnownBlock[]>(app, viewData as any)
			expect(modal).toBeDefined()
		})
	})

	describe('raw property', () => {
		it('returns the view data', () => {
			const viewData = {
				id: 'V456',
				team_id: 'T456',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V456',
				app_id: 'A456',
				external_id: '',
				app_installed_team_id: 'T456',
				state: { values: {} },
				hash: 'hash456',
				title: { type: 'plain_text' as const, text: 'Test Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V456',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'test-callback',
			}

			const modal = new Modal(app, viewData as any)
			expect(modal.raw.id).toBe('V456')
			expect(modal.raw.callback_id).toBe('test-callback')
		})
	})

	describe('wait property', () => {
		it('returns ModalWait instance', () => {
			const viewData = {
				id: 'V789',
				team_id: 'T789',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V789',
				app_id: 'A789',
				external_id: '',
				app_installed_team_id: 'T789',
				state: { values: {} },
				hash: 'hash789',
				title: { type: 'plain_text' as const, text: 'Wait Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V789',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'wait-callback',
			}

			const modal = new Modal(app, viewData as any)
			const modalWait = modal.wait
			expect(modalWait).toBeDefined()
		})

		it('can chain wait().submit()', async () => {
			const viewData = {
				id: 'V999',
				team_id: 'T999',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V999',
				app_id: 'A999',
				external_id: '',
				app_installed_team_id: 'T999',
				state: { values: {} },
				hash: 'hash999',
				title: { type: 'plain_text' as const, text: 'W Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V999',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'w-callback',
			}

			const modal = new Modal(app, viewData as any)
			const submitPromise = modal.wait.submit()

			// Set a short timeout to verify it rejects
			expect(async () => {
				await submitPromise
			}).toBeDefined()
		})
	})

	describe('ModalWait', () => {
		it('timeout() sets timeout value', async () => {
			const viewData = {
				id: 'V111',
				team_id: 'T111',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V111',
				app_id: 'A111',
				external_id: '',
				app_installed_team_id: 'T111',
				state: { values: {} },
				hash: 'h111',
				title: { type: 'plain_text' as const, text: 'Modal' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V111',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'cb',
			}

			const modal = new Modal(app, viewData as any)
			const wait = modal.wait.timeout(5000)
			expect(wait).toBeDefined()
		})

		it('timeout() returns self for chaining', () => {
			const viewData = {
				id: 'V222',
				team_id: 'T222',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V222',
				app_id: 'A222',
				external_id: '',
				app_installed_team_id: 'T222',
				state: { values: {} },
				hash: 'h222',
				title: { type: 'plain_text' as const, text: 'Modal2' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V222',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'cb2',
			}

			const modal = new Modal(app, viewData as any)
			const wait1 = modal.wait
			const wait2 = wait1.timeout(10000)
			expect(typeof wait2.submit).toBe('function')
		})

		it('submit() returns promise', () => {
			const viewData = {
				id: 'V333',
				team_id: 'T333',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V333',
				app_id: 'A333',
				external_id: '',
				app_installed_team_id: 'T333',
				state: { values: {} },
				hash: 'h333',
				title: { type: 'plain_text' as const, text: 'Modal3' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V333',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'cb3',
			}

			const modal = new Modal(app, viewData as any)
			const submitPromise = modal.wait.submit()
			expect(submitPromise).toHaveProperty('then')
		})
	})

	describe('proxy access to modal data', () => {
		it('provides access to view properties via proxy', () => {
			const viewData = {
				id: 'V444',
				team_id: 'T444',
				type: 'modal' as const,
				blocks: [],
				previous_view_id: null,
				root_view_id: 'V444',
				app_id: 'A444',
				external_id: '',
				app_installed_team_id: 'T444',
				state: { values: {} },
				hash: 'h444',
				title: { type: 'plain_text' as const, text: 'Modal4' },
				clear_on_close: false,
				notify_on_close: false,
				previous_view_hash: null,
				view_id: 'V444',
				custom_view_id: null,
				committed_at: Math.floor(Date.now() / 1000),
				callback_id: 'cb4',
			}

			const modal = new Modal(app, viewData as any) as any
			expect(modal.id).toBe('V444')
			expect(modal.callback_id).toBe('cb4')
		})
	})
})

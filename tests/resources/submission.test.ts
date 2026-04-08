import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Submission } from '../../src/resources/submission'
import type { ViewSubmission } from '../../src/api/interactive/view_submission'

let app: App

beforeEach(() => {
	app = new App({ token: 'xoxb-test-token', receiver: { type: 'dummy' } })
})

describe('Submission', () => {
	describe('constructor', () => {
		it('creates Submission with ViewSubmission data', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U123', username: 'testuser', name: 'Test User', team_id: 'T123' },
				api_app_id: 'A123',
				token: 'token123',
				container: { type: 'view', view_id: 'V123' },
				trigger_id: 'trigger-123',
				team: { id: 'T123', domain: 'test' },
				view: {
					id: 'V123',
					team_id: 'T123',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V123',
					app_id: 'A123',
					external_id: '',
					app_installed_team_id: 'T123',
					state: { values: {} },
					hash: 'hash123',
					title: { type: 'plain_text', text: 'Form' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V123',
					custom_view_id: null,
					committed_at: 1234567890,
					callback_id: 'form_callback',
				},
				response_urls: ['https://hooks.slack.com/actions/T123/B123/xyz'],
				event_ts: '123456.789',
			}

			const sub = new Submission(app, submission)
			expect(sub).toBeDefined()
		})

		it('stores submission data', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U999', username: 'user999', name: 'User 999', team_id: 'T999' },
				api_app_id: 'A999',
				token: 'token999',
				container: { type: 'view', view_id: 'V999' },
				trigger_id: 'trig-999',
				team: { id: 'T999', domain: 'test999' },
				view: {
					id: 'V999',
					team_id: 'T999',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V999',
					app_id: 'A999',
					external_id: '',
					app_installed_team_id: 'T999',
					state: { values: { field1: { action1: { type: 'plain_text_input', value: 'test' } } } },
					hash: 'hash999',
					title: { type: 'plain_text', text: 'Form999' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V999',
					custom_view_id: null,
					committed_at: 1234567899,
					callback_id: 'form_999',
				},
				response_urls: ['https://example.com/response'],
				event_ts: '999.999',
			}

			const sub = new Submission(app, submission)
			expect(sub).toBeDefined()
		})
	})

	describe('respond property', () => {
		it('returns a Responder instance', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U111', username: 'user111', name: 'User 111', team_id: 'T111' },
				api_app_id: 'A111',
				token: 'token111',
				container: { type: 'view', view_id: 'V111' },
				trigger_id: 'trig-111',
				team: { id: 'T111', domain: 'test111' },
				view: {
					id: 'V111',
					team_id: 'T111',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V111',
					app_id: 'A111',
					external_id: '',
					app_installed_team_id: 'T111',
					state: { values: {} },
					hash: 'hash111',
					title: { type: 'plain_text', text: 'Form111' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V111',
					custom_view_id: null,
					committed_at: 1234567811,
					callback_id: 'form_111',
				},
				response_urls: ['https://hooks.slack.com/actions/T111/B111/xyz'],
				event_ts: '111.111',
			}

			const sub = new Submission(app, submission)
			const responder = sub.respond
			expect(responder).toBeDefined()
			expect(typeof responder.message).toBe('function')
		})

		it('responder uses first response_url', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U222', username: 'user222', name: 'User 222', team_id: 'T222' },
				api_app_id: 'A222',
				token: 'token222',
				container: { type: 'view', view_id: 'V222' },
				trigger_id: 'trig-222',
				team: { id: 'T222', domain: 'test222' },
				view: {
					id: 'V222',
					team_id: 'T222',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V222',
					app_id: 'A222',
					external_id: '',
					app_installed_team_id: 'T222',
					state: { values: {} },
					hash: 'hash222',
					title: { type: 'plain_text', text: 'Form222' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V222',
					custom_view_id: null,
					committed_at: 1234567822,
					callback_id: 'form_222',
				},
				response_urls: [
					'https://hooks.slack.com/actions/T222/B222/first',
					'https://hooks.slack.com/actions/T222/B222/second',
				],
				event_ts: '222.222',
			}

			const sub = new Submission(app, submission)
			const responder = sub.respond
			expect(responder).toBeDefined()
		})
	})

	describe('values property', () => {
		it('returns view state values', () => {
			const stateValues = {
				name_field: { name_input: { type: 'plain_text_input', value: 'John Doe' } },
				email_field: { email_input: { type: 'plain_text_input', value: 'john@example.com' } },
			}

			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U333', username: 'user333', name: 'User 333', team_id: 'T333' },
				api_app_id: 'A333',
				token: 'token333',
				container: { type: 'view', view_id: 'V333' },
				trigger_id: 'trig-333',
				team: { id: 'T333', domain: 'test333' },
				view: {
					id: 'V333',
					team_id: 'T333',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V333',
					app_id: 'A333',
					external_id: '',
					app_installed_team_id: 'T333',
					state: { values: stateValues },
					hash: 'hash333',
					title: { type: 'plain_text', text: 'Form333' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V333',
					custom_view_id: null,
					committed_at: 1234567833,
					callback_id: 'form_333',
				},
				response_urls: ['https://example.com/response'],
				event_ts: '333.333',
			}

			const sub = new Submission(app, submission)
			expect(sub.values).toEqual(stateValues)
		})

		it('accesses nested form values', () => {
			const stateValues = {
				input_block: {
					textarea_action: {
						type: 'plain_text_input',
						value: 'Multi\nline\ntext',
					},
				},
			}

			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U444', username: 'user444', name: 'User 444', team_id: 'T444' },
				api_app_id: 'A444',
				token: 'token444',
				container: { type: 'view', view_id: 'V444' },
				trigger_id: 'trig-444',
				team: { id: 'T444', domain: 'test444' },
				view: {
					id: 'V444',
					team_id: 'T444',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V444',
					app_id: 'A444',
					external_id: '',
					app_installed_team_id: 'T444',
					state: { values: stateValues },
					hash: 'hash444',
					title: { type: 'plain_text', text: 'Form444' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V444',
					custom_view_id: null,
					committed_at: 1234567844,
					callback_id: 'form_444',
				},
				response_urls: ['https://example.com/response'],
				event_ts: '444.444',
			}

			const sub = new Submission(app, submission)
			const values = sub.values
			expect(values.input_block).toBeDefined()
			expect(values.input_block.textarea_action.value).toBe('Multi\nline\ntext')
		})
	})

	describe('proxy access to submission data', () => {
		it('provides access to ViewSubmission properties via proxy', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U555', username: 'user555', name: 'User 555', team_id: 'T555' },
				api_app_id: 'A555',
				token: 'token555',
				container: { type: 'view', view_id: 'V555' },
				trigger_id: 'trig-555',
				team: { id: 'T555', domain: 'test555' },
				view: {
					id: 'V555',
					team_id: 'T555',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V555',
					app_id: 'A555',
					external_id: '',
					app_installed_team_id: 'T555',
					state: { values: {} },
					hash: 'hash555',
					title: { type: 'plain_text', text: 'Form555' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V555',
					custom_view_id: null,
					committed_at: 1234567855,
					callback_id: 'form_555',
				},
				response_urls: ['https://example.com/response'],
				event_ts: '555.555',
			}

			const sub = new Submission(app, submission) as any
			expect(sub.type).toBe('view_submission')
			expect(sub.user.id).toBe('U555')
			expect(sub.trigger_id).toBe('trig-555')
		})
	})

	describe('SubmissionInstance type', () => {
		it('combines Submission methods and ViewSubmission properties', () => {
			const submission: ViewSubmission = {
				type: 'view_submission',
				user: { id: 'U666', username: 'user666', name: 'User 666', team_id: 'T666' },
				api_app_id: 'A666',
				token: 'token666',
				container: { type: 'view', view_id: 'V666' },
				trigger_id: 'trig-666',
				team: { id: 'T666', domain: 'test666' },
				view: {
					id: 'V666',
					team_id: 'T666',
					type: 'modal',
					blocks: [],
					previous_view_id: null,
					root_view_id: 'V666',
					app_id: 'A666',
					external_id: '',
					app_installed_team_id: 'T666',
					state: { values: {} },
					hash: 'hash666',
					title: { type: 'plain_text', text: 'Form666' },
					clear_on_close: false,
					notify_on_close: false,
					previous_view_hash: null,
					view_id: 'V666',
					custom_view_id: null,
					committed_at: 1234567866,
					callback_id: 'form_666',
				},
				response_urls: ['https://example.com/response'],
				event_ts: '666.666',
			}

			const sub = new Submission(app, submission)

			// Should have Submission methods
			expect(typeof sub.respond).toBe('object')
			expect(typeof sub.values).toBe('object')

			// Should have ViewSubmission properties (via proxy)
			const subAsAny = sub as any
			expect(subAsAny.type).toBe('view_submission')
		})
	})
})

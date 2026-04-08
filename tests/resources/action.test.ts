import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { Action } from '../../src/resources/action'
import type { BlockActions } from '../../src/api/interactive/block_actions'
import type { ButtonAction } from '../../src/api/interactive/block_actions'

let app: App

beforeEach(() => {
	app = new App({ token: 'xoxb-test-token', receiver: { type: 'dummy' } })
})

describe('Action', () => {
	describe('constructor', () => {
		it('creates Action with action data and event', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-1',
				action_ts: '123456',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U123', username: 'testuser', name: 'Test User', team_id: 'T123' },
				api_app_id: 'A123',
				token: 'token',
				container: {
					type: 'message',
					message_ts: '1234567890.123456',
					channel_id: 'C123',
				},
				trigger_id: 'trigger-123',
				team: { id: 'T123', domain: 'test' },
				actions: [action],
				response_url: 'https://hooks.slack.com/actions/T123/B123/xyz',
				event_ts: '123456.789',
			}

			const act = new Action(app, action, event)
			expect(act).toBeDefined()
		})

		it('stores action data and event', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'test-action',
				action_ts: '999',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U999', username: 'user999', name: 'User 999', team_id: 'T999' },
				api_app_id: 'A999',
				token: 'token999',
				container: {
					type: 'message',
					message_ts: '9999.9999',
					channel_id: 'C999',
				},
				trigger_id: 'trig-999',
				team: { id: 'T999', domain: 'test999' },
				actions: [action],
				response_url: 'https://example.com/response',
				event_ts: '999.999',
			}

			const act = new Action(app, action, event)
			expect(act.event).toEqual(event)
			expect(act.raw).toEqual(action)
		})
	})

	describe('raw property', () => {
		it('returns the action data', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-raw',
				action_ts: '111',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U111', username: 'user111', name: 'User 111', team_id: 'T111' },
				api_app_id: 'A111',
				token: 'token111',
				container: {
					type: 'message',
					message_ts: '1111.1111',
					channel_id: 'C111',
				},
				trigger_id: 'trig-111',
				team: { id: 'T111', domain: 'test111' },
				actions: [action],
				response_url: 'https://example.com/111',
				event_ts: '111.111',
			}

			const act = new Action(app, action, event)
			expect(act.raw.type).toBe('button')
			expect(act.raw.action_id).toBe('btn-raw')
		})
	})

	describe('event property', () => {
		it('returns the BlockActions event', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-event',
				action_ts: '222',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U222', username: 'user222', name: 'User 222', team_id: 'T222' },
				api_app_id: 'A222',
				token: 'token222',
				container: {
					type: 'message',
					message_ts: '2222.2222',
					channel_id: 'C222',
				},
				trigger_id: 'trig-222',
				team: { id: 'T222', domain: 'test222' },
				actions: [action],
				response_url: 'https://example.com/222',
				event_ts: '222.222',
			}

			const act = new Action(app, action, event)
			expect(act.event.type).toBe('block_actions')
			expect(act.event.trigger_id).toBe('trig-222')
			expect(act.event.response_url).toBe('https://example.com/222')
		})

		it('provides access to user from event', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-user',
				action_ts: '333',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U333', username: 'testuser333', name: 'Test User 333', team_id: 'T333' },
				api_app_id: 'A333',
				token: 'token333',
				container: {
					type: 'message',
					message_ts: '3333.3333',
					channel_id: 'C333',
				},
				trigger_id: 'trig-333',
				team: { id: 'T333', domain: 'test333' },
				actions: [action],
				response_url: 'https://example.com/333',
				event_ts: '333.333',
			}

			const act = new Action(app, action, event)
			expect(act.event.user.id).toBe('U333')
			expect(act.event.user.username).toBe('testuser333')
		})
	})

	describe('respond property', () => {
		it('returns a Responder instance', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-respond',
				action_ts: '444',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U444', username: 'user444', name: 'User 444', team_id: 'T444' },
				api_app_id: 'A444',
				token: 'token444',
				container: {
					type: 'message',
					message_ts: '4444.4444',
					channel_id: 'C444',
				},
				trigger_id: 'trig-444',
				team: { id: 'T444', domain: 'test444' },
				actions: [action],
				response_url: 'https://example.com/444',
				event_ts: '444.444',
			}

			const act = new Action(app, action, event)
			const responder = act.respond
			expect(responder).toBeDefined()
			expect(typeof responder.message).toBe('function')
		})

		it('responder has message, edit, delete, and modal methods', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-methods',
				action_ts: '555',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U555', username: 'user555', name: 'User 555', team_id: 'T555' },
				api_app_id: 'A555',
				token: 'token555',
				container: {
					type: 'message',
					message_ts: '5555.5555',
					channel_id: 'C555',
				},
				trigger_id: 'trig-555',
				team: { id: 'T555', domain: 'test555' },
				actions: [action],
				response_url: 'https://example.com/555',
				event_ts: '555.555',
			}

			const act = new Action(app, action, event)
			const responder = act.respond
			expect(typeof responder.message).toBe('function')
			expect(typeof responder.edit).toBe('function')
			expect(typeof responder.delete).toBe('function')
			expect(typeof responder.modal).toBe('function')
		})
	})

	describe('proxy access to action data', () => {
		it('provides access to action properties via proxy', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-proxy',
				action_ts: '666',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U666', username: 'user666', name: 'User 666', team_id: 'T666' },
				api_app_id: 'A666',
				token: 'token666',
				container: {
					type: 'message',
					message_ts: '6666.6666',
					channel_id: 'C666',
				},
				trigger_id: 'trig-666',
				team: { id: 'T666', domain: 'test666' },
				actions: [action],
				response_url: 'https://example.com/666',
				event_ts: '666.666',
			}

			const act = new Action(app, action, event) as any
			expect(act.type).toBe('button')
			expect(act.action_id).toBe('btn-proxy')
			expect(act.action_ts).toBe('666')
		})
	})

	describe('ActionInstance type', () => {
		it('combines Action methods and BlockAction properties', () => {
			const action: ButtonAction = {
				type: 'button',
				action_id: 'btn-instance',
				action_ts: '777',
			}

			const event: BlockActions = {
				type: 'block_actions',
				user: { id: 'U777', username: 'user777', name: 'User 777', team_id: 'T777' },
				api_app_id: 'A777',
				token: 'token777',
				container: {
					type: 'message',
					message_ts: '7777.7777',
					channel_id: 'C777',
				},
				trigger_id: 'trig-777',
				team: { id: 'T777', domain: 'test777' },
				actions: [action],
				response_url: 'https://example.com/777',
				event_ts: '777.777',
			}

			const act = new Action(app, action, event)

			// Should have Action methods
			expect(typeof act.event).toBe('object')
			expect(typeof act.raw).toBe('object')
			expect(typeof act.respond).toBe('object')

			// Should have action properties (via proxy)
			const actAsAny = act as any
			expect(actAsAny.action_id).toBe('btn-instance')
		})
	})
})

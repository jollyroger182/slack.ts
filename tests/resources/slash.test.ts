import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { SlashCommand } from '../../src/resources/slash'
import { UserRef } from '../../src/resources/user'
import { ChannelRef } from '../../src/resources/channel'
import type { SlashCommandPayload } from '../../src/api/slash'

let app: App

beforeEach(() => {
	app = new App({ token: 'xoxb-test-token', receiver: { type: 'dummy' } })
})

describe('SlashCommand', () => {
	describe('constructor', () => {
		it('creates SlashCommand with payload', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T123',
				team_domain: 'testdomain',
				channel_id: 'C123',
				channel_name: 'general',
				user_id: 'U123',
				user_name: 'testuser',
				command: '/test',
				text: 'some arguments',
				api_app_id: 'A123',
				response_url: 'https://hooks.slack.com/commands/T123/B123/xyz',
				trigger_id: 'trigger-123',
			}

			const cmd = new SlashCommand(app, payload)
			expect(cmd).toBeDefined()
		})

		it('stores payload data', () => {
			const payload: SlashCommandPayload = {
				token: 'token999',
				team_id: 'T999',
				team_domain: 'test999',
				channel_id: 'C999',
				channel_name: 'channel999',
				user_id: 'U999',
				user_name: 'user999',
				command: '/mycommand',
				text: 'arg1 arg2',
				api_app_id: 'A999',
				response_url: 'https://example.com/response',
				trigger_id: 'trig-999',
			}

			const cmd = new SlashCommand(app, payload)
			expect(cmd).toBeDefined()
		})
	})

	describe('respond property', () => {
		it('returns a Responder instance', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T111',
				team_domain: 'test111',
				channel_id: 'C111',
				channel_name: 'general',
				user_id: 'U111',
				user_name: 'user111',
				command: '/test',
				text: 'args',
				api_app_id: 'A111',
				response_url: 'https://hooks.slack.com/commands/T111/B111/xyz',
				trigger_id: 'trigger-111',
			}

			const cmd = new SlashCommand(app, payload)
			const responder = cmd.respond
			expect(responder).toBeDefined()
			expect(typeof responder.message).toBe('function')
		})

		it('responder has message, edit, delete, and modal methods', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T222',
				team_domain: 'test222',
				channel_id: 'C222',
				channel_name: 'general',
				user_id: 'U222',
				user_name: 'user222',
				command: '/test',
				text: 'args',
				api_app_id: 'A222',
				response_url: 'https://hooks.slack.com/commands/T222/B222/xyz',
				trigger_id: 'trigger-222',
			}

			const cmd = new SlashCommand(app, payload)
			const responder = cmd.respond
			expect(typeof responder.message).toBe('function')
			expect(typeof responder.edit).toBe('function')
			expect(typeof responder.delete).toBe('function')
			expect(typeof responder.modal).toBe('function')
		})
	})

	describe('user property', () => {
		it('returns UserRef instance', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T333',
				team_domain: 'test333',
				channel_id: 'C333',
				channel_name: 'general',
				user_id: 'U333',
				user_name: 'user333',
				command: '/test',
				text: 'args',
				api_app_id: 'A333',
				response_url: 'https://hooks.slack.com/commands/T333/B333/xyz',
				trigger_id: 'trigger-333',
			}

			const cmd = new SlashCommand(app, payload)
			const user = cmd.user
			expect(user).toBeInstanceOf(UserRef)
		})

		it('user ref has correct user ID', () => {
			const userId = 'U444'
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T444',
				team_domain: 'test444',
				channel_id: 'C444',
				channel_name: 'general',
				user_id: userId,
				user_name: 'user444',
				command: '/test',
				text: 'args',
				api_app_id: 'A444',
				response_url: 'https://hooks.slack.com/commands/T444/B444/xyz',
				trigger_id: 'trigger-444',
			}

			const cmd = new SlashCommand(app, payload)
			expect(cmd.user.id).toBe(userId)
		})

		it('user ref implements PromiseLike', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T555',
				team_domain: 'test555',
				channel_id: 'C555',
				channel_name: 'general',
				user_id: 'U555',
				user_name: 'user555',
				command: '/test',
				text: 'args',
				api_app_id: 'A555',
				response_url: 'https://hooks.slack.com/commands/T555/B555/xyz',
				trigger_id: 'trigger-555',
			}

			const cmd = new SlashCommand(app, payload)
			const user = cmd.user
			expect(typeof user.then).toBe('function')
		})

		it('user ref has send method', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T666',
				team_domain: 'test666',
				channel_id: 'C666',
				channel_name: 'general',
				user_id: 'U666',
				user_name: 'user666',
				command: '/test',
				text: 'args',
				api_app_id: 'A666',
				response_url: 'https://hooks.slack.com/commands/T666/B666/xyz',
				trigger_id: 'trigger-666',
			}

			const cmd = new SlashCommand(app, payload)
			const user = cmd.user
			expect(typeof user.send).toBe('function')
		})
	})

	describe('channel property', () => {
		it('returns ChannelRef instance', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T777',
				team_domain: 'test777',
				channel_id: 'C777',
				channel_name: 'general',
				user_id: 'U777',
				user_name: 'user777',
				command: '/test',
				text: 'args',
				api_app_id: 'A777',
				response_url: 'https://hooks.slack.com/commands/T777/B777/xyz',
				trigger_id: 'trigger-777',
			}

			const cmd = new SlashCommand(app, payload)
			const channel = cmd.channel
			expect(channel).toBeInstanceOf(ChannelRef)
		})

		it('channel ref has correct channel ID', () => {
			const channelId = 'C888'
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T888',
				team_domain: 'test888',
				channel_id: channelId,
				channel_name: 'mychannel',
				user_id: 'U888',
				user_name: 'user888',
				command: '/test',
				text: 'args',
				api_app_id: 'A888',
				response_url: 'https://hooks.slack.com/commands/T888/B888/xyz',
				trigger_id: 'trigger-888',
			}

			const cmd = new SlashCommand(app, payload)
			expect(cmd.channel.id).toBe(channelId)
		})

		it('channel ref implements PromiseLike', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'T999',
				team_domain: 'test999',
				channel_id: 'C999',
				channel_name: 'general',
				user_id: 'U999',
				user_name: 'user999',
				command: '/test',
				text: 'args',
				api_app_id: 'A999',
				response_url: 'https://hooks.slack.com/commands/T999/B999/xyz',
				trigger_id: 'trigger-999',
			}

			const cmd = new SlashCommand(app, payload)
			const channel = cmd.channel
			expect(typeof channel.then).toBe('function')
		})

		it('channel ref has send method', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'TA00',
				team_domain: 'testa00',
				channel_id: 'CA00',
				channel_name: 'general',
				user_id: 'UA00',
				user_name: 'usera00',
				command: '/test',
				text: 'args',
				api_app_id: 'AA00',
				response_url: 'https://hooks.slack.com/commands/TA00/BA00/xyz',
				trigger_id: 'trigger-a00',
			}

			const cmd = new SlashCommand(app, payload)
			const channel = cmd.channel
			expect(typeof channel.send).toBe('function')
		})
	})

	describe('proxy access to payload data', () => {
		it('provides access to SlashCommandPayload properties via proxy', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'TB00',
				team_domain: 'testb00',
				channel_id: 'CB00',
				channel_name: 'testchannel',
				user_id: 'UB00',
				user_name: 'testuser',
				command: '/mycommand',
				text: 'arg1 arg2 arg3',
				api_app_id: 'AB00',
				response_url: 'https://hooks.slack.com/commands/TB00/BB00/xyz',
				trigger_id: 'trigger-b00',
			}

			const cmd = new SlashCommand(app, payload) as any
			expect(cmd.command).toBe('/mycommand')
			expect(cmd.text).toBe('arg1 arg2 arg3')
			expect(cmd.channel_name).toBe('testchannel')
			expect(cmd.user_name).toBe('testuser')
		})

		it('accesses team_id and team_domain', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'TC00',
				team_domain: 'testc00',
				channel_id: 'CC00',
				channel_name: 'general',
				user_id: 'UC00',
				user_name: 'user',
				command: '/cmd',
				text: 'text',
				api_app_id: 'AC00',
				response_url: 'https://example.com/response',
				trigger_id: 'trigger-c00',
			}

			const cmd = new SlashCommand(app, payload) as any
			expect(cmd.team_id).toBe('TC00')
			expect(cmd.team_domain).toBe('testc00')
		})
	})

	describe('SlashCommandInstance type', () => {
		it('combines SlashCommand methods and SlashCommandPayload properties', () => {
			const payload: SlashCommandPayload = {
				token: 'test-token',
				team_id: 'TD00',
				team_domain: 'testd00',
				channel_id: 'CD00',
				channel_name: 'general',
				user_id: 'UD00',
				user_name: 'user',
				command: '/cmd',
				text: 'text',
				api_app_id: 'AD00',
				response_url: 'https://example.com/response',
				trigger_id: 'trigger-d00',
			}

			const cmd = new SlashCommand(app, payload)

			// Should have SlashCommand methods
			expect(typeof cmd.user).toBe('object')
			expect(typeof cmd.channel).toBe('object')
			expect(typeof cmd.respond).toBe('object')

			// Should have payload properties (via proxy)
			const cmdAsAny = cmd as any
			expect(cmdAsAny.command).toBe('/cmd')
			expect(cmdAsAny.text).toBe('text')
		})
	})
})

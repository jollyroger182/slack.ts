import { beforeEach, describe, expect, it } from 'bun:test'
import { App } from '../../src'
import { UserRef, User } from '../../src/resources/user'

let app: App

beforeEach(() => {
	app = new App({ token: process.env.SLACK_BOT_TOKEN })
})

describe('UserRef', () => {
	describe('constructor', () => {
		it('creates UserRef with user ID', () => {
			const userRef = new UserRef(app, 'U123456')
			expect(userRef.id).toBe('U123456')
		})

		it('stores user ID correctly', () => {
			const ref1 = new UserRef(app, 'U111')
			const ref2 = new UserRef(app, 'U222')
			expect(ref1.id).toBe('U111')
			expect(ref2.id).toBe('U222')
		})
	})

	describe('id property', () => {
		it('is immutable and returns correct value', () => {
			const ref = new UserRef(app, 'U12345')
			expect(ref.id).toBe('U12345')
			expect(ref.id).toBe('U12345') // called again
		})

		it('persists across multiple accesses', () => {
			const ref = new UserRef(app, 'UXYZ')
			const id1 = ref.id
			const id2 = ref.id
			expect(id1).toBe(id2)
		})
	})

	describe('send() method', () => {
		it('has send method', () => {
			const userRef = new UserRef(app, 'U987')
			expect(typeof userRef.send).toBe('function')
		})
	})
})

describe('User', () => {
	describe('constructor', () => {
		it('creates User with ID', () => {
			const userData = {
				id: 'U123456',
				team_id: 'T123',
				name: 'testuser',
				deleted: false,
				profile: {
					real_name: 'Test User',
					display_name: 'testuser',
					status_text: '',
					status_emoji: '',
					avatar_hash: 'hash',
					first_name: 'Test',
					last_name: 'User',
					email: 'test@example.com',
					image_24: '',
					image_32: '',
					image_48: '',
					image_72: '',
					image_192: '',
					image_512: '',
					image_1024: '',
				},
			}
			const user = new User(app, 'U123456', userData as any)
			expect(user.id).toBe('U123456')
		})
	})

	describe('id property', () => {
		it('returns the user ID', () => {
			const userData = {
				id: 'U456789',
				team_id: 'T456',
				name: 'user2',
				deleted: false,
				profile: { real_name: 'User Two', display_name: 'user2' },
			}
			const user = new User(app, 'U456789', userData as any)
			expect(user.id).toBe('U456789')
		})
	})

	describe('UserInstance type', () => {
		it('combines User methods and UserData properties', () => {
			const userData = {
				id: 'U999',
				team_id: 'T999',
				name: 'testuser999',
				deleted: false,
				profile: { real_name: 'Test', display_name: 'test' },
			}
			const user = new User(app, 'U999', userData as any) as any

			// Should have User methods
			expect(typeof user.id).toBe('string')
			expect(user.id).toBe('U999')
			expect(typeof user.send).toBe('function')
		})
	})
})

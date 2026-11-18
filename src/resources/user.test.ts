import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
	type Mock,
	spyOn,
} from 'bun:test'

import { APIError, Client } from '../client'
import { NotFoundError } from '../errors'
import { Conversation } from './conversation'
import { User, type UserRef } from './user'

describe('UserRef', () => {
	let client: Client
	let user: UserRef
	let requestSpy: Mock<Client['request']>

	beforeEach(() => {
		client = new Client('xoxb-test')
		user = client.user('U123')
		requestSpy = spyOn(client, 'request')
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	it('opens an IM with the user', async () => {
		requestSpy.mockResolvedValueOnce({ ok: true, channel: { id: 'C123' } })

		const im = await user.openIM()

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('conversations.open', { users: 'U123', return_im: true })
		expect(im).toBeInstanceOf(Conversation)
		expect(im.id).toBe('C123')
	})

	it('fetches the user', async () => {
		requestSpy.mockResolvedValueOnce({
			ok: true,
			user: { id: 'U123', real_name: 'John Doe' },
		})

		const full = await user.fetch()

		expect(requestSpy).toBeCalledTimes(1)
		expect(requestSpy).toBeCalledWith('users.info', { user: 'U123' })
		expect(full).toBeInstanceOf(User)
		expect(full.data).toEqual({ id: 'U123', real_name: 'John Doe' } as never)
	})

	it('throws NotFoundError when message is not found', async () => {
		requestSpy.mockRejectedValueOnce(
			new APIError(`Error for users.info: user_not_found`, 'users.info', 'user_not_found', {
				ok: false,
				error: 'user_not_found',
			}),
		)

		expect(user.fetch()).rejects.toThrow(NotFoundError)
	})
})

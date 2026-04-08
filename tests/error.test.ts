import { describe, expect, it } from 'bun:test'
import { SlackError, SlackTimeoutError, SlackWebAPIError, SlackWebAPIPlatformError } from '../src'

describe('Error Classes', () => {
	describe('SlackError', () => {
		it('extends Error', () => {
			const error = new SlackError('test error')
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toBe('test error')
		})
	})

	describe('SlackTimeoutError', () => {
		it('extends Error', () => {
			const error = new SlackTimeoutError('operation timed out')
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toBe('operation timed out')
		})

		it('can be thrown and caught', () => {
			expect(() => {
				throw new SlackTimeoutError('timeout')
			}).toThrow(SlackTimeoutError)
		})
	})

	describe('SlackWebAPIError', () => {
		it('extends SlackError', () => {
			const error = new SlackWebAPIError('http://example.com', { ok: false })
			expect(error).toBeInstanceOf(SlackError)
			expect(error).toBeInstanceOf(Error)
		})

		it('stores url', () => {
			const url = 'http://example.com/api/test'
			const error = new SlackWebAPIError(url, { error: 'test' })
			expect(error.url).toBe(url)
		})

		it('stores data', () => {
			const data = { error: 'test_error', error_description: 'Test error' }
			const error = new SlackWebAPIError('http://example.com', data)
			expect(error.data).toEqual(data)
		})

		it('has default message', () => {
			const url = 'http://example.com/api/test'
			const error = new SlackWebAPIError(url)
			expect(error.message).toContain('Fetch')
			expect(error.message).toContain(url)
		})

		it('can be thrown and caught', () => {
			expect(() => {
				throw new SlackWebAPIError('http://example.com', { error: 'test' })
			}).toThrow(SlackWebAPIError)
		})

		it('can be caught as SlackError', () => {
			const checkError = (e: unknown) => {
				if (e instanceof SlackError) {
					return true
				}
				return false
			}

			const error = new SlackWebAPIError('http://example.com', {})
			expect(checkError(error)).toBeTrue()
		})
	})

	describe('SlackWebAPIPlatformError', () => {
		it('extends SlackWebAPIError', () => {
			const error = new SlackWebAPIPlatformError(
				'http://example.com',
				{ error: 'invalid_auth' },
				'invalid_auth',
			)
			expect(error).toBeInstanceOf(SlackWebAPIError)
			expect(error).toBeInstanceOf(SlackError)
			expect(error).toBeInstanceOf(Error)
		})

		it('stores error code', () => {
			const errorCode = 'invalid_auth'
			const error = new SlackWebAPIPlatformError('http://example.com', {}, errorCode)
			expect(error.error).toBe(errorCode)
		})

		it('stores url', () => {
			const url = 'http://example.com/api/auth.test'
			const error = new SlackWebAPIPlatformError(url, {}, 'invalid_auth')
			expect(error.url).toBe(url)
		})

		it('stores data', () => {
			const data = { ok: false, error: 'invalid_auth' }
			const error = new SlackWebAPIPlatformError('http://example.com', data, 'invalid_auth')
			expect(error.data).toEqual(data)
		})

		it('can be thrown with different error codes', () => {
			const errors = ['invalid_auth', 'token_expired', 'channel_not_found', 'user_not_found']

			for (const code of errors) {
				try {
					throw new SlackWebAPIPlatformError('http://example.com', {}, code)
				} catch (e) {
					expect((e as SlackWebAPIPlatformError).error).toBe(code)
				}
			}
		})

		it('can be caught as SlackWebAPIError', () => {
			const checkError = (e: unknown) => {
				if (e instanceof SlackWebAPIError) {
					return true
				}
				return false
			}

			const error = new SlackWebAPIPlatformError('http://example.com', {}, 'test_error')
			expect(checkError(error)).toBeTrue()
		})

		it('has access to all parent properties', () => {
			const url = 'http://example.com/api/test'
			const data = { ok: false, error: 'test_error' }
			const errorCode = 'test_error'

			const error = new SlackWebAPIPlatformError(url, data, errorCode)

			expect(error.url).toBe(url)
			expect(error.data).toEqual(data)
			expect(error.error).toBe(errorCode)
			expect(error.message).toBeDefined()
		})
	})

	describe('error hierarchy', () => {
		it('SlackTimeoutError is separate from API errors', () => {
			const timeoutError = new SlackTimeoutError('timeout')
			const apiError = new SlackWebAPIError('http://example.com', {})

			expect(timeoutError).not.toBeInstanceOf(SlackWebAPIError)
			expect(apiError).not.toBeInstanceOf(SlackTimeoutError)
		})

		it('all custom errors extend Error', () => {
			const errors = [
				new SlackError('test'),
				new SlackTimeoutError('timeout'),
				new SlackWebAPIError('http://example.com', {}),
				new SlackWebAPIPlatformError('http://example.com', {}, 'error'),
			]

			for (const error of errors) {
				expect(error).toBeInstanceOf(Error)
			}
		})
	})
})

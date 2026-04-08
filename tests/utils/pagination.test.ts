import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { App } from '../../src'

describe('Pagination', () => {
	let app: App

	beforeEach(() => {
		app = new App({ token: process.env.SLACK_BOT_TOKEN })
	})

	describe('channels generator', () => {
		it('generator function exists', () => {
			expect(typeof app.channels).toBe('function')
		})

		it('returns async generator', () => {
			const result = app.channels('public_channel')
			expect(result[Symbol.asyncIterator]).toBeDefined()
		})

		it('can iterate through channels', async () => {
			const channels: any[] = []
			for await (const channel of app.channels('public_channel')) {
				channels.push(channel)
				if (channels.length >= 1) break
			}
			expect(channels.length).toBeGreaterThan(0)
		})

		it('channel objects have id property', async () => {
			for await (const channel of app.channels('public_channel')) {
				expect(channel).toHaveProperty('id')
				break
			}
		})

		it('can request multiple channel types', async () => {
			const channels: any[] = []
			for await (const channel of app.channels('public_channel', 'private_channel')) {
				channels.push(channel)
				if (channels.length >= 1) break
			}
			expect(channels.length).toBeGreaterThan(0)
		})

		it('returns channels with valid structure', async () => {
			for await (const channel of app.channels('public_channel')) {
				expect(typeof channel.id).toBe('string')
				expect(channel.id.length).toBeGreaterThan(0)
				break
			}
		})
	})
})

import { beforeEach, describe, expect, it } from 'bun:test'

import { Client } from '../../src'

const { XOXB_TOKEN } = process.env
const RUN_INTEGRATION_TESTS = !!process.env.RUN_INTEGRATION_TESTS && !!XOXB_TOKEN

describe.if(RUN_INTEGRATION_TESTS)('Client integration tests', () => {
	let client: Client

	beforeEach(() => {
		client = new Client(XOXB_TOKEN!)
	})

	it('makes api requests', async () => {
		const resp = await client.request('auth.test')

		expect(resp).toBeObject()
		expect(resp.ok).toBeTrue()
		expect(resp.user_id).toBeString()
	})
})

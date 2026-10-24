import type { Receiver } from './receivers'
import { ensureUrlEncoded } from './utils'

export interface ClientConfig<R extends Receiver = any> {
	/**
	 * A receiver that emits events sent by Slack. Common receivers include the HTTP server receiver
	 * and the socket mode receiver.
	 */
	receiver?: R

	/**
	 * A team ID. Required when using an `xoxd-` session token that is signed in to multiple Slack
	 * workspaces.
	 */
	team?: string
}

/** A client for making Slack web API requests. */
export class Client<R extends Receiver = any> {
	private _token: string | { token: string; cookie: string }
	private team?: string

	/**
	 * Creates a new Slack client.
	 *
	 * @param token A Slack token. Can be a string that starts with `xoxb-` (bot token), `xoxp-` (user
	 *   OAuth token), or `xoxd-` (session cookie); or a object like `{ token: 'xoxc-...', cookie:
	 *   'xoxd-...' }`.
	 * @param config Optional configuration for the client.
	 */
	constructor(token: string | { token: string; cookie: string }, config?: ClientConfig<R>) {
		this._token = token

		this.team = config?.team

		if (config?.receiver) {
			// config.receiver.on(...)
		}
	}

	tokenPromise?: Promise<{ token: string; cookie?: string }>

	get token(): Promise<{ token: string; cookie?: string }> {
		if (this.tokenPromise) return this.tokenPromise

		if (typeof this._token === 'object') {
			if (!this._token.cookie.startsWith('xoxd-') || !this._token.token.startsWith('xoxc-')) {
				throw new Error(
					"Object tokens must be of the shape { token: 'xoxc-...', cookie: 'xoxd-...' }",
				)
			}
			return (this.tokenPromise = Promise.resolve({
				token: this._token.token,
				cookie: `d=${ensureUrlEncoded(this._token.cookie)}`,
			}))
		}

		if (this._token.startsWith('xoxb-') || this._token.startsWith('xoxp-')) {
			return (this.tokenPromise = Promise.resolve({ token: this._token }))
		}

		if (!this._token.startsWith('xoxd-')) {
			throw new Error('String tokens can only start with xoxb-, xoxp- or xoxd-')
		}

		const getXoxcToken = async (xoxd: string) => {
			const encodedXoxd = ensureUrlEncoded(xoxd)

			const resp = await fetch(`https://app.slack.com/auth?app=client&iframe=1`, {
				headers: { Cookie: `d=${encodedXoxd}` },
			})
			if (!resp.ok) {
				this.tokenPromise = undefined
				throw new Error(`Failed to fetch xoxc token: Slack returned status code ${resp.status}`)
			}

			const body = await resp.text()
			const match = body.match(/sessionStorage\.incomingConfig = JSON\.stringify\((.+)\)/)
			if (!match) {
				throw new Error('Failed to fetch xoxc token: Slack returned unknown auth page format')
			}

			const payload = JSON.parse(match[1]!) as any
			if (
				!payload ||
				typeof payload !== 'object' ||
				!payload.teams ||
				typeof payload.teams !== 'object'
			) {
				throw new Error('Failed to fetch xoxc token: Slack returned unknown auth payload format')
			}

			const teams = Object.entries(payload.teams as Record<string, any>).filter(
				([, team]) =>
					team &&
					typeof team === 'object' &&
					!team.enterprise_api_token &&
					typeof team.token === 'string',
			)
			if (teams.length > 1 && !this.team) {
				throw new Error(
					'Failed to fetch xoxc token: The provided token is signed in to multiple Slack workspaces; the `team` option is required',
				)
			}
			if (this.team && !teams.find(([id]) => id === this.team)) {
				throw new Error(`Failed to fetch xoxc token: The specified team ID is not found`)
			}

			const team = (this.team ? teams.find(([id]) => id === this.team) : teams[0])![1]
			return { cookie: `d=${encodedXoxd}`, token: team.token }
		}

		return (this.tokenPromise = getXoxcToken(this._token))
	}
}

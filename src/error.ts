export class SlackError extends Error {}

export class SlackWebAPIError extends SlackError {
	constructor(
		public url: string,
		public data?: unknown,
	) {
		super(`Fetch ${url} failed`)
	}
}

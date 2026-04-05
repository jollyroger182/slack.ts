export class SlackError extends Error {}

export class SlackTimeoutError extends Error {}

export class SlackWebAPIError extends SlackError {
	constructor(
		public url: string,
		public data?: unknown,
	) {
		super(`Fetch ${url} failed`)
	}
}

export class SlackWebAPIPlatformError extends SlackWebAPIError {
	constructor(
		url: string,
		data: unknown,
		public error: string,
	) {
		super(url, data)
	}
}

/** Base error class for Slack-related errors. */
export class SlackError extends Error {}

/** Error thrown when a Slack operation times out. */
export class SlackTimeoutError extends Error {}

/**
 * Error thrown when a Slack Web API request fails.
 *
 * Contains the request URL and the response data.
 */
export class SlackWebAPIError extends SlackError {
	constructor(
		public url: string,
		public data?: unknown,
	) {
		super(`Fetch ${url} failed: ${JSON.stringify(data)}`)
	}
}

/**
 * Error thrown when a Slack Web API returns an error.
 *
 * Contains the request URL, response data, and the error code.
 */
export class SlackWebAPIPlatformError extends SlackWebAPIError {
	constructor(
		url: string,
		data: unknown,
		public error: string,
	) {
		super(url, data)
	}
}

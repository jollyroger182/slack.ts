import { createHmac, timingSafeEqual } from 'crypto'
import type { AllEvents, EventWrapper } from '../api/events'
import type { BlockActions } from '../api/interactive/block_actions'
import type { ViewSubmission } from '../api/interactive/view_submission'
import type { SlashCommandPayload } from '../api/slash'

export type SlackHttpPayload =
	| { type: 'url_verification'; challenge: string }
	| { type: 'event'; payload: EventWrapper<AllEvents> }
	| { type: 'block_actions'; payload: BlockActions }
	| { type: 'view_submission'; payload: ViewSubmission }
	| { type: 'slash_command'; payload: SlashCommandPayload }

/**
 * Parses and validates a Slack HTTP request.
 *
 * @param request The incoming request
 * @param signingSecret The Slack app signing secret
 * @param timestampWindow Timestamp validation window in seconds (default: 300)
 * @returns Parsed Slack payload
 * @throws Error if signature is invalid or payload format is unrecognized
 */
export async function parseSlackRequest(
	request: Request,
	signingSecret: string,
	timestampWindow: number = 300,
): Promise<SlackHttpPayload> {
	const timestamp = request.headers.get('x-slack-request-timestamp')
	const signature = request.headers.get('x-slack-signature')

	if (!timestamp || !signature) {
		throw new Error('Missing timestamp or signature headers')
	}

	const ts = Number(timestamp)
	const now = Math.floor(Date.now() / 1000)
	if (isNaN(ts) || Math.abs(now - ts) > timestampWindow) {
		throw new Error('Timestamp outside acceptable window')
	}

	const bodyText = await request.text()

	const baseString = `v0:${timestamp}:${bodyText}`
	const expectedSignature =
		'v0=' + createHmac('sha256', signingSecret).update(baseString).digest('hex')

	const signatureBuffer = Buffer.from(signature)
	const expectedBuffer = Buffer.from(expectedSignature)

	if (
		signatureBuffer.length !== expectedBuffer.length ||
		!timingSafeEqual(signatureBuffer, expectedBuffer)
	) {
		throw new Error('Invalid signature')
	}

	const contentType = request.headers.get('content-type') || ''
	let body: unknown

	if (contentType.includes('application/json')) {
		try {
			body = JSON.parse(bodyText)
		} catch (error) {
			throw new Error('Invalid JSON payload')
		}
	} else if (contentType.includes('application/x-www-form-urlencoded')) {
		const params = new URLSearchParams(bodyText)
		const formBody = parseFormBody(params)

		if (params.has('payload')) {
			try {
				body = JSON.parse(params.get('payload')!)
			} catch (error) {
				throw new Error('Invalid JSON in form payload')
			}
		} else {
			body = formBody
		}
	} else {
		throw new Error(`Unsupported content type: ${contentType}`)
	}

	return detectSlackPayload(body)
}

function detectSlackPayload(body: unknown): SlackHttpPayload {
	if (typeof body !== 'object' || body === null) {
		throw new Error('Invalid payload: not an object')
	}

	const obj = body as Record<string, unknown>

	if (obj.type === 'url_verification' && typeof obj.challenge === 'string') {
		return {
			type: 'url_verification',
			challenge: obj.challenge,
		}
	}

	if (obj.type === 'event_callback' && obj.event) {
		return {
			type: 'event',
			payload: body as EventWrapper<AllEvents>,
		}
	}

	if (obj.type === 'block_actions' && Array.isArray(obj.actions)) {
		return {
			type: 'block_actions',
			payload: body as BlockActions,
		}
	}

	if (obj.type === 'view_submission' && obj.view) {
		return {
			type: 'view_submission',
			payload: body as ViewSubmission,
		}
	}

	if (typeof obj.command === 'string' && typeof obj.text === 'string' && obj.trigger_id) {
		return {
			type: 'slash_command',
			payload: body as SlashCommandPayload,
		}
	}

	throw new Error('Unrecognized payload type')
}

/** Parses URLSearchParams from form data into a plain object. */
function parseFormBody(params: URLSearchParams): Record<string, string> {
	const result: Record<string, string> = {}
	for (const [key, value] of params.entries()) {
		result[key] = value
	}
	return result
}

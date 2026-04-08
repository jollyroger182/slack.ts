import type { SlackAPIParams, SlackAPIResponse, SlackPaginatingAPIMethod } from '../api'
import type { CursorPaginationResponse } from '../api/types/api'
import type { App } from '../client'
import type { DistributiveOmit } from './typing'

export async function* paginate<Method extends SlackPaginatingAPIMethod, T>(
	client: App,
	method: Method,
	params: DistributiveOmit<SlackAPIParams<Method>, 'limit' | 'cursor'> & {
		limit?: number
		batch?: number
	},
	converter: (
		response: Extract<SlackAPIResponse<Method>, { ok: true }>,
	) => Iterable<T> | AsyncIterable<T>,
) {
	let remaining = params.limit ?? Infinity
	let cursor: string | undefined
	if (remaining <= 0) return
	while (true) {
		const { batch: _, ...payload } = params
		const body = { ...payload, cursor, limit: params.batch ?? undefined }
		const batch = await client.request(method, body)
		for await (const item of converter(batch)) {
			yield item
			if (--remaining <= 0) return
		}
		cursor = (batch as CursorPaginationResponse).response_metadata?.next_cursor
		if (!batch.has_more || !cursor) return
	}
}

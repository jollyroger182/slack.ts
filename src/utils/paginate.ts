import type { SlackAPIParams, SlackAPIResponse, SlackPaginatingAPIMethod } from '../api'
import type { App } from '../client'
import type { DistributiveOmit } from './typing'

export async function* paginate<Method extends SlackPaginatingAPIMethod, T>(
	client: App,
	method: Method,
	params: DistributiveOmit<SlackAPIParams<Method>, 'limit' | 'cursor'> & {
		limit?: number
		batch?: number
	},
	converter: (response: SlackAPIResponse<Method> & { ok: true }) => Iterable<T> | AsyncIterable<T>,
) {
	let remaining = params.limit ?? Infinity
	let cursor: string | undefined
	if (remaining <= 0) return
	while (true) {
		const batch = await client.request(method, {
			...params,
			cursor,
			limit: params.batch ?? undefined,
			batch: undefined,
		})
		for await (const item of converter(batch)) {
			yield item
			if (--remaining <= 0) return
		}
		cursor = batch.response_metadata?.next_cursor
		if (!batch.has_more || !cursor) return
	}
}

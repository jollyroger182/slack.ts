import type {
	CursorPaginationParams,
	CursorPaginationResponse,
	TimestampPaginationParams,
} from '../types/api'
import type { Conversation } from '../types/conversation'
import type { AnyMessage } from '../types/message'

export interface ConversationsInfoParams {
	/** Conversation ID to learn more about */
	channel: string

	/**
	 * Set this to `true` to receive the locale for this conversation. Defaults to `false`
	 *
	 * @default false
	 */
	include_locale?: boolean

	/**
	 * Set to `true` to include the member count for the specified conversation. Defaults to `false`
	 *
	 * @default false
	 */
	include_num_members?: boolean
}

export interface ConversationsInfoResponse {
	channel: Conversation
}

export interface ConversationsRepliesParams
	extends CursorPaginationParams, TimestampPaginationParams {
	/** Conversation ID to fetch thread from. */
	channel: string

	/**
	 * Unique identifier of either a thread’s parent message or a message in the thread. `ts` must be
	 * the timestamp of an existing message with 0 or more replies. If there are no replies then just
	 * the single message referenced by `ts` will return - it is just an ordinary, unthreaded
	 * message.
	 */
	ts: string

	/** Return all metadata associated with this message. */
	include_all_metadata?: boolean
}

export interface ConversationsRepliesResponse extends CursorPaginationResponse {
	messages: AnyMessage[]
}

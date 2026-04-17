import type {
	CursorPaginationParams,
	CursorPaginationResponse,
	TimestampPaginationParams,
} from '../types/api'
import type { Conversation, IM } from '../types/conversation'
import type { AnyMessage } from '../types/message'

export interface ConversationsHistoryParams
	extends CursorPaginationParams, TimestampPaginationParams {
	/** Conversation ID to fetch history for. */
	channel: string

	/** Return all metadata associated with this message. */
	include_all_metadata?: boolean
}

export interface ConversationsHistoryResponse extends CursorPaginationResponse {
	messages: AnyMessage[]
	pin_count: number
	channel_actions_ts?: number | null
	channel_actions_count?: number
}

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

export interface ConversationsListParams extends CursorPaginationParams {
	/**
	 * Set to `true` to exclude archived channels from the list.
	 *
	 * @default false
	 */
	exclude_archived?: boolean

	/** Encoded team id to list channels in, required if token belongs to org-wide app */
	team_id?: string

	/**
	 * Mix and match channel types by providing a comma-separated list of any combination of
	 * `public_channel`, `private_channel`, `mpim`, `im`
	 *
	 * @default `public_channel`
	 */
	types?: string
}

export interface ConversationsListResponse extends CursorPaginationResponse {
	channels: Conversation[]
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

export interface ConversationsJoinParams {
	/** ID of conversation to join */
	channel: string
}

export interface ConversationsJoinResponse {
	channel: Conversation
}

export interface ConversationsLeaveParams {
	/** Conversation to leave */
	channel: string
}

export interface ConversationsLeaveResponse {
	not_in_channel?: boolean
}

export interface ConversationsInviteParams {
	/** The ID of the public or private channel to invite user(s) to. */
	channel: string

	/** A comma separated list of user IDs. Up to 100 users may be listed. */
	users: string

	/**
	 * When set to `true` and multiple user IDs are provided, continue inviting the valid ones while
	 * disregarding invalid IDs.
	 *
	 * @default false
	 */
	force?: boolean
}

export interface ConversationsInviteResponse {
	channel: Conversation
}

export type ConversationsOpenParams = {
	return_im?: boolean
	prevent_creation?: boolean
} & ({ channel: string; users?: never } | { channel?: never; users: string })

export interface ConversationsOpenResponse {
	no_op: boolean
	already_open: boolean
	channel: { id: string } & Partial<IM>
}

// conversations.info

import type { Conversation } from '../types/conversation'

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

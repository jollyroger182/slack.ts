import type { KnownBlock } from '@slack/types'
import type { Attachment, MeMessageMessage, MessageMetadata, NormalMessage } from '../types/message'

interface MarkdownMessage {
	markdown_text: string
	blocks?: never
	text?: never
}

type TextMessage = {
	markdown_text?: never
	blocks?: KnownBlock[]
	text?: string
} & ({ blocks: KnownBlock[] } | { text: string })

export type ChatPostEphemeralParams = {
	channel: string
	user: string
	attachments?: Attachment[]
	icon_emoji?: string
	icon_url?: string
	link_names?: boolean
	parse?: 'none' | 'full' | 'client'
	thread_ts?: string
	username?: string
} & (MarkdownMessage | TextMessage)

export interface ChatPostEphemeralResponse {
	message_ts: string
}

export type ChatPostMessageParams = {
	channel: string
	attachments?: Attachment[]
	icon_emoji?: string
	icon_url?: string
	link_names?: boolean
	metadata?: MessageMetadata
	mrkdwn?: boolean
	parse?: 'none' | 'full'
	reply_broadcast?: boolean
	thread_ts?: string
	unfurl_links?: boolean
	unfurl_media?: boolean
	username?: string
} & (MarkdownMessage | TextMessage)

export interface ChatPostMessageResponse {
	channel: string
	ts: string
	message: NormalMessage
}

export type StreamChunk =
	| { type: 'markdown_text'; text: string }
	| {
			type: 'task_update'
			id: string
			title: string
			status?: 'pending' | 'in_progress' | 'complete' | 'error'
			details?: string
			output?: string
			sources?: {
				type: 'url'
				text: string
				url: string
			}[]
	  }
	| {
			type: 'plan_update'
			title: string
	  }

export type ChatAppendStreamParams = {
	/** An encoded ID that represents a channel, private group, or DM */
	channel: string

	/** The timestamp of the streaming message. */
	ts: string
} & (
	| {
			/**
			 * Accepts message text formatted in markdown. Limit this field to 12,000 characters. This
			 * text is what will be appended to the message received so far.
			 */
			markdown_text: string
			chunks?: never
	  }
	| {
			/** Array of streaming chunks that can contain either markdown text or task updates. */
			chunks: StreamChunk[]
			markdown_text?: never
	  }
)

export interface ChatAppendStreamResponse {
	channel: string
	ts: string
}

export interface ChatStartStreamParams {
	/** An encoded ID that represents a channel thread or DM. */
	channel: string

	/**
	 * Provide another message's `ts` value to reply to. Streamed messages should always be replies to
	 * a user request.
	 */
	thread_ts: string

	/** Array of streaming chunks that can contain either markdown text or task updates. */
	chunks?: StreamChunk[]

	/** Accepts message text formatted in markdown. Limit this field to 12,000 characters. */
	markdown_text?: string

	/** The encoded ID of the user to receive the streaming text. Required when streaming to channels. */
	recipient_user_id?: string

	/**
	 * The encoded ID of the team the user receiving the streaming text belongs to. Required when
	 * streaming to channels.
	 */
	recipient_team_id?: string

	/**
	 * Specifies how tasks are displayed in the message. A `timeline` displays individual tasks with
	 * text in sequential order, and `plan` displays all tasks together, with the first tasks's
	 * placement determining the placement of the rest of the tasks.
	 *
	 * @default `timeline`
	 */
	task_display_mode?: 'timeline' | 'plan'
}

export interface ChatStartStreamResponse {
	channel: string
	ts: string
}

export interface ChatStopStreamParams {
	/** An encoded ID that represents a channel, private group, or DM */
	channel: string

	/** The timestamp of the streaming message. */
	ts: string

	/** Array of streaming chunks that can contain either markdown text or task updates. */
	chunks?: StreamChunk[]

	/** Accepts message text formatted in markdown. Limit this field to 12,000 characters. */
	markdown_text?: string

	/** A list of blocks that will be rendered at the bottom of the finalized message. */
	blocks?: KnownBlock[]

	/**
	 * JSON object with event_type and event_payload fields, presented as a URL-encoded string.
	 * Metadata you post to Slack is accessible to any app or user who is a member of that workspace.
	 */
	metadata?: MessageMetadata
}

export interface ChatStopStreamResponse {
	channel: string
	ts: string
	message: NormalMessage
}

export type ChatUpdateParams<Blocks extends KnownBlock[] = KnownBlock[]> = {
	/**
	 * Channel containing the message to be updated. For direct messages, ensure that this value is a
	 * DM ID (starts with `D`) instead of a User ID (starts with either `U` or `W`).
	 */
	channel: string

	/** Timestamp of the message to be updated. */
	ts: string

	/**
	 * How this field works and whether it is required depends on other fields you use in your API
	 * call. 9 for more detail. call. [See
	 * below](https://docs.slack.dev/reference/methods/chat.update#text_usage) for more detail.
	 */
	text?: string

	/** A JSON-based array of structured blocks. */
	blocks?: Blocks

	/** A JSON-based array of structured attachments. */
	attachments?: Attachment[]

	/**
	 * Accepts message text formatted in markdown. This argument should not be used in conjunction
	 * with `blocks` or `text`. Limit this field to 12,000 characters.
	 */
	markdown_text?: string

	/** A JSON-based array of structured attachments. */
	unfurled_attachments?: Attachment[]

	/**
	 * JSON object with event_type and event_payload fields, presented as a URL-encoded string. If you
	 * don't include this field, the message's previous `metadata` will be retained. To remove
	 * previous `metadata`, include an empty object for this field. Metadata you post to Slack is
	 * accessible to any app or user who is a member of that workspace.
	 */
	metadata?: MessageMetadata

	/**
	 * Find and link channel names and usernames. Defaults to `none`. If you do not specify a value
	 * for this field, the original value set for the message will be overwritten with the default,
	 * `none`.
	 */
	link_names?: boolean

	/**
	 * Change how messages are treated. Defaults to `client`, unlike `chat.postMessage`. Accepts
	 * either `none` or `full`. If you do not specify a value for this field, the original value set
	 * for the message will be overwritten with the default, `client`.
	 */
	parse?: 'none' | 'full' | 'client'

	/**
	 * Broadcast an existing thread reply to make it visible to everyone in the channel or
	 * conversation.
	 */
	reply_broadcast?: boolean

	/** Array of new file ids that will be sent with this message. */
	file_ids?: string[]
} & (
	| (Blocks extends [KnownBlock, ...KnownBlock[]]
			? { blocks: Blocks; markdown_text?: never }
			: never)
	| { text: string; markdown_text?: never }
	| { blocks?: never; text?: never; markdown_text: string }
)

export interface ChatUpdateResponse {
	channel: string
	ts: string
	text: string
	message: NormalMessage | MeMessageMessage
}

import type { CursorPaginationParams } from '../types/api'
import type { File } from '../types/file'
import type { AnyMessage } from '../types/message'

export interface ReactionsAddParams {
	/** Channel where the message to add reaction to was posted. */
	channel: string

	/** Reaction (emoji) name */
	name: string

	/** Timestamp of the message to add reaction to. */
	timestamp: string
}

export interface ReactionsAddResponse {}

export type ReactionsRemoveParams = {
	/** Reaction (emoji) name. */
	name: string
} & (
	| {
			/** File to remove reaction from. */
			file: string
			file_comment?: never
			channel?: never
			timestamp?: never
	  }
	| {
			file?: never
			/** File comment to remove reaction from. */
			file_comment: string
			channel?: never
			timestamp?: never
	  }
	| {
			file?: never
			file_comment?: never
			/** Channel where the message to remove reaction from was posted. */
			channel: string
			/** Timestamp of the message to remove reaction from. */
			timestamp: string
	  }
)

export interface ReactionsRemoveResponse {}

export interface ReactionsListParams extends CursorPaginationParams {
	/** Show reactions made by this user. Defaults to the authed user. */
	user?: string

	/** If true always return the complete reaction list. */
	full?: boolean

	/** Encoded team id to list reactions in, required if org token is used */
	team_id?: string
}

export interface Reaction {
	count: number
	name: string
	users: string[]
}

export type ReactionItem =
	| {
			type: 'message'
			channel: string
			message: AnyMessage & { reactions: Reaction[] }
	  }
	| {
			type: 'file_comment'
			comment: unknown // TODO
			file: File
	  }
	| {
			type: 'file'
			file: File
	  }

export interface ReactionsListResponse {
	items: ReactionItem[]
}

export type ReactionsGetParams = {
	/** If true always return the complete reaction list. */
	full?: boolean
} & (
	| {
			/** File to get reactions for. */
			file: string
			file_comment?: never
			channel?: never
			timestamp?: never
	  }
	| {
			file?: never
			/** File comment to get reactions for. */
			file_comment: string
			channel?: never
			timestamp?: never
	  }
	| {
			file?: never
			file_comment?: never
			/** Channel where the message to get reactions for was posted. */
			channel: string
			/** Timestamp of the message to get reactions for. */
			timestamp: string
	  }
)

export type ReactionsGetResponse = ReactionItem

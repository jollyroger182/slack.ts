import type { DistributivePick } from '../../utils/typing'
import type { ConversationData } from '../types/conversation'
import type { FileData } from '../types/file'
import type { NormalMessageData } from '../types/message'
import type { UserData } from '../types/user'

export interface SearchParamsCommon {
	/**
	 * Search query.
	 *
	 * @example Pickleface
	 */
	query: string

	/**
	 * Pass the number of results you want per "page".
	 *
	 * @default 20
	 */
	count?: number

	/** Pass a value of `true` to enable query highlight markers. */
	highlight?: boolean

	/** @default 1 */
	page?: number

	/**
	 * Return matches sorted by either `score` or `timestamp`.
	 *
	 * @default score
	 */
	sort?: 'score' | 'timestamp'

	/**
	 * Change sort direction to ascending (`asc`) or descending (`desc`).
	 *
	 * @default desc
	 */
	sort_dir?: 'asc' | 'desc'

	/** Encoded team id to search in, required if org token is used */
	team_id?: string
}

export interface SearchResults<T> {
	matches: T[]
	pagination: {
		first: number
		last: number
		page: number
		page_count: number
		per_page: number
		total_count: number
	}
	paging: {
		count: number
		page: number
		pages: number
		total: number
	}
	total: number
}

export type MessageSearchResult = NormalMessageData & {
	iid: string
	username: string
	channel: DistributivePick<
		ConversationData,
		| 'id'
		| 'is_channel'
		| 'is_group'
		| 'is_im'
		| 'is_mpim'
		| 'is_shared'
		| 'is_org_shared'
		| 'is_ext_shared'
		| 'is_private'
		| 'is_archived'
		| 'name'
		| 'pending_shared'
		| 'is_pending_ext_shared'
	> & { teams: string[] }
}

export type UserSearchResult = Pick<
	UserData,
	'id' | 'name' | 'is_restricted' | 'is_ultra_restricted'
> & {
	enterprise_user?: { teams: string[]; enterprise_id: string }
	profile: Pick<
		UserData['profile'],
		'avatar_hash' | 'image_72' | 'first_name' | 'real_name' | 'display_name' | 'team'
	>
}

export interface SearchMessagesParams extends SearchParamsCommon {}

export interface SearchMessagesResponse {
	query: string
	messages: SearchResults<MessageSearchResult>
	users: Record<string, UserSearchResult>
	teams: Record<never, never>
	bots: Record<never, never>
}

export interface SearchAllParams extends SearchParamsCommon {}

export interface SearchAllResponse {
	query: string
	messages: SearchResults<MessageSearchResult>
	files: SearchResults<FileData>
	posts: { matches: []; total: 0 }
}

export interface SearchFilesParams extends SearchParamsCommon {}

export interface SearchFilesResponse {
	query: string
	files: SearchResults<FileData>
	channels: Record<never, never>
	groups: Record<never, never>
	ims: Record<never, never>
	users: Record<never, never>
	teams: Record<never, never>
}

import type { CursorPaginationParams, CursorPaginationResponse } from '../types/api'
import type { User, UserProfile } from '../types/user'

export interface UsersInfoParams {
	/** User to get info on */
	user: string

	/** Set this to `true` to receive the locale for this user. Defaults to `false` */
	include_locale?: boolean
}

export interface UsersInfoResponse {
	user: User
}

interface ProfileUpdate {
	display_name?: string
	email?: string
	first_name?: string
	last_name?: string
	phone?: string
	pronouns?: string
	real_name?: string
	start_date?: string
	title?: string
	fields?: Record<string, { value: string; alt?: string }>
}

export type UsersProfileSetParams = {} & (
	| {
			name: string
			value: string
			profile?: never
	  }
	| {
			name?: never
			value?: never
			profile: ProfileUpdate
	  }
)

export interface UsersProfileSetResponse {
	profile: UserProfile
}

export interface UsersListParams extends CursorPaginationParams {
	/**
	 * Set this to `true` to receive the locale for users.
	 *
	 * @default false
	 */
	include_locale?: boolean

	/** Encoded team id to list users in, required if org token is used */
	team_id?: string
}

export interface UsersListResponse extends CursorPaginationResponse {
	members: User[]
	cache_ts: number
}

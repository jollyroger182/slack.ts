import type { CursorPaginationParams, CursorPaginationResponse } from '../types/api'

export interface AuthTestParams {}

export interface AuthTestResponse {
	url: string
	team: string
	user: string
	team_id: string
	user_id: string
	bot_id?: string
	enterprise_id?: string
	is_enterprise_install?: boolean
}

export interface AuthRevokeParams {
	/**
	 * Setting this parameter to `1` triggers a testing mode where the specified token will not
	 * actually be revoked.
	 */
	test?: boolean
}

export interface AuthRevokeResponse {
	revoked: boolean
}

export interface AuthTeamsListParams extends CursorPaginationParams {
	/**
	 * Whether to return icon paths for each workspace. An icon path represents a URI pointing to the
	 * image signifying the workspace.
	 *
	 * @default false
	 */
	include_icon?: boolean
}

export interface AuthTeamsListResponse extends CursorPaginationResponse {
	teams: { name: string; id: string }[]
}

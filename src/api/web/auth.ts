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

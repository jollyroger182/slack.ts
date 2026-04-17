export interface User {
	id: string
	team_id: string
	name: string
	deleted: boolean
	color: string
	real_name: string
	tz: string
	tz_label: string
	tz_offset: number
	profile: UserProfile
	is_admin: boolean
	is_owner: boolean
	is_primary_owner: boolean
	is_restricted: boolean
	is_ultra_restricted: boolean
	is_bot: boolean
	updated: number
	is_app_user: boolean
	has_2fa?: boolean
}

export interface UserProfile {
	real_name: string
	display_name?: string
	avatar_hash?: string
	real_name_normalized: string
	display_name_normalized?: string
	image_24: string
	image_32: string
	image_48: string
	image_72: string
	image_192: string
	image_512: string
	image_original?: string
	first_name?: string
	last_name?: string
	team: string
	email?: string
	title?: string
	pronouns?: string
	phone?: string
	skype?: string
	status_text?: string
	status_text_canonical?: string
	status_emoji?: string
	status_emoji_display_info?: { emoji_name: string; display_url: string }[]
	status_expiration?: number
	huddle_state?: string
	huddle_state_expiration_ts?: number
	start_date?: string
	ooo_message?: string
	guest_invited_by?: string
}

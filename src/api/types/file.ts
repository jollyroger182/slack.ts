export interface File {
	id: string
	created: number
	timestamp: number
	name: string
	title: string
	mimetype: string
	filetype: string
	pretty_type: string
	user: string
	user_team: string
	editable: boolean
	size: number
	mode: 'hosted' | 'external' | 'snippet' | 'post'
	is_external: boolean
	external_type: string
	is_public: boolean
	public_url_shared: boolean
	display_as_bot: boolean
	username: string
	url_private: string
	url_private_download: string
	media_display_type: string
	permalink: string
	permalink_public: string
	comments_count: number
	is_starred: boolean
	shares: { public: Record<string, FilePublicShare[]> }
	channels: string[]
	groups: string[]
	ims: string[]
	has_rich_preview: boolean
	has_more_shares: boolean
	file_access: 'visible' | 'check_file_info'
}

interface FilePublicShare {
	reply_users: string[]
	reply_users_count: number
	reply_count: number
	ts: string
	thread_ts?: string
	latest_reply?: string
	channel_name: string
	team_id: string
	share_user_id: string
	source: string
	is_silent_share: boolean
}

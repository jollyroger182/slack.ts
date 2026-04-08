interface ConversationCommon {
	id: string
	created: number // in seconds
	is_org_shared?: boolean
	is_im?: boolean // true for im
	context_team_id: string
	updated: number // in milliseconds
	is_channel?: boolean // true for channel, group, mpim
	is_group?: boolean // false, even for private channels (aka groups)
	is_mpim?: boolean // true for mpim
	is_private?: boolean // true for group, mpim
	is_archived: boolean
	is_general?: boolean // true for the general channel
	is_shared?: boolean // shared with workspace in same org?
	is_ext_shared?: boolean // shared with workspace in external org?
	is_pending_ext_shared?: boolean
	pending_shared?: string[]
	shared_team_ids?: string[]
	internal_team_ids?: string[]
	pending_connected_team_ids?: string[]
	is_starred?: boolean // for users only
	last_read?: string
	properties?: unknown // TODO: type
	is_open?: boolean // TODO: what is this? non-im only

	// following fields are non-im only
	creator?: string
	name?: string
	name_normalized?: string
	purpose?: Purpose
	topic?: Purpose

	connected_limited_team_ids?: string[]
	connected_team_ids?: string[]
	conversation_host_id?: string
	is_global_shared?: boolean // shared enterprise-wide?
	is_non_threadable?: boolean
	is_org_default?: boolean
	is_org_mandatory?: boolean
	is_read_only?: boolean
	is_thread_only?: boolean

	locale?: string
	num_members?: number
}

interface NonIMCommon extends ConversationCommon {
	creator: string
	name: string
	name_normalized: string
	purpose: Purpose
	topic: Purpose
	unlinked?: number // ?
	parent_conversation?: unknown | null // TODO: what is this?
	is_member?: boolean
	is_moved?: number
}

export interface PublicChannel extends NonIMCommon {
	is_channel: true
	is_private: false
	previous_names?: string[]
}

export interface PrivateChannel extends NonIMCommon {
	is_channel: true
	is_private: true
	is_mpim: false
}

export interface MPIM extends NonIMCommon {
	is_channel: true
	is_private: true
	is_mpim: true
}

export interface IM extends ConversationCommon {
	is_im: true
	user: string
	priority: number
	unread_count?: number
	unread_count_display?: number
	latest?: unknown // TODO: message type
}

export type Conversation = PublicChannel | PrivateChannel | MPIM | IM

interface Purpose {
	value: string
	creator: string // empty string if never set
	last_set: number // 0 if never set
}

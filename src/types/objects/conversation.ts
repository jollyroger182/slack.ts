import type { DistributiveMerge } from '../../utils/types'
import type { MessageEvent } from '../events'

type ConversationTabBase =
	| { type: 'bookmarks' | 'workflows' | 'files' | 'channel_canvas' | 'threads' }
	| {
			type: 'canvas' | 'list'
			id: string
			data: {
				file_id: string
				shared_ts: string
				lists_channel_tab_default_refine_view_id?: string
				mute_edit_updates?: boolean
			}
	  }
	| {
			type: 'folder'
			data: { folder_bookmark_id: string }
	  }
	| {
			type:
				| 'agent'
				| 'agent_view'
				| 'agent_sessions'
				| 'code'
				| 'surface'
				| 'ai_interactive_widget'
				| 'external_files'
				| 'native_file'
				| 'record_overview'
				| 'record_summary'
				| 'record_related_list'
				| 'salesforce_list_view'
			data?: unknown
	  }

export type ConversationTab = DistributiveMerge<
	ConversationTabBase,
	{ id?: string; label?: string; is_disabled?: boolean }
>

export interface ConversationProperties extends Record<string, unknown> {
	at_channel_restricted?: boolean
	at_here_restricted?: boolean
	/** Whether a channel is inactive. It can be hidden from the sidebar when configured by a client. */
	is_dormant?: boolean
	meeting_notes?: { file_id?: string; is_locked?: boolean }
	posting_restricted_to?: { type: string[]; user?: string[] }
	tabs?: DistributiveMerge<
		ConversationTabBase,
		{ id: string; label: string; is_disabled?: boolean }
	>[]
	tabz?: ConversationTab[]
	threads_restricted_to?: { type: string[]; user?: string[] }
	who_can_manage_tabs?: 'everyone' | 'managers' | (string & {})
}

export interface ConversationPermissions extends Record<string, unknown> {
	at_channel: { enabled: boolean }
	at_here: { enabled: boolean }
	post: { role: string[]; user: string[] }
	thread: { role: string[] }
}

interface BaseConversation {
	id: string
	created: number
	is_im: boolean
	is_mpim?: boolean
	is_private?: boolean
	is_channel?: boolean
	is_group?: boolean

	is_org_shared: boolean
	is_archived: boolean
	updated: number

	// ignored by client
	is_shared?: boolean

	/** The workspace ID that owns this channel in Enterprise Grid. */
	context_team_id?: string

	// user/client state
	is_starred?: boolean
	is_member?: boolean
	is_open?: boolean
	last_read?: string
	latest?: MessageEvent | null
	priority?: number
	unread_count?: number
	unread_count_display?: number
}

export interface IMChannel extends BaseConversation {
	is_im: true
	is_mpim?: never
	is_private?: never
	is_channel?: never
	is_group?: never

	user: string
}

interface BaseNonIMConversation extends BaseConversation {
	is_im: false

	/** Whether the conversation is an MPIM. */
	is_mpim: boolean

	/** Whether the conversation is private. `true` only for private channels and MPIMs. */
	is_private: boolean

	/**
	 * Whether the conversation is a channel. `true` only for public channels, non-legacy private
	 * channels, and MPIMs.
	 */
	is_channel: boolean

	/** Whether the channel is a group. `true` only for legacy private channels. */
	is_group: boolean

	/** User who created the channel. */
	creator: string

	/** Name of the channel. */
	name: string

	// TODO: ???
	name_normalized: string

	/** Channel description. `value` is empty when not set. */
	purpose: { creator: string; last_set: number; value: string }

	/** Channel topic. `value` is empty when not set. */
	topic: { creator: string; last_set: number; value: string }

	is_ext_shared: boolean
	is_general: boolean
	is_pending_ext_shared: boolean
	parent_conversation: unknown // observed null
	properties: ConversationProperties

	/** The list of workspace IDs in Enterprise Grid that this channel exists in. */
	internal_team_ids?: string[]

	/** Whether this channel was moved to another workspace in Enterprise Grid. Either `0` or `1`. */
	is_moved: number

	// ignored by client
	pending_connected_team_ids: string[]
	pending_shared: string[]
	shared_team_ids: string[]

	/** Whether a channel is frozen because it was disconnected from an external shared organization. */
	is_frozen?: boolean
	frozen_reason?:
		'external_dm_ended' | 'external_dm_denied' | 'connection_severed' | 'external_user_disconnected'
	grace_period_end?: number

	/** Whether the Slackbot agent can be turned on in this channel. */
	is_slackbot_channel_eligible?: boolean
	/** Whether the Slackbot agent is currently turned on in this channel. */
	is_slackbot_channel_enabled?: boolean
	previous_names?: string[] // observed undefined for private channel

	/** UNIX timestamp of when a Slack Connect channel is disconnected. */
	unlinked: number
}

export interface PublicChannel extends BaseNonIMConversation {
	is_mpim: false
	is_private: false
	is_channel: true
	is_group: false
}

export interface PrivateChannel extends BaseNonIMConversation {
	is_mpim: false
	is_private: true
	// (is_channel, is_group) = (true, false) | (false, true)

	creator: string
	name: string
	name_normalized: string
}

export interface MPIMChannel extends BaseNonIMConversation {
	is_mpim: true
	is_private: true
	is_channel: true
	is_group: false

	creator: string
	name: string
	name_normalized: string
}

export type Conversation = PublicChannel | PrivateChannel | IMChannel | MPIMChannel

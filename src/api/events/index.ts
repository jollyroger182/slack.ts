import type {
	AppHomeOpenedEvent as SlackAppHomeOpenedEvent,
	SlackEvent,
	ReactionAddedEvent as SlackReactionAddedEvent,
	ReactionRemovedEvent as SlackReactionRemovedEvent,
} from '@slack/types'
import type { DistributiveOmit } from '../../utils/typing'
import type { AnyMessage } from '../types/message'
import type { HomeView } from '../types/view'

export interface EventWrapper<T extends AllEvents = AllEvents> {
	type: 'event_callback'
	token: string
	team_id: string
	api_app_id: string
	event: T
	event_context: string
	event_id: string
	event_time: number
	authorizations: unknown[]
	is_ext_shared_channel: boolean
	context_team_id: string
	context_enterprise_id: string | null
}

export type AllEventTypes = AllEvents['type']

export type SlackEventMap = {
	[K in AllEventTypes]: Extract<AllEvents, { type: K }>
}

export interface AppHomeOpenedEvent extends SlackAppHomeOpenedEvent {
	view?: HomeView
}

export type AppMentionEvent = {
	type: 'app_mention'
	channel: string
	event_ts: string
} & DistributiveOmit<AnyMessage, 'type'>

export type MessageEvent = {
	channel: string
	event_ts: string
} & AnyMessage

export type ReactionEventItem =
	| { type: 'message'; channel: string; ts: string }
	| { type: 'file'; file: string }
	| { type: 'file_comment'; file_comment: string; file: string }

export interface ReactionAddedEvent extends Omit<SlackReactionAddedEvent, 'item'> {
	item: ReactionEventItem
}

export interface ReactionRemovedEvent extends Omit<SlackReactionRemovedEvent, 'item'> {
	item: ReactionEventItem
}

type OverrideEvents =
	| AppHomeOpenedEvent
	| AppMentionEvent
	| MessageEvent
	| ReactionAddedEvent
	| ReactionRemovedEvent

export type AllEvents = Exclude<SlackEvent, { type: OverrideEvents['type'] }> | OverrideEvents

// commented out types are RTM only event types
export const SLACK_EVENT_TYPES = [
	// 'accounts_changed',
	'app_deleted',
	'app_home_opened',
	'app_installed',
	'app_mention',
	'app_rate_limited',
	'app_requested',
	'app_uninstalled_team',
	'app_uninstalled',
	'assistant_thread_context_changed',
	'assistant_thread_started',
	// 'bot_added',
	// 'bot_changed',
	'call_rejected',
	'channel_archive',
	'channel_created',
	'channel_deleted',
	'channel_history_changed',
	'channel_id_changed',
	// 'channel_joined',
	'channel_left',
	// 'channel_marked',
	'channel_rename',
	'channel_shared',
	'channel_unarchive',
	'channel_unshared',
	// 'commands_changed',
	'dnd_updated_user',
	'dnd_updated',
	'email_domain_changed',
	'emoji_changed',
	'entity_details_requested',
	// 'external_org_migration_finished',
	// 'external_org_migration_started',
	'file_change',
	'file_comment_deleted',
	'file_created',
	'file_deleted',
	'file_public',
	'file_shared',
	'file_unshared',
	'function_executed',
	// 'goodbye',
	'grid_migration_finished',
	'grid_migration_started',
	'group_archive',
	'group_close',
	'group_deleted',
	'group_history_changed',
	// 'group_joined',
	'group_left',
	// 'group_marked',
	'group_open',
	'group_rename',
	'group_unarchive',
	// 'hello',
	'im_close',
	'im_created',
	'im_history_changed',
	// 'im_marked',
	'im_open',
	'invite_requested',
	'link_shared',
	// 'manual_presence_change',
	'member_joined_channel',
	'member_left_channel',
	'message',
	'message_metadata_deleted',
	'message_metadata_posted',
	'message_metadata_updated',
	'pin_added',
	'pin_removed',
	// 'pref_change',
	// 'presence_change',
	// 'presence_query',
	// 'presence_sub',
	'reaction_added',
	'reaction_removed',
	// 'reconnect_url',
	'shared_channel_invite_accepted',
	'shared_channel_invite_approved',
	'shared_channel_invite_declined',
	'shared_channel_invite_received',
	'shared_channel_invite_requested',
	'star_added',
	'star_removed',
	'subteam_created',
	'subteam_members_changed',
	'subteam_self_added',
	'subteam_self_removed',
	'subteam_updated',
	'team_access_granted',
	'team_access_revoked',
	'team_domain_change',
	'team_join',
	// 'team_migration_started',
	// 'team_plan_change',
	// 'team_pref_change',
	// 'team_profile_change',
	// 'team_profile_delete',
	// 'team_profile_reorder',
	'team_rename',
	'tokens_revoked',
	// 'url_verification',
	'user_change',
	// 'user_connection',
	'user_huddle_changed',
	// 'user_typing',
] satisfies AllEvents['type'][]

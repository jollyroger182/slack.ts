import type {
	AgentSessionStoppedEvent as SlackAgentSessionStoppedEvent,
	AgentSessionTitleChangedEvent as SlackAgentSessionTitleChangedEvent,
	AppContextChangedEvent as SlackAppContextChangedEvent,
	AppDeletedEvent as SlackAppDeletedEvent,
	AppHomeOpenedEvent as SlackAppHomeOpenedEvent,
	AppInstalledEvent as SlackAppInstalledEvent,
	AppMentionEvent as SlackAppMentionEvent,
	AppRateLimitedEvent as SlackAppRateLimitedEvent,
	AppRequestedEvent as SlackAppRequestedEvent,
	AppUninstalledEvent as SlackAppUninstalledEvent,
	AppUninstalledTeamEvent as SlackAppUninstalledTeamEvent,
	AssistantThreadContextChangedEvent as SlackAssistantThreadContextChangedEvent,
	AssistantThreadStartedEvent as SlackAssistantThreadStartedEvent,
	BotMessageEvent as SlackBotMessageEvent,
	CallRejectedEvent as SlackCallRejectedEvent,
	ChannelArchiveEvent as SlackChannelArchiveEvent,
	ChannelArchiveMessageEvent as SlackChannelArchiveMessageEvent,
	ChannelCreatedEvent as SlackChannelCreatedEvent,
	ChannelDeletedEvent as SlackChannelDeletedEvent,
	ChannelHistoryChangedEvent as SlackChannelHistoryChangedEvent,
	ChannelIDChangedEvent as SlackChannelIDChangedEvent,
	ChannelJoinMessageEvent as SlackChannelJoinMessageEvent,
	ChannelLeaveMessageEvent as SlackChannelLeaveMessageEvent,
	ChannelLeftEvent as SlackChannelLeftEvent,
	ChannelNameMessageEvent as SlackChannelNameMessageEvent,
	ChannelPostingPermissionsMessageEvent as SlackChannelPostingPermissionsMessageEvent,
	ChannelPurposeMessageEvent as SlackChannelPurposeMessageEvent,
	ChannelRenameEvent as SlackChannelRenameEvent,
	ChannelSharedEvent as SlackChannelSharedEvent,
	ChannelTopicMessageEvent as SlackChannelTopicMessageEvent,
	ChannelUnarchiveEvent as SlackChannelUnarchiveEvent,
	ChannelUnarchiveMessageEvent as SlackChannelUnarchiveMessageEvent,
	ChannelUnsharedEvent as SlackChannelUnsharedEvent,
	DNDUpdatedEvent as SlackDNDUpdatedEvent,
	DNDUpdatedUserEvent as SlackDNDUpdatedUserEvent,
	EKMAccessDeniedMessageEvent as SlackEKMAccessDeniedMessageEvent,
	EmailDomainChangedEvent as SlackEmailDomainChangedEvent,
	EmojiChangedEvent as SlackEmojiChangedEvent,
	FileChangeEvent as SlackFileChangeEvent,
	FileCommentDeletedEvent as SlackFileCommentDeletedEvent,
	FileCreatedEvent as SlackFileCreatedEvent,
	FileDeletedEvent as SlackFileDeletedEvent,
	FilePublicEvent as SlackFilePublicEvent,
	FileSharedEvent as SlackFileSharedEvent,
	FileShareMessageEvent as SlackFileShareMessageEvent,
	FileUnsharedEvent as SlackFileUnsharedEvent,
	FunctionExecutedEvent as SlackFunctionExecutedEvent,
	GenericMessageEvent as SlackGenericMessageEvent,
	GridMigrationFinishedEvent as SlackGridMigrationFinishedEvent,
	GridMigrationStartedEvent as SlackGridMigrationStartedEvent,
	GroupArchiveEvent as SlackGroupArchiveEvent,
	GroupCloseEvent as SlackGroupCloseEvent,
	GroupDeletedEvent as SlackGroupDeletedEvent,
	GroupHistoryChangedEvent as SlackGroupHistoryChangedEvent,
	GroupLeftEvent as SlackGroupLeftEvent,
	GroupOpenEvent as SlackGroupOpenEvent,
	GroupRenameEvent as SlackGroupRenameEvent,
	GroupUnarchiveEvent as SlackGroupUnarchiveEvent,
	IMCloseEvent as SlackIMCloseEvent,
	IMCreatedEvent as SlackIMCreatedEvent,
	IMHistoryChangedEvent as SlackIMHistoryChangedEvent,
	IMOpenEvent as SlackIMOpenEvent,
	InviteRequestedEvent as SlackInviteRequestedEvent,
	LinkSharedEvent as SlackLinkSharedEvent,
	MemberJoinedChannelEvent as SlackMemberJoinedChannelEvent,
	MemberLeftChannelEvent as SlackMemberLeftChannelEvent,
	MeMessageEvent as SlackMeMessageEvent,
	MessageChangedEvent as SlackMessageChangedEvent,
	MessageDeletedEvent as SlackMessageDeletedEvent,
	MessageMetadataDeletedEvent as SlackMessageMetadataDeletedEvent,
	MessageMetadataPostedEvent as SlackMessageMetadataPostedEvent,
	MessageMetadataUpdatedEvent as SlackMessageMetadataUpdatedEvent,
	MessageRepliedEvent as SlackMessageRepliedEvent,
	PinAddedEvent as SlackPinAddedEvent,
	PinRemovedEvent as SlackPinRemovedEvent,
	ReactionAddedEvent as SlackReactionAddedEvent,
	ReactionRemovedEvent as SlackReactionRemovedEvent,
	SharedChannelInviteAcceptedEvent as SlackSharedChannelInviteAcceptedEvent,
	SharedChannelInviteApprovedEvent as SlackSharedChannelInviteApprovedEvent,
	SharedChannelInviteDeclinedEvent as SlackSharedChannelInviteDeclinedEvent,
	SharedChannelInviteReceivedEvent as SlackSharedChannelInviteReceivedEvent,
	SharedChannelInviteRequestedEvent as SlackSharedChannelInviteRequestedEvent,
	SlackEvent,
	StarAddedEvent as SlackStarAddedEvent,
	StarRemovedEvent as SlackStarRemovedEvent,
	SubteamCreatedEvent as SlackSubteamCreatedEvent,
	SubteamMembersChangedEvent as SlackSubteamMembersChangedEvent,
	SubteamSelfAddedEvent as SlackSubteamSelfAddedEvent,
	SubteamSelfRemovedEvent as SlackSubteamSelfRemovedEvent,
	SubteamUpdatedEvent as SlackSubteamUpdatedEvent,
	TeamAccessGrantedEvent as SlackTeamAccessGrantedEvent,
	TeamAccessRevokedEvent as SlackTeamAccessRevokedEvent,
	TeamDomainChangeEvent as SlackTeamDomainChangeEvent,
	TeamJoinEvent as SlackTeamJoinEvent,
	TeamRenameEvent as SlackTeamRenameEvent,
	ThreadBroadcastMessageEvent as SlackThreadBroadcastMessageEvent,
	TokensRevokedEvent as SlackTokensRevokedEvent,
	UserChangeEvent as SlackUserChangeEvent,
	UserHuddleChangedEvent as SlackUserHuddleChangedEvent,
	UserProfileChangedEvent as SlackUserProfileChangedEvent,
	UserStatusChangedEvent as SlackUserStatusChangedEvent,
	WorkflowDeletedEvent as SlackWorkflowDeletedEvent,
	WorkflowPublishedEvent as SlackWorkflowPublishedEvent,
	WorkflowStepDeletedEvent as SlackWorkflowStepDeletedEvent,
	WorkflowStepExecuteEvent as SlackWorkflowStepExecuteEvent,
	WorkflowUnpublishedEvent as SlackWorkflowUnpublishedEvent,
} from '@slack/types'

import type { StrictOmit } from '../utils/types'
import type { Bot } from './objects/bot'
import type { Conversation } from './objects/conversation'
import type { ProfileField } from './objects/profile_field'

export interface Event<Type extends string = string> {
	type: Type
	event_ts?: string
}

/** {@inheritDoc @slack/types#AgentSessionStoppedEvent} */
export interface AgentSessionStoppedEvent extends SlackAgentSessionStoppedEvent {}

/** {@inheritDoc @slack/types#AgentSessionTitleChangedEvent} */
export interface AgentSessionTitleChangedEvent extends SlackAgentSessionTitleChangedEvent {}

/** {@inheritDoc @slack/types#AppContextChangedEvent} */
export interface AppContextChangedEvent extends SlackAppContextChangedEvent {}

/** {@inheritDoc @slack/types#AppDeletedEvent} */
export interface AppDeletedEvent extends SlackAppDeletedEvent {}

/** {@inheritDoc @slack/types#AppHomeOpenedEvent} */
export interface AppHomeOpenedEvent extends SlackAppHomeOpenedEvent {}

/** {@inheritDoc @slack/types#AppInstalledEvent} */
export interface AppInstalledEvent extends SlackAppInstalledEvent {}

/** {@inheritDoc @slack/types#AppMentionEvent} */
export interface AppMentionEvent extends SlackAppMentionEvent {}

/** {@inheritDoc @slack/types#AppRateLimitedEvent} */
export interface AppRateLimitedEvent extends SlackAppRateLimitedEvent {}

/** {@inheritDoc @slack/types#AppRequestedEvent} */
export interface AppRequestedEvent extends SlackAppRequestedEvent {}

/** {@inheritDoc @slack/types#AppUninstalledEvent} */
export interface AppUninstalledEvent extends SlackAppUninstalledEvent {}

/** {@inheritDoc @slack/types#AppUninstalledTeamEvent} */
export interface AppUninstalledTeamEvent extends SlackAppUninstalledTeamEvent {}

/** {@inheritDoc @slack/types#AssistantThreadContextChangedEvent} */
export interface AssistantThreadContextChangedEvent extends SlackAssistantThreadContextChangedEvent {}

/** {@inheritDoc @slack/types#AssistantThreadStartedEvent} */
export interface AssistantThreadStartedEvent extends SlackAssistantThreadStartedEvent {}

/** {@inheritDoc @slack/types#BotMessageEvent} */
export interface BotMessageEvent extends SlackBotMessageEvent {}

/** {@inheritDoc @slack/types#CallRejectedEvent} */
export interface CallRejectedEvent extends SlackCallRejectedEvent {}

/** {@inheritDoc @slack/types#ChannelArchiveEvent} */
export interface ChannelArchiveEvent extends SlackChannelArchiveEvent {}

/** {@inheritDoc @slack/types#ChannelArchiveMessageEvent} */
export interface ChannelArchiveMessageEvent extends SlackChannelArchiveMessageEvent {}

/** {@inheritDoc @slack/types#ChannelCreatedEvent} */
export interface ChannelCreatedEvent extends SlackChannelCreatedEvent {}

/** {@inheritDoc @slack/types#ChannelDeletedEvent} */
export interface ChannelDeletedEvent extends SlackChannelDeletedEvent {}

/** {@inheritDoc @slack/types#ChannelHistoryChangedEvent} */
export interface ChannelHistoryChangedEvent extends SlackChannelHistoryChangedEvent {}

/** {@inheritDoc @slack/types#ChannelIDChangedEvent} */
export interface ChannelIDChangedEvent extends SlackChannelIDChangedEvent {}

/** {@inheritDoc @slack/types#ChannelJoinMessageEvent} */
export interface ChannelJoinMessageEvent extends SlackChannelJoinMessageEvent {}

/** {@inheritDoc @slack/types#ChannelLeaveMessageEvent} */
export interface ChannelLeaveMessageEvent extends SlackChannelLeaveMessageEvent {}

/** {@inheritDoc @slack/types#ChannelLeftEvent} */
export interface ChannelLeftEvent extends SlackChannelLeftEvent {}

/** {@inheritDoc @slack/types#ChannelNameMessageEvent} */
export interface ChannelNameMessageEvent extends SlackChannelNameMessageEvent {}

/** {@inheritDoc @slack/types#ChannelPostingPermissionsMessageEvent} */
export interface ChannelPostingPermissionsMessageEvent extends SlackChannelPostingPermissionsMessageEvent {}

/** {@inheritDoc @slack/types#ChannelPurposeMessageEvent} */
export interface ChannelPurposeMessageEvent extends SlackChannelPurposeMessageEvent {}

/** {@inheritDoc @slack/types#ChannelRenameEvent} */
export interface ChannelRenameEvent extends SlackChannelRenameEvent {}

/** {@inheritDoc @slack/types#ChannelSharedEvent} */
export interface ChannelSharedEvent extends SlackChannelSharedEvent {}

/** {@inheritDoc @slack/types#ChannelTopicMessageEvent} */
export interface ChannelTopicMessageEvent extends SlackChannelTopicMessageEvent {}

/** {@inheritDoc @slack/types#ChannelUnarchiveEvent} */
export interface ChannelUnarchiveEvent extends SlackChannelUnarchiveEvent {}

/** {@inheritDoc @slack/types#ChannelUnarchiveMessageEvent} */
export interface ChannelUnarchiveMessageEvent extends SlackChannelUnarchiveMessageEvent {}

/** {@inheritDoc @slack/types#ChannelUnsharedEvent} */
export interface ChannelUnsharedEvent extends SlackChannelUnsharedEvent {}

/** {@inheritDoc @slack/types#DNDUpdatedEvent} */
export interface DNDUpdatedEvent extends SlackDNDUpdatedEvent {}

/** {@inheritDoc @slack/types#DNDUpdatedUserEvent} */
export interface DNDUpdatedUserEvent extends SlackDNDUpdatedUserEvent {}

/** {@inheritDoc @slack/types#EKMAccessDeniedMessageEvent} */
export interface EKMAccessDeniedMessageEvent extends SlackEKMAccessDeniedMessageEvent {}

/** {@inheritDoc @slack/types#EmailDomainChangedEvent} */
export interface EmailDomainChangedEvent extends SlackEmailDomainChangedEvent {}

/** {@inheritDoc @slack/types#EmojiChangedEvent} */
export interface EmojiChangedEvent extends SlackEmojiChangedEvent {}

/** A Work Object's comments are being loaded. */
export interface EntityCommentsRequestedEvent extends Event<'entity_comments_requested'> {
	user: string
	external_ref: { id: string; type?: string }
	entity_url: string
	link: { url: string; domain: string }
	cursor?: string
	limit: number
	thread_root_id?: string
	trigger_id: string
}

export interface EntityDetailsRequestedEvent extends Extract<
	SlackEvent,
	{ type: 'entity_details_requested' }
> {}

/** {@inheritDoc @slack/types#FileChangeEvent} */
export interface FileChangeEvent extends SlackFileChangeEvent {}

/** {@inheritDoc @slack/types#FileCommentDeletedEvent} */
export interface FileCommentDeletedEvent extends SlackFileCommentDeletedEvent {}

/** {@inheritDoc @slack/types#FileCreatedEvent} */
export interface FileCreatedEvent extends SlackFileCreatedEvent {}

/** {@inheritDoc @slack/types#FileDeletedEvent} */
export interface FileDeletedEvent extends SlackFileDeletedEvent {}

/** {@inheritDoc @slack/types#FilePublicEvent} */
export interface FilePublicEvent extends SlackFilePublicEvent {}

/** {@inheritDoc @slack/types#FileSharedEvent} */
export interface FileSharedEvent extends SlackFileSharedEvent {}

/** {@inheritDoc @slack/types#FileShareMessageEvent} */
export interface FileShareMessageEvent extends SlackFileShareMessageEvent {}

/** {@inheritDoc @slack/types#FileUnsharedEvent} */
export interface FileUnsharedEvent extends SlackFileUnsharedEvent {}

/** {@inheritDoc @slack/types#FunctionExecutedEvent} */
export interface FunctionExecutedEvent extends SlackFunctionExecutedEvent {}

/** {@inheritDoc @slack/types#GenericMessageEvent} */
export interface GenericMessageEvent extends SlackGenericMessageEvent {}

/** {@inheritDoc @slack/types#GridMigrationFinishedEvent} */
export interface GridMigrationFinishedEvent extends SlackGridMigrationFinishedEvent {}

/** {@inheritDoc @slack/types#GridMigrationStartedEvent} */
export interface GridMigrationStartedEvent extends SlackGridMigrationStartedEvent {}

/** {@inheritDoc @slack/types#GroupArchiveEvent} */
export interface GroupArchiveEvent extends SlackGroupArchiveEvent {}

/** {@inheritDoc @slack/types#GroupCloseEvent} */
export interface GroupCloseEvent extends SlackGroupCloseEvent {}

/** {@inheritDoc @slack/types#GroupDeletedEvent} */
export interface GroupDeletedEvent extends SlackGroupDeletedEvent {}

/** {@inheritDoc @slack/types#GroupHistoryChangedEvent} */
export interface GroupHistoryChangedEvent extends SlackGroupHistoryChangedEvent {}

/** {@inheritDoc @slack/types#GroupLeftEvent} */
export interface GroupLeftEvent extends SlackGroupLeftEvent {}

/** {@inheritDoc @slack/types#GroupOpenEvent} */
export interface GroupOpenEvent extends SlackGroupOpenEvent {}

/** {@inheritDoc @slack/types#GroupRenameEvent} */
export interface GroupRenameEvent extends SlackGroupRenameEvent {}

/** {@inheritDoc @slack/types#GroupUnarchiveEvent} */
export interface GroupUnarchiveEvent extends SlackGroupUnarchiveEvent {}

/** {@inheritDoc @slack/types#IMCloseEvent} */
export interface IMCloseEvent extends SlackIMCloseEvent {}

/** {@inheritDoc @slack/types#IMCreatedEvent} */
export interface IMCreatedEvent extends SlackIMCreatedEvent {}

/** {@inheritDoc @slack/types#IMHistoryChangedEvent} */
export interface IMHistoryChangedEvent extends SlackIMHistoryChangedEvent {}

/** {@inheritDoc @slack/types#IMOpenEvent} */
export interface IMOpenEvent extends SlackIMOpenEvent {}

/** {@inheritDoc @slack/types#InviteRequestedEvent} */
export interface InviteRequestedEvent extends SlackInviteRequestedEvent {}

/** {@inheritDoc @slack/types#LinkSharedEvent} */
export interface LinkSharedEvent extends SlackLinkSharedEvent {}

/** {@inheritDoc @slack/types#MemberJoinedChannelEvent} */
export interface MemberJoinedChannelEvent extends SlackMemberJoinedChannelEvent {}

/** {@inheritDoc @slack/types#MemberLeftChannelEvent} */
export interface MemberLeftChannelEvent extends SlackMemberLeftChannelEvent {}

/** {@inheritDoc @slack/types#MeMessageEvent} */
export interface MeMessageEvent extends SlackMeMessageEvent {}

/** {@inheritDoc @slack/types#MessageChangedEvent} */
export interface MessageChangedEvent extends SlackMessageChangedEvent {}

/** {@inheritDoc @slack/types#MessageDeletedEvent} */
export interface MessageDeletedEvent extends SlackMessageDeletedEvent {}

/** {@inheritDoc @slack/types#MessageMetadataDeletedEvent} */
export interface MessageMetadataDeletedEvent extends SlackMessageMetadataDeletedEvent {}

/** {@inheritDoc @slack/types#MessageMetadataPostedEvent} */
export interface MessageMetadataPostedEvent extends SlackMessageMetadataPostedEvent {}

/** {@inheritDoc @slack/types#MessageMetadataUpdatedEvent} */
export interface MessageMetadataUpdatedEvent extends SlackMessageMetadataUpdatedEvent {}

/** {@inheritDoc @slack/types#MessageRepliedEvent} */
export interface MessageRepliedEvent extends SlackMessageRepliedEvent {}

/** {@inheritDoc @slack/types#PinAddedEvent} */
export interface PinAddedEvent extends SlackPinAddedEvent {}

/** {@inheritDoc @slack/types#PinRemovedEvent} */
export interface PinRemovedEvent extends SlackPinRemovedEvent {}

/** {@inheritDoc @slack/types#ReactionAddedEvent} */
export interface ReactionAddedEvent extends SlackReactionAddedEvent {}

/** {@inheritDoc @slack/types#ReactionRemovedEvent} */
export interface ReactionRemovedEvent extends SlackReactionRemovedEvent {}

/** {@inheritDoc @slack/types#SharedChannelInviteAcceptedEvent} */
export interface SharedChannelInviteAcceptedEvent extends SlackSharedChannelInviteAcceptedEvent {}

/** {@inheritDoc @slack/types#SharedChannelInviteApprovedEvent} */
export interface SharedChannelInviteApprovedEvent extends SlackSharedChannelInviteApprovedEvent {}

/** {@inheritDoc @slack/types#SharedChannelInviteDeclinedEvent} */
export interface SharedChannelInviteDeclinedEvent extends SlackSharedChannelInviteDeclinedEvent {}

/** {@inheritDoc @slack/types#SharedChannelInviteReceivedEvent} */
export interface SharedChannelInviteReceivedEvent extends SlackSharedChannelInviteReceivedEvent {}

/** {@inheritDoc @slack/types#SharedChannelInviteRequestedEvent} */
export interface SharedChannelInviteRequestedEvent extends SlackSharedChannelInviteRequestedEvent {}

/** {@inheritDoc @slack/types#StarAddedEvent} */
export interface StarAddedEvent extends SlackStarAddedEvent {}

/** {@inheritDoc @slack/types#StarRemovedEvent} */
export interface StarRemovedEvent extends SlackStarRemovedEvent {}

/** {@inheritDoc @slack/types#SubteamCreatedEvent} */
export interface SubteamCreatedEvent extends SlackSubteamCreatedEvent {}

/** {@inheritDoc @slack/types#SubteamMembersChangedEvent} */
export interface SubteamMembersChangedEvent extends SlackSubteamMembersChangedEvent {}

/** {@inheritDoc @slack/types#SubteamSelfAddedEvent} */
export interface SubteamSelfAddedEvent extends SlackSubteamSelfAddedEvent {}

/** {@inheritDoc @slack/types#SubteamSelfRemovedEvent} */
export interface SubteamSelfRemovedEvent extends SlackSubteamSelfRemovedEvent {}

/** {@inheritDoc @slack/types#SubteamUpdatedEvent} */
export interface SubteamUpdatedEvent extends SlackSubteamUpdatedEvent {}

/** {@inheritDoc @slack/types#TeamAccessGrantedEvent} */
export interface TeamAccessGrantedEvent extends SlackTeamAccessGrantedEvent {}

/** {@inheritDoc @slack/types#TeamAccessRevokedEvent} */
export interface TeamAccessRevokedEvent extends SlackTeamAccessRevokedEvent {}

/** {@inheritDoc @slack/types#TeamDomainChangeEvent} */
export interface TeamDomainChangeEvent extends SlackTeamDomainChangeEvent {}

/** {@inheritDoc @slack/types#TeamJoinEvent} */
export interface TeamJoinEvent extends SlackTeamJoinEvent {}

/** {@inheritDoc @slack/types#TeamRenameEvent} */
export interface TeamRenameEvent extends SlackTeamRenameEvent {}

/** {@inheritDoc @slack/types#ThreadBroadcastMessageEvent} */
export interface ThreadBroadcastMessageEvent extends SlackThreadBroadcastMessageEvent {}

/** {@inheritDoc @slack/types#TokensRevokedEvent} */
export interface TokensRevokedEvent extends SlackTokensRevokedEvent {}

/** {@inheritDoc @slack/types#UserChangeEvent} */
export interface UserChangeEvent extends SlackUserChangeEvent {}

export interface UserConnectionEvent extends Event<'user_connection'> {
	subtype: 'connect' | 'disconnect'
	user: string
	trigger_id?: string
	enterprise_id?: string
}

export interface UserGuestStatusChangedEvent extends Event<'user_guest_status_changed'> {
	// TODO: this is actually a full user object
	user: { id: string }
	cache_ts?: number
}

/** {@inheritDoc @slack/types#UserHuddleChangedEvent} */
export interface UserHuddleChangedEvent extends SlackUserHuddleChangedEvent {}

/** {@inheritDoc @slack/types#UserProfileChangedEvent} */
export interface UserProfileChangedEvent extends SlackUserProfileChangedEvent {}

/** {@inheritDoc @slack/types#UserStatusChangedEvent} */
export interface UserStatusChangedEvent extends SlackUserStatusChangedEvent {}

/** {@inheritDoc @slack/types#WorkflowDeletedEvent} */
export interface WorkflowDeletedEvent extends SlackWorkflowDeletedEvent {}

/** {@inheritDoc @slack/types#WorkflowPublishedEvent} */
export interface WorkflowPublishedEvent extends SlackWorkflowPublishedEvent {}

/** {@inheritDoc @slack/types#WorkflowStepDeletedEvent} */
export interface WorkflowStepDeletedEvent extends SlackWorkflowStepDeletedEvent {}

/** {@inheritDoc @slack/types#WorkflowStepExecuteEvent} */
export interface WorkflowStepExecuteEvent extends SlackWorkflowStepExecuteEvent {}

/** {@inheritDoc @slack/types#WorkflowUnpublishedEvent} */
export interface WorkflowUnpublishedEvent extends SlackWorkflowUnpublishedEvent {}

export type MessageEvent =
	| GenericMessageEvent
	| BotMessageEvent
	| ChannelArchiveMessageEvent
	| ChannelJoinMessageEvent
	| ChannelLeaveMessageEvent
	| ChannelNameMessageEvent
	| ChannelPostingPermissionsMessageEvent
	| ChannelPurposeMessageEvent
	| ChannelTopicMessageEvent
	| ChannelUnarchiveMessageEvent
	| EKMAccessDeniedMessageEvent
	| FileShareMessageEvent
	| MeMessageEvent
	| MessageChangedEvent
	| MessageDeletedEvent
	| MessageRepliedEvent
	| ThreadBroadcastMessageEvent

export type StandardEvent =
	| AgentSessionStoppedEvent
	| AgentSessionTitleChangedEvent
	| AppContextChangedEvent
	| AppMentionEvent
	| AppDeletedEvent
	| AppHomeOpenedEvent
	| AppInstalledEvent
	| AppRequestedEvent
	| AppUninstalledEvent
	| AppUninstalledTeamEvent
	| AssistantThreadContextChangedEvent
	| AssistantThreadStartedEvent
	| CallRejectedEvent
	| ChannelCreatedEvent
	| ChannelDeletedEvent
	| ChannelHistoryChangedEvent
	| ChannelIDChangedEvent
	| ChannelLeftEvent
	| ChannelRenameEvent
	| ChannelSharedEvent
	| ChannelUnsharedEvent
	| DNDUpdatedEvent
	| DNDUpdatedUserEvent
	| EmailDomainChangedEvent
	| EmojiChangedEvent
	| EntityCommentsRequestedEvent
	| EntityDetailsRequestedEvent
	| FileChangeEvent
	| FileCommentDeletedEvent
	| FileCreatedEvent
	| FileDeletedEvent
	| FilePublicEvent
	| FileSharedEvent
	| FileUnsharedEvent
	| FunctionExecutedEvent
	| GridMigrationFinishedEvent
	| GridMigrationStartedEvent
	| GroupCloseEvent
	| GroupDeletedEvent
	| GroupHistoryChangedEvent
	| GroupLeftEvent
	| GroupOpenEvent
	| GroupRenameEvent
	| IMCloseEvent
	| IMCreatedEvent
	| IMHistoryChangedEvent
	| IMOpenEvent
	| InviteRequestedEvent
	| LinkSharedEvent
	| MemberJoinedChannelEvent
	| MemberLeftChannelEvent
	| MessageEvent
	| MessageMetadataDeletedEvent
	| MessageMetadataPostedEvent
	| MessageMetadataUpdatedEvent
	| PinAddedEvent
	| PinRemovedEvent
	| ReactionAddedEvent
	| ReactionRemovedEvent
	| SharedChannelInviteAcceptedEvent
	| SharedChannelInviteApprovedEvent
	| SharedChannelInviteDeclinedEvent
	| SharedChannelInviteReceivedEvent
	| SharedChannelInviteRequestedEvent
	| StarAddedEvent
	| StarRemovedEvent
	| SubteamCreatedEvent
	| SubteamMembersChangedEvent
	| SubteamSelfAddedEvent
	| SubteamSelfRemovedEvent
	| SubteamUpdatedEvent
	| TeamAccessGrantedEvent
	| TeamAccessRevokedEvent
	| TeamDomainChangeEvent
	| TeamJoinEvent
	| TeamRenameEvent
	| TokensRevokedEvent
	| UserChangeEvent
	| UserConnectionEvent
	| UserGuestStatusChangedEvent
	| UserHuddleChangedEvent
	| UserProfileChangedEvent
	| UserStatusChangedEvent

/** Used by the Slack web client. Can be ignored. */
export interface AccountsChangedEvent extends Event<'accounts_changed'> {}

/**
 * Permissions for a given account type are changed for a channel. Corresponds to the "Member
 * permissions" section of the Slack channel settings, or the Permissions sections of the
 * organization settings dashboard.
 */
export interface AccountTypePermissionsChangedEvent extends Event<'account_type_permissions_changed'> {
	/**
	 * Type of account whose permissions were updated. This can only be `FULL_MEMBER` or
	 * `MULTI_CHANNEL_GUEST` for `CHANNEL` entites.
	 */
	account_type:
		| 'WORKSPACE_PRIMARY_OWNER'
		| 'WORKSPACE_OWNER'
		| 'WORKSPACE_ADMIN'
		| 'ORG_OWNER'
		| 'ORG_ADMIN'
		| 'FULL_MEMBER'
		| 'MULTI_CHANNEL_GUEST'
		| 'SINGLE_CHANNEL_GUEST'
		| (string & {})

	/** UNIX timestamp of when the update happened. */
	date_updated: number

	/** ID of the channel, enterprise, or team. */
	entity_id: string

	/** Type of entity updated. */
	entity_type: 'TEAM_OR_ORG' | 'CHANNEL'

	/** Whether this permission is allowed. */
	is_allowed: boolean

	/** Unknown; seems to be the same as {@link is_allowed}? */
	is_deleted: boolean

	/** List of permissions that were changed (usually 1). */
	permissions: string[]

	/** Enterprise or team ID where the update occurred. */
	team_id: string

	/** Timestamp of event, same as `event_ts`. Only for `CHANNEL` entities. */
	ts?: string
}

export interface BotAddedEvent extends Event<'bot_added'> {
	bot: StrictOmit<Bot, 'team_id'>
	cache_ts: string
}

export interface BotChangedEvent extends Event<'bot_changed'> {
	bot: StrictOmit<Bot, 'team_id'>
	cache_ts: string
}

export interface ChannelJoinedEvent extends Event<'channel_joined'> {
	channel: Conversation
}

/** A channel is marked read up to a certain message. */
export interface ChannelMarkedEvent extends Event<'channel_marked'> {
	channel: string
	ts: string

	mention_count?: number
	mention_count_display?: number
	num_mentions?: number
	num_mentions_display?: number
	unread_count?: number
	unread_count_display?: number
	vip_count?: number
}

export interface CommandsChangedEvent extends Event<'commands_changed'> {
	commands_removed: { type: 'app'; app: string; name: string }[]
	commands_updated: { type: 'app'; app: string; name: string; desc: string; usage: string }[]
}

export interface ExternalOrgMigrationFinishedEvent extends Event<'external_org_migration_finished'> {
	team: { id: string; is_migrating: false }
	date_started: number
	date_finished: number
}

export interface ExternalOrgMigrationStartedEvent extends Event<'external_org_migration_started'> {
	team: { id: string; is_migrating: true }
	date_started: number
}

/** Sent by Slack to notify the client to reconnect. */
export interface GoodbyeEvent extends Event<'goodbye'> {}

export interface GroupJoinedEvent extends Event<'group_joined'> {
	channel: Conversation
}

/** A legavy private channel is marked read up to a certain message. */
export interface GroupMarkedEvent extends Event<'group_marked'> {
	channel: string
	ts: string

	is_mpim?: boolean
	mention_count?: number
	mention_count_display?: number
	num_mentions?: number
	num_mentions_display?: number
	unread_count?: number
	unread_count_display?: number
	vip_count?: number
}

export interface HelloEvent extends Event<'hello'> {}

export interface IMMarkedEvent extends Event<'im_marked'> {
	channel: string
	ts: string

	dm_count?: number
	mention_count_display?: number
	num_mentions_display?: number
	unread_count_display?: number
	vip_count?: number
}

export interface ManualPresenceChangeEvent extends Event<'manual_presence_change'> {
	presence: 'away' | 'active'
}

export interface PrefChangeEvent extends Event<'pref_change'> {
	name: string
	value: unknown
}

/** Presence change events, subscribed by the client with `presence_sub`. */
export interface PresenceChangeEvent extends Event<'presence_change'> {
	presence: 'away' | 'active'
	users: string[]
}

/**
 * Notifies your client of the next reconnection URL.
 *
 * This is a semi-undocumented event.
 */
export interface ReconnectURLEvent extends Event<'reconnect_url'> {
	url: string
}

/**
 * Sent when a team migration begins. The client will be disconnected right after this event is
 * received.
 */
export interface TeamMigrationStartedEvent extends Event<'team_migration_started'> {}

export interface TeamPlanChangeEvent extends Event<'team_plan_change'> {
	plan: '' | 'comp' | 'std' | 'plus' | 'enterprise'
	can_add_ura: boolean
	paid_features: string[]
}

export interface TeamPrefChangeEvent extends Event<'team_pref_change'> {
	name: string
	value: unknown
	team_id?: string
	org_policy?: string
}

/** The custom fields on a user profile was changed by a workspace admin. */
export interface TeamProfileChangeEvent extends Event<'team_profile_change'> {
	profile: { fields: ProfileField[] }
}

export interface TeamProfileDeleteEvent extends Event<'team_profile_delete'> {
	profile: { fields: string[] }
}

export interface TeamProfileReorderEvent extends Event<'team_profile_reorder'> {
	profile: { fields: Pick<ProfileField, 'id' | 'ordering'>[] }
}

export interface UserTypingEvent extends Event<'user_typing'> {
	channel: string
	user: string
	thread_id?: string
}

export type RTMEvent =
	| AccountsChangedEvent
	| BotAddedEvent
	| BotChangedEvent
	| ChannelCreatedEvent
	| ChannelDeletedEvent
	| ChannelHistoryChangedEvent
	| ChannelJoinedEvent
	| ChannelLeftEvent
	| ChannelMarkedEvent
	| ChannelRenameEvent
	| CommandsChangedEvent
	| DNDUpdatedEvent
	| DNDUpdatedUserEvent
	| EmailDomainChangedEvent
	| EmojiChangedEvent
	| ExternalOrgMigrationFinishedEvent
	| ExternalOrgMigrationStartedEvent
	| FileChangeEvent
	| FileCommentDeletedEvent
	| FileCreatedEvent
	| FileDeletedEvent
	| FilePublicEvent
	| FileSharedEvent
	| FileUnsharedEvent
	| GoodbyeEvent
	| GroupCloseEvent
	| GroupDeletedEvent
	| GroupHistoryChangedEvent
	| GroupJoinedEvent
	| GroupLeftEvent
	| GroupMarkedEvent
	| GroupOpenEvent
	| GroupRenameEvent
	| HelloEvent
	| IMCloseEvent
	| IMCreatedEvent
	| IMHistoryChangedEvent
	| IMMarkedEvent
	| IMOpenEvent
	| ManualPresenceChangeEvent
	| MemberJoinedChannelEvent
	| MemberLeftChannelEvent
	| MessageEvent
	| PinAddedEvent
	| PinRemovedEvent
	| PrefChangeEvent
	| PresenceChangeEvent
	| ReactionAddedEvent
	| ReactionRemovedEvent
	| ReconnectURLEvent
	| SharedChannelInviteReceivedEvent
	| StarAddedEvent
	| StarRemovedEvent
	| SubteamCreatedEvent
	| SubteamMembersChangedEvent
	| SubteamSelfAddedEvent
	| SubteamSelfRemovedEvent
	| SubteamUpdatedEvent
	| TeamDomainChangeEvent
	| TeamJoinEvent
	| TeamMigrationStartedEvent
	| TeamPlanChangeEvent
	| TeamPrefChangeEvent
	| TeamProfileChangeEvent
	| TeamProfileDeleteEvent
	| TeamProfileReorderEvent
	| TeamRenameEvent
	| UserChangeEvent
	| UserConnectionEvent
	| UserHuddleChangedEvent
	| UserProfileChangedEvent
	| UserStatusChangedEvent
	| UserTypingEvent

export type KnownEvent = StandardEvent | RTMEvent

export interface EventWrapper<E extends Event = KnownEvent> {
	type: 'event_callback'
	token: string
	team_id: string
	api_app_id: string
	authorizations: { enterprise_id?: string; team_id: string; user_id: string; is_bot: boolean }[]
	event: E
	event_id: string
	event_context: string
	event_time: number
}

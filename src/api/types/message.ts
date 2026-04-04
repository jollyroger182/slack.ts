import type { KnownBlock } from '@slack/types'

// objects

export type Attachment = {
	blocks?: KnownBlock[]
	color?: 'good' | 'warning' | 'danger' | string
	author_icon?: string
	author_link?: string
	author_name?: string
	fallback?: string
	fields?: AttachmentField[]
	footer?: string
	footer_icon?: string
	image_url?: string
	mrkdwn_in?: string[]
	pretext?: string
	text?: string
	thumb_url?: string
	title?: string
	title_link?: string
	ts?: string
} & ({ blocks: KnownBlock[] } | { fallback: string } | { text: string })

export interface AttachmentField {
	title?: string
	value?: string
	short?: boolean
}

export interface BotProfile {
	id: string
	app_id: string
	name: string
	icons: { image_36: string; image_48: string; image_72: string }
	deleted: boolean
	updated: number
	team_id: string
}

// mixins

interface MaybeBot {
	bot_id?: string
	app_id?: string
	bot_profile?: BotProfile
}

interface MaybeAttachments {
	attachments: Attachment[]
}

interface MaybeBlocks {
	blocks?: KnownBlock[]
}

interface MessageCommon {
	type: 'message'
	ts: string
	subtype?: string
	thread_ts?: string
	text?: string
	user?: string
}

// message subtypes

export interface NormalMessage extends MessageCommon, MaybeBot, MaybeAttachments, MaybeBlocks {
	subtype?: never

	user: string
	team: string
	edited?: { user: string; ts: string }
	client_msg_id?: string
	parent_user_id?: string
}

export interface ChannelJoinMessage extends MessageCommon {
	subtype: 'channel_join'

	user: string
	text: string
	inviter?: string
}

export type AnyMessage = NormalMessage | ChannelJoinMessage

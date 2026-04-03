import type { KnownBlock } from '@slack/types'

// objects

export interface Attachment {
	blocks?: KnownBlock[]
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

interface MessageCommon {
	type: 'message'
	ts: string
	subtype?: string
	text?: string
	user?: string
}

// message subtypes

export interface NormalMessage extends MessageCommon, MaybeBot, MaybeAttachments {
	subtype?: never

	user: string
	team: string
	blocks?: KnownBlock[]
}

export interface ChannelJoinMessage extends MessageCommon {
	subtype: 'channel_join'

	user: string
	text: string
	inviter?: string
}

export type AnyMessage = NormalMessage | ChannelJoinMessage

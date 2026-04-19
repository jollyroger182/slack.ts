import type { AnyBlock } from '@slack/types'
import type { File } from './file'

// objects

export interface MessageMetadata {
	event_type: string
	event_payload?: unknown
}

export type Attachment = {
	blocks?: AnyBlock[]
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
} & ({ blocks: AnyBlock[] } | { fallback: string } | { text: string })

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
	attachments?: Attachment[]
}

interface MaybeBlocks<Blocks extends AnyBlock[] = AnyBlock[]> {
	blocks?: Blocks
}

interface MessageCommon {
	type: 'message'
	ts: string
	subtype?: string
	thread_ts?: string
	text?: string
	user?: string
	hidden?: boolean
}

// message subtypes

export interface NormalMessage<Blocks extends AnyBlock[] = AnyBlock[]>
	extends MessageCommon, MaybeBot, MaybeAttachments, MaybeBlocks<Blocks> {
	subtype?: never

	user: string
	team: string
	edited?: { user: string; ts: string }
	client_msg_id?: string
	parent_user_id?: string
	files?: File[]
	streaming_state?: 'in_progress' | 'completed'
}

export interface BotMessageMessage extends MessageCommon, MaybeAttachments, MaybeBlocks {
	subtype: 'bot_message'

	bot_id: string
}

export interface ChannelJoinMessage extends MessageCommon {
	subtype: 'channel_join'

	user: string
	text: string
	inviter?: string
}

export interface MeMessageMessage extends MessageCommon {
	subtype: 'me_message'

	user: string
	text: string
}

export interface MessageChangedMessage extends MessageCommon {
	subtype: 'message_changed'

	hidden: true
	message: Exclude<AnyMessage, { hidden: true }> // TODO is this correct?
	previous_message?: Exclude<AnyMessage, { hidden: true }>
}

export interface MessageDeletedMessage extends MessageCommon {
	subtype: 'message_deleted'

	hidden: true
	deleted_ts: string
	previous_message: Exclude<AnyMessage, { hidden: true }>
}

export type AnyMessage =
	| NormalMessage
	| BotMessageMessage
	| ChannelJoinMessage
	| MeMessageMessage
	| MessageChangedMessage
	| MessageDeletedMessage

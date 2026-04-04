import type { KnownBlock } from '@slack/types'
import type { Attachment, NormalMessage } from '../types/message'

interface MarkdownMessage {
	markdown_text: string
	blocks?: never
	text?: never
}

type TextMessage = {
	markdown_text?: never
	blocks?: KnownBlock[]
	text?: string
} & ({ blocks: KnownBlock[] } | { text: string })

export type ChatPostMessageParams = {
	channel: string
	attachments?: Attachment[]
	icon_emoji?: string
	icon_url?: string
	link_names?: boolean
	metadata?: unknown
	mrkdwn?: boolean
	parse?: 'none' | 'full'
	reply_broadcast?: boolean
	thread_ts?: string
	unfurl_links?: boolean
	unfurl_media?: boolean
	username?: string
} & (MarkdownMessage | TextMessage)

export interface ChatPostMessageResponse {
	channel: string
	ts: string
	message: NormalMessage
}

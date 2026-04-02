// chat.postMessage

interface MarkdownMessage {
	markdown_text: string
	blocks?: never
	text?: never
}

type TextMessage = {
	markdown_text?: never
	blocks?: unknown[]
	text?: string
} & ({ blocks: unknown[] } | { text: string })

export type ChatPostMessageParams = {
	channel: string
	attachments?: unknown[]
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
	message: unknown
}

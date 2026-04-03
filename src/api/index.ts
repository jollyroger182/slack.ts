import type { ChatPostMessageParams, ChatPostMessageResponse } from './web/chat'
import type {
	ConversationsInfoParams,
	ConversationsInfoResponse,
	ConversationsRepliesParams,
	ConversationsRepliesResponse,
} from './web/conversations'

export interface SlackWebAPIMap {
	'chat.postMessage': {
		params: ChatPostMessageParams
		response: ChatPostMessageResponse
	}
	'conversations.info': {
		params: ConversationsInfoParams
		response: ConversationsInfoResponse
	}
	'conversations.replies': {
		params: ConversationsRepliesParams
		response: ConversationsRepliesResponse
	}
}

export type SlackAPIMethod = keyof SlackWebAPIMap
export type SlackAPIParams<Method extends SlackAPIMethod> = SlackWebAPIMap[Method]['params']
export type SlackAPIResponse<Method extends SlackAPIMethod> =
	| { ok: false; error: string }
	| ({ ok: true } & SlackWebAPIMap[Method]['response'])

import type { AuthTestParams, AuthTestResponse } from './web/auth'
import type { ChatPostMessageParams, ChatPostMessageResponse } from './web/chat'
import type {
	ConversationsInfoParams,
	ConversationsInfoResponse,
	ConversationsRepliesParams,
	ConversationsRepliesResponse,
} from './web/conversations'
import type {
	FilesCompleteUploadExternalParams,
	FilesCompleteUploadExternalResponse,
	FilesGetUploadURLExternalParams,
	FilesGetUploadURLExternalResponse,
} from './web/files'

export interface SlackWebAPIMap {
	'auth.test': {
		params: AuthTestParams
		response: AuthTestResponse
	}
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
	'files.completeUploadExternal': {
		params: FilesCompleteUploadExternalParams
		response: FilesCompleteUploadExternalResponse
	}
	'files.getUploadURLExternal': {
		params: FilesGetUploadURLExternalParams
		response: FilesGetUploadURLExternalResponse
	}
}

export type SlackAPIMethod = keyof SlackWebAPIMap
export type SlackAPIParams<Method extends SlackAPIMethod> = SlackWebAPIMap[Method]['params'] & {
	token?: string
}
export type SlackAPIResponse<Method extends SlackAPIMethod> =
	| { ok: false; error: string }
	| ({ ok: true } & SlackWebAPIMap[Method]['response'])

export const POST_METHODS: SlackAPIMethod[] = ['chat.postMessage', 'files.completeUploadExternal']

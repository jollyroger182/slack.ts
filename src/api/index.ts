import type { CursorPaginationParams, CursorPaginationResponse } from './types/api'
import type { AppsConnectionsOpenParams, AppsConnectionsOpenResponse } from './web/apps'
import type { AuthTestParams, AuthTestResponse } from './web/auth'
import type { ChatPostMessageParams, ChatPostMessageResponse } from './web/chat'
import type {
	ConversationsHistoryParams,
	ConversationsHistoryResponse,
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
import type { UsersInfoParams, UsersInfoResponse } from './web/users'

export interface SlackWebAPIMap {
	'apps.connections.open': {
		params: AppsConnectionsOpenParams
		response: AppsConnectionsOpenResponse
	}
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
	'conversations.history': {
		params: ConversationsHistoryParams
		response: ConversationsHistoryResponse
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
	'users.info': {
		params: UsersInfoParams
		response: UsersInfoResponse
	}
}

export type SlackAPIMethod = keyof SlackWebAPIMap
export type SlackPaginatingAPIMethod = {
	[K in SlackAPIMethod]: SlackWebAPIMap[K]['response'] extends CursorPaginationResponse ? K : never
}[SlackAPIMethod]
export type SlackAPIParams<Method extends SlackAPIMethod> = SlackWebAPIMap[Method]['params'] & {
	token?: string
}
export type SlackAPIResponse<Method extends SlackAPIMethod> =
	| { ok: false; error: string }
	| ({ ok: true } & SlackWebAPIMap[Method]['response'])

export const POST_METHODS: SlackAPIMethod[] = [
	'apps.connections.open',
	'chat.postMessage',
	'files.completeUploadExternal',
]

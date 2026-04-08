import type { CursorPaginationResponse } from './types/api'
import type { AppsConnectionsOpenParams, AppsConnectionsOpenResponse } from './web/apps'
import type { AuthTestParams, AuthTestResponse } from './web/auth'
import type {
	ChatPostEphemeralParams,
	ChatPostEphemeralResponse,
	ChatPostMessageParams,
	ChatPostMessageResponse,
} from './web/chat'
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
import type { ViewsOpenParams, ViewsOpenResponse } from './web/views'

export interface SlackWebAPIMap {
	'apps.connections.open': {
		params: AppsConnectionsOpenParams
		response: AppsConnectionsOpenResponse
	}
	'auth.test': {
		params: AuthTestParams
		response: AuthTestResponse
	}
	'chat.postEphemeral': {
		params: ChatPostEphemeralParams
		response: ChatPostEphemeralResponse
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
	'views.open': {
		params: ViewsOpenParams
		response: ViewsOpenResponse
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
	'chat.postEphemeral',
	'chat.postMessage',
	'files.completeUploadExternal',
	'views.open',
]

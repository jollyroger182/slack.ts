import type { SlackApiMap } from 'slack-undoc-client'

import type { CursorPaginationResponse } from './types/api'
import type {
	AppsConnectionsOpenParams,
	AppsConnectionsOpenResponse,
	AppsManifestCreateParams,
	AppsManifestCreateResponse,
	AppsManifestDeleteParams,
	AppsManifestDeleteResponse,
	AppsManifestExportParams,
	AppsManifestExportResponse,
	AppsManifestUpdateParams,
	AppsManifestUpdateResponse,
	AppsManifestValidateParams,
	AppsManifestValidateResponse,
	AppsUninstallParams,
	AppsUninstallResponse,
} from './web/apps'
import type {
	AuthRevokeParams,
	AuthRevokeResponse,
	AuthTeamsListParams,
	AuthTeamsListResponse,
	AuthTestParams,
	AuthTestResponse,
} from './web/auth'
import type { BotsInfoParams, BotsInfoResponse } from './web/bots'
import type {
	ChatPostEphemeralParams,
	ChatPostEphemeralResponse,
	ChatPostMessageParams,
	ChatPostMessageResponse,
	ChatAppendStreamParams,
	ChatAppendStreamResponse,
	ChatStartStreamParams,
	ChatStartStreamResponse,
	ChatStopStreamParams,
	ChatStopStreamResponse,
} from './web/chat'
import type {
	ConversationsHistoryParams,
	ConversationsHistoryResponse,
	ConversationsInfoParams,
	ConversationsInfoResponse,
	ConversationsListParams,
	ConversationsListResponse,
	ConversationsRepliesParams,
	ConversationsRepliesResponse,
} from './web/conversations'
import type {
	FilesCompleteUploadExternalParams,
	FilesCompleteUploadExternalResponse,
	FilesGetUploadURLExternalParams,
	FilesGetUploadURLExternalResponse,
} from './web/files'
import type {
	UsersInfoParams,
	UsersInfoResponse,
	UsersProfileSetParams,
	UsersProfileSetResponse,
} from './web/users'
import type { ViewsOpenParams, ViewsOpenResponse } from './web/views'

interface SlackWebAPIMapInternal {
	'chat.appendStream': {
		params: ChatAppendStreamParams
		response: ChatAppendStreamResponse
	}
	'chat.startStream': {
		params: ChatStartStreamParams
		response: ChatStartStreamResponse
	}
	'chat.stopStream': {
		params: ChatStopStreamParams
		response: ChatStopStreamResponse
	}
	'users.profile.set': {
		params: UsersProfileSetParams
		response: UsersProfileSetResponse
	}
	'bots.info': {
		params: BotsInfoParams
		response: BotsInfoResponse
	}
	'auth.teams.list': {
		params: AuthTeamsListParams
		response: AuthTeamsListResponse
	}
	'auth.revoke': {
		params: AuthRevokeParams
		response: AuthRevokeResponse
	}
	// apps.event.authorizations.list
	'apps.connections.open': {
		params: AppsConnectionsOpenParams
		response: AppsConnectionsOpenResponse
	}
	'apps.manifest.create': {
		params: AppsManifestCreateParams
		response: AppsManifestCreateResponse
	}
	'apps.manifest.delete': {
		params: AppsManifestDeleteParams
		response: AppsManifestDeleteResponse
	}
	'apps.manifest.export': {
		params: AppsManifestExportParams
		response: AppsManifestExportResponse
	}
	'apps.manifest.update': {
		params: AppsManifestUpdateParams
		response: AppsManifestUpdateResponse
	}
	'apps.manifest.validate': {
		params: AppsManifestValidateParams
		response: AppsManifestValidateResponse
	}
	'apps.uninstall': {
		params: AppsUninstallParams
		response: AppsUninstallResponse
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
	'conversations.history': {
		params: ConversationsHistoryParams
		response: ConversationsHistoryResponse
	}
	'conversations.info': {
		params: ConversationsInfoParams
		response: ConversationsInfoResponse
	}
	'conversations.list': {
		params: ConversationsListParams
		response: ConversationsListResponse
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

export interface SlackWebAPIMap
	extends SlackWebAPIMapInternal, Omit<SlackApiMap, keyof SlackWebAPIMapInternal> {}

export type SlackAPIMethod = keyof SlackWebAPIMap
export type SlackPaginatingAPIMethod = {
	[K in SlackAPIMethod]: SlackWebAPIMap[K]['response'] extends CursorPaginationResponse ? K : never
}[SlackAPIMethod]
export type SlackAPIParams<Method extends SlackAPIMethod> = SlackWebAPIMap[Method]['params'] & {
	token?: string | { cookie: string; token: string }
}
export type SlackAPIResponse<Method extends SlackAPIMethod> =
	| { ok: false; error: string }
	| ({ ok: true } & SlackWebAPIMap[Method]['response'])

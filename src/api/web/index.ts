import type { SlackApiMap } from 'slack-undoc-client'
import type { AnyToken } from '../../utils'
import type { CursorPaginationResponse } from '../types/api'

import type { EmojiListParams, EmojiListResponse } from './emoji'
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
} from './apps'
import type {
	AuthRevokeParams,
	AuthRevokeResponse,
	AuthTeamsListParams,
	AuthTeamsListResponse,
	AuthTestParams,
	AuthTestResponse,
} from './auth'
import type { BotsInfoParams, BotsInfoResponse } from './bots'
import type {
	ChatAppendStreamParams,
	ChatAppendStreamResponse,
	ChatPostEphemeralParams,
	ChatPostEphemeralResponse,
	ChatPostMessageParams,
	ChatPostMessageResponse,
	ChatStartStreamParams,
	ChatStartStreamResponse,
	ChatStopStreamParams,
	ChatStopStreamResponse,
	ChatUpdateParams,
	ChatUpdateResponse,
	ChatDeleteParams,
	ChatDeleteResponse,
} from './chat'
import type {
	ConversationsHistoryParams,
	ConversationsHistoryResponse,
	ConversationsInfoParams,
	ConversationsInfoResponse,
	ConversationsInviteParams,
	ConversationsInviteResponse,
	ConversationsJoinParams,
	ConversationsJoinResponse,
	ConversationsLeaveParams,
	ConversationsLeaveResponse,
	ConversationsListParams,
	ConversationsListResponse,
	ConversationsMembersParams,
	ConversationsMembersResponse,
	ConversationsOpenParams,
	ConversationsOpenResponse,
	ConversationsRepliesParams,
	ConversationsRepliesResponse,
	ConversationsArchiveParams,
	ConversationsArchiveResponse,
	ConversationsCloseParams,
	ConversationsCloseResponse,
	ConversationsCreateParams,
	ConversationsCreateResponse,
} from './conversations'
import type {
	FilesCompleteUploadExternalParams,
	FilesCompleteUploadExternalResponse,
	FilesGetUploadURLExternalParams,
	FilesGetUploadURLExternalResponse,
} from './files'
import type {
	ReactionsAddParams,
	ReactionsAddResponse,
	ReactionsGetParams,
	ReactionsGetResponse,
	ReactionsListParams,
	ReactionsListResponse,
	ReactionsRemoveParams,
	ReactionsRemoveResponse,
} from './reactions'
import type {
	SearchAllParams,
	SearchAllResponse,
	SearchFilesParams,
	SearchFilesResponse,
	SearchMessagesParams,
	SearchMessagesResponse,
} from './search'
import type {
	UsersInfoParams,
	UsersInfoResponse,
	UsersListParams,
	UsersListResponse,
	UsersProfileSetParams,
	UsersProfileSetResponse,
} from './users'
import type {
	ViewsOpenParams,
	ViewsOpenResponse,
	ViewsPublishParams,
	ViewsPublishResponse,
} from './views'

interface SlackWebAPIMapInternal {
	'chat.delete': {
		params: ChatDeleteParams
		response: ChatDeleteResponse
	}
	'conversations.create': {
		params: ConversationsCreateParams
		response: ConversationsCreateResponse
	}
	'conversations.close': {
		params: ConversationsCloseParams
		response: ConversationsCloseResponse
	}
	'conversations.archive': {
		params: ConversationsArchiveParams
		response: ConversationsArchiveResponse
	}
	'emoji.list': {
		params: EmojiListParams
		response: EmojiListResponse
	}
	'conversations.members': {
		params: ConversationsMembersParams
		response: ConversationsMembersResponse
	}
	'search.files': {
		params: SearchFilesParams
		response: SearchFilesResponse
	}
	'search.all': {
		params: SearchAllParams
		response: SearchAllResponse
	}
	'search.messages': {
		params: SearchMessagesParams
		response: SearchMessagesResponse
	}
	'reactions.get': {
		params: ReactionsGetParams
		response: ReactionsGetResponse
	}
	'reactions.list': {
		params: ReactionsListParams
		response: ReactionsListResponse
	}
	'reactions.remove': {
		params: ReactionsRemoveParams
		response: ReactionsRemoveResponse
	}
	'reactions.add': {
		params: ReactionsAddParams
		response: ReactionsAddResponse
	}
	'users.list': {
		params: UsersListParams
		response: UsersListResponse
	}
	'conversations.open': {
		params: ConversationsOpenParams
		response: ConversationsOpenResponse
	}
	'conversations.invite': {
		params: ConversationsInviteParams
		response: ConversationsInviteResponse
	}
	'conversations.leave': {
		params: ConversationsLeaveParams
		response: ConversationsLeaveResponse
	}
	'conversations.join': {
		params: ConversationsJoinParams
		response: ConversationsJoinResponse
	}
	'chat.update': {
		params: ChatUpdateParams
		response: ChatUpdateResponse
	}
	'views.publish': {
		params: ViewsPublishParams
		response: ViewsPublishResponse
	}
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
export type SlackAPIParams<Method extends SlackAPIMethod> =
	(SlackWebAPIMap[Method]['params'] extends void ? {} : SlackWebAPIMap[Method]['params']) & {
		token?: AnyToken
	}
export type SlackAPIResponse<Method extends SlackAPIMethod> =
	| { ok: false; error: string }
	| ({ ok: true } & SlackWebAPIMap[Method]['response'])

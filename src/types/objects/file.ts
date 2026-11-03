import type { FileShareMessageEvent } from '@slack/types'

import type { ListMetadata } from './list'

type SlackTypesFile = (FileShareMessageEvent['files'] & {})[number]

export interface File extends SlackTypesFile {
	list_metadata?: ListMetadata
}

import type { FileShareMessageEvent } from '@slack/types'

type SlackTypesFile = (FileShareMessageEvent['files'] & {})[number]

export interface File extends SlackTypesFile {}

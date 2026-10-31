import type { GenericMessageEvent } from '@slack/types'

type BotProfile = GenericMessageEvent['bot_profile'] & {}

export interface Bot extends BotProfile {
	icons: { image_36: string; image_48: string; image_72: string }
}

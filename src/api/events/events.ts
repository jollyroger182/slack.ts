import type { AnyMessage } from '../types/message'
import type { DistributiveOmit } from '../../utils/typing'

export type AppMentionEvent = {
	type: 'app_mention'
	channel: string
	event_ts: string
} & DistributiveOmit<AnyMessage, 'type'>

export type MessageEvent = {
	channel: string
	event_ts: string
} & AnyMessage

import type { EventEmitter } from 'node:events'

export interface ReceiverEventMap {}

export interface Receiver extends EventEmitter<ReceiverEventMap> {
	start(): unknown
	stop(): unknown
}

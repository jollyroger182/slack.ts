import { EventEmitter } from 'node:events'

export interface ReceiverEventMap {}

export interface Receiver extends EventEmitter<ReceiverEventMap> {
	start(): void | Promise<void>
	stop(): void | Promise<void>
}

export abstract class BaseReceiver extends EventEmitter<ReceiverEventMap> implements Receiver {
	abstract start(): void | Promise<void>
	abstract stop(): void | Promise<void>
}

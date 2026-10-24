import { EventEmitter } from 'node:events'

import type { EventWrapper } from '../types/events'

export interface ReceiverEventMap {
	event: [event: EventWrapper]
}

/** A connector responsible for receiving events from Slack. */
export interface Receiver extends EventEmitter<ReceiverEventMap> {
	/** Starts the connector. */
	start(): void | Promise<void>
	/** Stops the connector. Must not throw if the connector is not {@link start}ed. */
	stop(): void | Promise<void>
}

export abstract class BaseReceiver extends EventEmitter<ReceiverEventMap> implements Receiver {
	abstract start(): void | Promise<void>
	abstract stop(): void | Promise<void>
}

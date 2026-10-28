import { EventEmitter } from 'node:events'

import type { Client } from '../client'
import type { EventWrapper } from '../types/events'

export interface ReceiverEventMap {
	event: [event: EventWrapper]
}

/** A connector responsible for receiving events from Slack. */
export interface Receiver extends EventEmitter<ReceiverEventMap> {
	/**
	 * Starts the connector.
	 *
	 * @param client Optional Slack client. Some receivers may require it to make Slack API calls in
	 *   the process of starting, or to use the token on the receiver.
	 */
	start(client?: Client): void | Promise<void>
	/** Stops the connector. Must not throw if the connector is not {@link start}ed. */
	stop(): void | Promise<void>
}

export abstract class BaseReceiver extends EventEmitter<ReceiverEventMap> implements Receiver {
	abstract start(client?: Client): void | Promise<void>
	abstract stop(): void | Promise<void>
}

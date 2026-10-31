import type { Client } from '../client'
import type { Action } from '../types/blocks/elements'
import type { Event, EventWrapper } from '../types/events'
import type { BlockActions } from '../types/interactions'
import { AsyncEventEmitter, type EventMap } from '../utils/events'

export interface ReceiverEventMap {
	event: [event: EventWrapper<Event>]
	actions: [actions: BlockActions<Action>]
}

/** A connector responsible for receiving events from Slack. */
export interface Receiver<
	Map extends ReceiverEventMap & EventMap<Map> = ReceiverEventMap,
> extends AsyncEventEmitter<Map> {
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

export abstract class BaseReceiver<Map extends ReceiverEventMap & EventMap<Map> = ReceiverEventMap>
	extends AsyncEventEmitter<Map>
	implements Receiver<Map>
{
	abstract start(client?: Client): void | Promise<void>
	abstract stop(): void | Promise<void>
}

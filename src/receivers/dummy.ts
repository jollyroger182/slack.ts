import { AsyncEventEmitter } from '../utils/events'
import type { EventsReceiver, ReceiverEventMap } from './base'

export class DummyReceiver extends AsyncEventEmitter<ReceiverEventMap> implements EventsReceiver {
	constructor() {
		super()
	}

	start() {}

	stop() {}
}

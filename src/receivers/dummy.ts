import { EventEmitter } from 'events'
import type { EventsReceiver, ReceiverEventMap } from './base'

export class DummyReceiver extends EventEmitter<ReceiverEventMap> implements EventsReceiver {
	constructor() {
		super()
	}

	start() {}
}

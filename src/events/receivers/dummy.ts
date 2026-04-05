import { EventEmitter } from 'events'
import type { EventsReceiver, ReceiverEventMap } from '../types'

export class DummyReceiver extends EventEmitter<ReceiverEventMap> implements EventsReceiver {
	constructor() {
		super()
	}

	start() {}
}

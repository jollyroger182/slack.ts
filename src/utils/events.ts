type EventListener<EventMap extends Record<string, unknown[]>, Event extends keyof EventMap> = (
	...args: EventMap[Event]
) => unknown

export class AsyncEventEmitter<
	EventMap extends Record<string, unknown[]> = Record<string, unknown[]>,
> {
	#listeners: { [T in keyof EventMap & string]?: EventListener<EventMap, T>[] } = {}

	constructor() {}

	on<Event extends keyof EventMap & string>(
		event: Event,
		listener: EventListener<EventMap, Event>,
	) {
		if (!this.#listeners[event]) this.#listeners[event] = []
		if (this.#listeners[event]!.includes(listener)) return
		this.#listeners[event]!.push(listener)
	}

	once<Event extends keyof EventMap & string>(
		event: Event,
		listener: EventListener<EventMap, Event>,
	) {
		const callback = (...args: EventMap[Event]) => {
			this.off(event, callback)
			return listener(...args)
		}
		this.on(event, callback)
	}

	off<Event extends keyof EventMap & string>(
		event: Event,
		listener: EventListener<EventMap, Event>,
	) {
		if (!this.#listeners[event]) this.#listeners[event] = []
		const index = this.#listeners[event]!.indexOf(listener)
		if (index) this.#listeners[event]!.splice(index, 1)
	}

	async emit<Event extends keyof EventMap & string>(event: Event, ...args: EventMap[Event]) {
		const listeners = this.#listeners[event] || []
		await Promise.all(listeners.map((listener) => listener(...args)))
	}
}

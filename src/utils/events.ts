type EventHandler<A extends unknown[] = unknown[]> = (...args: A) => void | Promise<void>

type Listener = { handler: EventHandler; once: boolean }

export class AsyncEventEmitter<T extends Record<keyof T, unknown[]> = {}> {
	#listeners: Map<keyof T, Listener[]> = new Map()

	on<N extends keyof T>(eventName: N, handler: EventHandler<T[N]>) {
		this.#on(eventName, handler, false)
	}

	off<N extends keyof T>(eventName: N, handler: EventHandler<T[N]>) {
		const listeners = this.#listeners.get(eventName)
		if (!listeners) return
		const index = listeners.findLastIndex((h) => h.handler === handler)
		if (index < 0) return
		listeners.splice(index, 1)
	}

	once<N extends keyof T>(eventName: N, handler: EventHandler<T[N]>) {
		this.#on(eventName, handler, true)
	}

	#on<N extends keyof T>(eventName: N, handler: EventHandler<T[N]>, once: boolean) {
		let listeners = this.#listeners.get(eventName)
		if (!listeners) this.#listeners.set(eventName, (listeners = []))
		listeners.push({ handler: handler as EventHandler, once })
	}

	async emit<N extends keyof T>(eventName: N, ...args: T[N]) {
		const listeners = this.#listeners.get(eventName)
		if (!listeners) return
		this.#listeners.set(
			eventName,
			listeners.filter((h) => !h.once),
		)
		const promises = listeners.map(async (f) => f.handler(...args))
		await Promise.all(promises)
	}
}

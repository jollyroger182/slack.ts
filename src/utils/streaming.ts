import type { SlackAPIParams } from '../api'
import type { StreamChunk } from '../api/web/chat'
import type { App } from '../client'

export async function startStreaming(client: App, params: SlackAPIParams<'chat.startStream'>) {
	const { channel, ts } = await client.request('chat.startStream', params)
	return new Streamer(client, channel, ts)
}

export class Streamer {
	private chunks: StreamChunk[] = []
	#chain = new StreamerChain(this)

	constructor(
		private client: App,
		private channel: string,
		private ts: string,
	) {}

	append(...chunks: (string | StreamChunk)[]) {
		this.chunks.push(
			...chunks.map<StreamChunk>((c) =>
				typeof c === 'string' ? { type: 'markdown_text', text: c } : c,
			),
		)
		return this.#chain
	}

	async stop({ blocks }: Pick<SlackAPIParams<'chat.stopStream'>, 'blocks'>) {
		await this.client.request('chat.stopStream', { channel: this.channel, ts: this.ts, blocks })
	}

	async sync() {
		const chunks = [...this.chunks]
		this.chunks.length = 0
		await this.client.request('chat.appendStream', {
			channel: this.channel,
			ts: this.ts,
			chunks,
		})
	}
}

export class StreamerChain implements PromiseLike<Streamer> {
	constructor(private streamer: Streamer) {}

	append(...chunks: StreamChunk[]) {
		this.streamer.append(...chunks)
		return this
	}

	then<TResult1 = Streamer, TResult2 = never>(
		onfulfilled?: ((value: Streamer) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.streamer
			.sync()
			.then(() => this.streamer)
			.then(onfulfilled, onrejected)
	}
}

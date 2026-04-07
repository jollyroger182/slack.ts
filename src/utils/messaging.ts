import type { KnownBlock } from '@slack/types'
import type { ChatPostMessageParams } from '../api/web/chat'
import type { App } from '../client'
import { SlackError } from '../error'
import type { NormalMessage } from '../api/types/message'

export type SendMessageFile = {
	file: Buffer | ArrayBuffer
	filename: string
	title?: string
	snippet_type?: string
	alt_txt?: string
}

export interface SendMessageWithFiles<Blocks extends KnownBlock[] = KnownBlock[]> {
	channel: string
	files: SendMessageFile[]
	thread_ts?: string
	text?: string
	blocks?: Blocks
	token?: string
}

export type SendMessageWithoutFiles<Blocks extends KnownBlock[] = KnownBlock[]> = {
	files?: never
	blocks?: Blocks
} & ChatPostMessageParams

export type SendMessageParams<Blocks extends KnownBlock[] = KnownBlock[]> =
	| SendMessageWithFiles<Blocks>
	| SendMessageWithoutFiles<Blocks>

export async function sendMessage<Blocks extends KnownBlock[] = KnownBlock[]>(
	client: App,
	params: SendMessageParams<Blocks>,
) {
	if (params.files) {
		const files = await Promise.all(
			params.files.map(async (file) => ({
				id: await uploadHelper(client, file),
				title: file.title,
			})),
		)
		await client.request('files.completeUploadExternal', {
			files,
			channel_id: params.channel,
			thread_ts: params.thread_ts,
			initial_comment: params.text,
			blocks: params.blocks,
		})
	} else {
		const message = await client.request('chat.postMessage', params)
		return {
			channel: message.channel,
			ts: message.ts,
			message: message.message as NormalMessage<Blocks>,
		}
	}
}

async function uploadHelper(client: App, file: SendMessageFile) {
	const { upload_url, file_id } = await client.request('files.getUploadURLExternal', {
		length: file.file.byteLength,
		filename: file.filename,
		snippet_type: file.snippet_type,
		alt_txt: file.alt_txt,
	})
	const uploadResp = await fetch(upload_url, {
		method: 'POST',
		body: file.file,
	})
	if (!uploadResp.ok) {
		throw new SlackError('Failed to upload file')
	}
	return file_id
}

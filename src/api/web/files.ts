import type { AnyBlock } from '@slack/types'
import type { File } from '../types/file'

interface CompleteUploadFile {
	id: string
	title?: string
}

export interface FilesCompleteUploadExternalParams {
	/** Array of file ids and their corresponding (optional) titles. */
	files: CompleteUploadFile[]

	/** Channel ID where the file will be shared. If not specified the file will be private. */
	channel_id?: string

	/**
	 * Provide another message's `ts` value to upload this file as a reply. Never use a reply's `ts`
	 * value; use its parent instead. Also make sure to provide only one channel when using
	 * 'thread_ts'
	 */
	thread_ts?: string

	/** Comma-separated string of channel IDs or user IDs where the file will be shared. */
	channels?: string

	/** The message text introducing the file in specified channels. */
	initial_comment?: string

	/**
	 * A JSON-based array of structured rich text blocks, presented as a URL-encoded string. If the
	 * `initial_comment` field is provided, the `blocks` field is ignored
	 */
	blocks?: AnyBlock[]
}

export interface FilesCompleteUploadExternalResponse {
	files: File[]
}

export interface FilesGetUploadURLExternalParams {
	/** Size in bytes of the file being uploaded. */
	length: number

	/** Name of the file being uploaded. */
	filename: string

	/** Syntax type of the snippet being uploaded. */
	snippet_type?: string

	/** Description of image for screen-reader. */
	alt_txt?: string
}

export interface FilesGetUploadURLExternalResponse {
	upload_url: string
	file_id: string
}

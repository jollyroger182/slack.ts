import type { FileInput } from '@slack/types'
import { BlockElementBuilder } from './base'

type TypedFileInput<ActionID extends string> = FileInput & { action_id: ActionID }

export class FileInputBuilder<ActionID extends string = string> extends BlockElementBuilder<
	TypedFileInput<ActionID>,
	ActionID
> {
	private _max?: number

	constructor(private _fileTypes?: string[]) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): FileInputBuilder<ActionID> {
		return this._id(actionId)
	}

	max(maxFiles: number) {
		this._max = maxFiles
		return this
	}

	override build(): TypedFileInput<ActionID> {
		return {
			...this._build(),
			type: 'file_input',
			filetypes: this._fileTypes,
			max_files: this._max,
		}
	}
}

export function fileInput(...extensions: string[]) {
	return new FileInputBuilder(extensions.length ? extensions : undefined)
}

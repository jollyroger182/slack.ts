import type { TextObject } from '@slack/types'
import { BlockBuilder } from './base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'

type AlertLevel = 'default' | 'info' | 'warning' | 'error' | 'success'

type TypedAlertBlock<BlockID extends string> = {
	type: 'alert'
	text: TextObject
	level?: AlertLevel
	block_id: BlockID
}

export class AlertBlockBuilder<BlockID extends string = string> extends BlockBuilder<
	TypedAlertBlock<BlockID>,
	BlockID
> {
	private _level?: AlertLevel

	constructor(private text: TextObjectBuilder) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): AlertBlockBuilder<BlockID> {
		return this._id(blockId)
	}

	info() {
		this._level = 'info'
		return this
	}

	warning() {
		this._level = 'warning'
		return this
	}

	error() {
		this._level = 'error'
		return this
	}

	success() {
		this._level = 'success'
		return this
	}

	override build(): TypedAlertBlock<BlockID> {
		return {
			...this._build(),
			type: 'alert',
			text: this.text.build(),
			level: this._level,
		}
	}
}

export function alert(text: string | TextObjectBuilder) {
	return new AlertBlockBuilder(ensureIsTextObjectBuilder(text))
}

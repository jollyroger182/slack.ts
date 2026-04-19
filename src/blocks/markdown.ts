import type { MarkdownBlock } from '@slack/types'
import { BlockBuilder } from './base'

export class MarkdownBlockBuilder extends BlockBuilder<MarkdownBlock> {
	constructor(private text: string) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): any {
		console.warn('markdown blocks cannot have a block_id, it will be ignored by slack')
		return this
	}

	override build(): MarkdownBlock {
		return { type: 'markdown', text: this.text }
	}
}

export function markdown(text: string) {
	return new MarkdownBlockBuilder(text)
}

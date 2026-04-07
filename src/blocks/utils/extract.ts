import type {
	ActionsBlock,
	InputBlock,
	KnownBlock,
	SectionBlock,
	SectionBlockAccessory,
} from '@slack/types'
import type { StateValue } from '../../api/types/value'

export type ExtractValues<Blocks extends { block_id?: string }[]> = {
	[Block in Blocks[number] as Block['block_id'] extends string
		? Block['block_id']
		: never]: ExtractBlockValues<Block>
}

export type ExtractBlockValues<Block> = Block extends {
	element: { type: string; action_id: string }
}
	? { [T in Block['element']['action_id']]: StateValue & { type: Block['element']['type'] } }
	: Block extends { elements: { type: string; action_id?: string }[] }
		? {
				[Action in Block['elements'][number] as Action['action_id'] extends string
					? Action['action_id']
					: never]: StateValue & { type: Action['type'] }
			}
		: never

export type ExtractActions<Blocks extends KnownBlock[]> = {
	[K in keyof Blocks]: ExtractBlockActions<Blocks[K]>
}[number][number]

export type ExtractBlockActions<Block extends KnownBlock> = Block extends SectionBlock
	? ExtractSectionActions<Block>
	: Block extends InputBlock
		? [Block['element']]
		: Block extends ActionsBlock
			? Block['elements']
			: []

type ExtractSectionActions<Block extends SectionBlock> =
	Block['accessory'] extends SectionBlockAccessory ? [Block['accessory']] : []

export type ActionsToPrefixedID<Action extends { type: string; action_id?: string }> =
	Action extends { type: string; action_id: string }
		? `${Action['type']}.${Action['action_id']}` | Action['action_id']
		: never

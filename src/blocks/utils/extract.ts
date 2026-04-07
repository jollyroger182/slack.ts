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

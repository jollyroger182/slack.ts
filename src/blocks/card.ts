import type { Button, ImageElement, TextObject } from '@slack/types'
import { BlockBuilder } from './base'
import type { ImageBuilder } from './elements/image'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from './objects/text'
import type { ButtonBuilder } from './elements/button'
import type { BlockElementBuilder } from './elements/base'

type CardBlockActionBuilder = ButtonBuilder

type TypedCardBlock<BlockID extends string, Actions extends CardBlockActionBuilder[]> = {
	type: 'card'
	hero_image?: ImageElement
	title?: TextObject
	body?: TextObject
	actions?: Actions extends []
		? undefined
		: {
				[K in keyof Actions]: Actions[K] extends BlockElementBuilder<infer Output, any, true>
					? Output
					: never
			}
	icon?: ImageElement
	subtitle?: TextObject
	block_id: BlockID
} & (
	| { hero_image: ImageElement }
	| { title: TextObject }
	| { body: TextObject }
	| { actions: unknown[] }
)

export class CardBlockBuilder<
	Valid extends boolean = boolean,
	Actions extends CardBlockActionBuilder[] = [],
	BlockID extends string = string,
> extends BlockBuilder<TypedCardBlock<BlockID, Actions>, BlockID, Valid> {
	private _heroImage?: ImageBuilder<true>
	private _title?: TextObjectBuilder
	private _body?: TextObjectBuilder
	private _actions: CardBlockActionBuilder[] = []
	private _icon?: ImageBuilder<true>
	private _subtitle?: TextObjectBuilder

	override id<BlockID extends string>(blockId: BlockID): CardBlockBuilder<Valid, Actions, BlockID> {
		return this._id(blockId)
	}

	hero(heroImage: ImageBuilder<true>) {
		this._heroImage = heroImage
		return this as CardBlockBuilder<true, Actions, BlockID>
	}

	title(title: string | TextObjectBuilder) {
		this._title = ensureIsTextObjectBuilder(title)
		return this as CardBlockBuilder<true, Actions, BlockID>
	}

	action<Action extends CardBlockActionBuilder>(action: Action) {
		this._actions.push(action)
		return this as CardBlockBuilder<true, [...Actions, Action], BlockID>
	}

	actions<NewActions extends CardBlockActionBuilder[]>(...actions: NewActions) {
		this._actions.push(...actions)
		return this as CardBlockBuilder<true, [...Actions, ...NewActions], BlockID>
	}

	icon(icon: ImageBuilder<true>) {
		this._icon = icon
		return this
	}

	subtitle(subtitle: string | TextObjectBuilder) {
		this._subtitle = ensureIsTextObjectBuilder(subtitle)
		return this
	}

	body(body: string | TextObjectBuilder) {
		this._body = ensureIsTextObjectBuilder(body)
		return this
	}

	override build(): TypedCardBlock<BlockID, Actions> {
		return {
			...this._build(),
			type: 'card',
			hero_image: this._heroImage?.build(),
			title: this._title?.build(),
			body: this._body?.build(),
			actions: (this._actions.length ? this._actions.map((a) => a.build()) : undefined) as any,
			icon: this._icon?.build(),
			subtitle: this._subtitle?.build(),
		}
	}
}

export function card() {
	return new CardBlockBuilder<false>()
}

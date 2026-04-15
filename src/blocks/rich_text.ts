import type {
	RichTextBlock,
	RichTextBlockElement,
	RichTextBroadcastMention,
	RichTextChannelMention,
	RichTextColor,
	RichTextDate,
	RichTextElement,
	RichTextEmoji,
	RichTextLink,
	RichTextList,
	RichTextPreformatted,
	RichTextQuote,
	RichTextSection,
	RichTextTeamMention,
	RichTextText,
	RichTextUsergroupMention,
	RichTextUserMention,
} from '@slack/types'
import { BlockBuilder, Builder } from './base'
import type { ChannelRef, User, UserRef } from '../resources'
import type { Channel } from '../../dist'

type TypedRichTextBlock<BlockID extends string> = RichTextBlock & { block_id: BlockID }

export class RichTextBlockBuilder<BlockID extends string = string> extends BlockBuilder<
	TypedRichTextBlock<BlockID>,
	BlockID
> {
	constructor(private elements: Builder<RichTextBlockElement>[]) {
		super()
	}

	override id<BlockID extends string>(blockId: BlockID): RichTextBlockBuilder<BlockID> {
		return this._id(blockId)
	}

	override build(): TypedRichTextBlock<BlockID> {
		return {
			...this._build(),
			type: 'rich_text',
			elements: this.elements.map((e) => e.build()),
		}
	}
}

export function richText(...elements: Builder<RichTextBlockElement>[]) {
	return new RichTextBlockBuilder(elements)
}

abstract class StyleableBuilder<T> extends Builder<T> {
	protected _bold?: boolean
	protected _code?: boolean
	protected _italic?: boolean
	protected _strike?: boolean
	protected _underline?: boolean

	bold(bold: boolean = true) {
		this._bold = bold
		return this
	}

	code(code: boolean = true) {
		this._code = code
		return this
	}

	italic(italic: boolean = true) {
		this._italic = italic
		return this
	}

	strike(strike: boolean = true) {
		this._strike = strike
		return this
	}

	underline(underline: boolean = true) {
		this._underline = underline
		return this
	}

	protected override _build() {
		return {
			...super._build(),
			style: {
				bold: this._bold,
				code: this._code,
				italic: this._italic,
				strike: this._strike,
				underline: this._underline,
			},
		}
	}
}

// block elements

export class RichTextSectionBuilder extends Builder<RichTextSection> {
	constructor(private elements: Builder<RichTextElement>[]) {
		super()
	}

	override build(): RichTextSection {
		return { type: 'rich_text_section', elements: this.elements.map((e) => e.build()) }
	}
}

export function section(...elements: (Builder<RichTextElement> | string)[]) {
	return new RichTextSectionBuilder(elements.map((e) => ensureRichTextElement(e)))
}

export class RichTextListBuilder extends Builder<RichTextList> {
	private type: 'bullet' | 'ordered' = 'bullet'
	private _indent?: number
	private _border?: boolean

	constructor(private elements: RichTextSectionBuilder[]) {
		super()
	}

	indent(indent: number) {
		this._indent = indent
		return this
	}

	border(border: boolean = true) {
		this._border = border
		return this
	}

	numbered(numbered: boolean = true) {
		this.type = numbered ? 'ordered' : 'bullet'
		return this
	}

	override build(): RichTextList {
		return {
			type: 'rich_text_list',
			elements: this.elements.map((e) => e.build()),
			style: this.type,
			indent: this._indent,
			border: this._border ? 1 : 0,
		}
	}
}

export function list(...elements: RichTextSectionBuilder[]) {
	return new RichTextListBuilder(elements)
}

export class RichTextQuoteBuilder extends Builder<RichTextQuote> {
	private _border?: boolean

	constructor(private elements: Builder<RichTextElement>[]) {
		super()
	}

	border(border: boolean = true) {
		this._border = border
		return this
	}

	override build(): RichTextQuote {
		return {
			type: 'rich_text_quote',
			elements: this.elements.map((e) => e.build()),
			border: this._border ? 1 : 0,
		}
	}
}

export function quote(...elements: (Builder<RichTextElement> | string)[]) {
	return new RichTextQuoteBuilder(elements.map((e) => ensureRichTextElement(e)))
}

export class RichTextPreformattedBuilder extends Builder<RichTextPreformatted> {
	private _border?: boolean

	constructor(private elements: (RichTextTextBuilder | RichTextLinkBuilder)[]) {
		super()
	}

	border(border: boolean = true) {
		this._border = border
		return this
	}

	override build(): RichTextPreformatted {
		return {
			type: 'rich_text_preformatted',
			elements: this.elements.map((e) => e.build()),
			border: this._border ? 1 : 0,
		}
	}
}

export function pre(...elements: (RichTextTextBuilder | RichTextLinkBuilder)[]) {
	return new RichTextPreformattedBuilder(elements)
}

// elements

export class RichTextBroadcastBuilder extends StyleableBuilder<RichTextBroadcastMention> {
	constructor(private range: 'here' | 'channel' | 'everyone') {
		super()
	}

	override build(): RichTextBroadcastMention {
		return { ...this._build(), type: 'broadcast', range: this.range }
	}
}

export function broadcast(range: 'here' | 'channel' | 'everyone') {
	return new RichTextBroadcastBuilder(range)
}

export class RichTextColorBuilder extends StyleableBuilder<RichTextColor> {
	constructor(private value: string) {
		super()
	}

	override build(): RichTextColor {
		return { ...this._build(), type: 'color', value: this.value }
	}
}

export function color(value: string) {
	return new RichTextColorBuilder(value)
}

export class RichTextChannelBuilder extends StyleableBuilder<RichTextChannelMention> {
	constructor(private channel: string) {
		super()
	}

	override build(): RichTextChannelMention {
		return { ...this._build(), type: 'channel', channel_id: this.channel }
	}
}

export function channel(channel: ChannelRef | Channel | string) {
	return new RichTextChannelBuilder(typeof channel === 'string' ? channel : channel.id)
}

export class RichTextDateBuilder extends StyleableBuilder<RichTextDate> {
	private _url?: string
	private _fallback?: string

	constructor(
		private timestamp: number,
		private format: string,
	) {
		super()
	}

	url(url: string) {
		this._url = url
		return this
	}

	fallback(fallback: string) {
		this._fallback = fallback
		return this
	}

	override build(): RichTextDate {
		return {
			...this._build(),
			type: 'date',
			timestamp: this.timestamp,
			format: this.format,
			url: this._url,
			fallback: this._fallback,
		}
	}
}

export function date(timestamp: Date | number, format: string) {
	return new RichTextDateBuilder(
		typeof timestamp === 'number' ? timestamp : Math.round(timestamp.getTime() / 1000),
		format,
	)
}

export class RichTextEmojiBuilder extends StyleableBuilder<RichTextEmoji> {
	constructor(private name: string) {
		super()
	}

	override build(): RichTextEmoji {
		return { ...this._build(), type: 'emoji', name: this.name }
	}
}

export function emoji(name: string) {
	return new RichTextEmojiBuilder(name)
}

export class RichTextLinkBuilder extends StyleableBuilder<RichTextLink> {
	constructor(
		private url: string,
		private _text?: string,
	) {
		super()
	}

	override build(): RichTextLink {
		return { ...this._build(), type: 'link', text: this._text, url: this.url }
	}
}

export function link(url: string, text?: string) {
	return new RichTextLinkBuilder(url, text)
}

export class RichTextTeamBuilder extends StyleableBuilder<RichTextTeamMention> {
	constructor(private team: string) {
		super()
	}

	override build(): RichTextTeamMention {
		return { ...this._build(), type: 'team', team_id: this.team }
	}
}

export function team(team: string) {
	return new RichTextTeamBuilder(team)
}

export class RichTextTextBuilder extends StyleableBuilder<RichTextText> {
	constructor(private text: string) {
		super()
	}

	override build(): RichTextText {
		return { ...this._build(), type: 'text', text: this.text }
	}
}

export function text(text: string) {
	return new RichTextTextBuilder(text)
}

export class RichTextUserBuilder extends StyleableBuilder<RichTextUserMention> {
	constructor(private user: string) {
		super()
	}

	override build(): RichTextUserMention {
		return { ...this._build(), type: 'user', user_id: this.user }
	}
}

export function user(user: UserRef | User | string) {
	return new RichTextUserBuilder(typeof user === 'string' ? user : user.id)
}

export class RichTextUsergroupBuilder extends StyleableBuilder<RichTextUsergroupMention> {
	constructor(private usergroup: string) {
		super()
	}

	override build(): RichTextUsergroupMention {
		return { ...this._build(), type: 'usergroup', usergroup_id: this.usergroup }
	}
}

export function usergroup(usergroup: string) {
	return new RichTextUsergroupBuilder(usergroup)
}

export function ensureRichTextElement(element: Builder<RichTextElement> | string) {
	return typeof element === 'string' ? text(element) : element
}

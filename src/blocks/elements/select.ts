/*
select(option(...), ...)[.multiple()]
select(optionGroup(...), ...)[.multiple()]
select().conversations()[.multiple()]
select().channels()[.multiple()]
select().users()[.multiple()]
select().dynamic()[.multiple()]
*/

import type {
	ChannelsSelect,
	ColorScheme,
	ConversationsSelect,
	ExternalSelect,
	MultiChannelsSelect,
	MultiConversationsSelect,
	MultiExternalSelect,
	MultiStaticSelect,
	MultiUsersSelect,
	PlainTextElement,
	PlainTextOption,
	StaticSelect,
	UsersSelect,
} from '@slack/types'
import { BlockElementBuilder } from './base'
import { OptionObjectBuilder } from '../objects/option'
import { OptionGroupBuilder } from '../objects/option_group'
import type { Builder } from '../base'
import { ConfirmBuilder, confirm as buildConfirm } from '../objects/confirm'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'
import type { Channel, ChannelRef, User, UserRef } from '../../resources'

type SelectType = 'static' | 'external' | 'users' | 'conversations' | 'channels' | undefined

type OptionsSpecifier =
	| { options: OptionObjectBuilder[]; option_groups?: never }
	| { option_groups: OptionGroupBuilder<OptionObjectBuilder[]>[]; options?: never }
	| undefined

type InferOptionsBuiltType<Options extends OptionsSpecifier> = Options extends undefined
	? never
	: {
			[K in keyof Options]: Options[K] extends unknown[]
				? {
						[Index in keyof Options[K]]: Options[K][Index] extends Builder<infer Output>
							? Output
							: never
					}
				: never
		}

type InferBuiltType<
	Type extends SelectType,
	Multiple extends boolean,
	Options extends OptionsSpecifier,
	ActionID extends string,
> = { action_id: ActionID } & (Multiple extends true
	? {
			static: MultiStaticSelect & InferOptionsBuiltType<Options>
			external: MultiExternalSelect
			users: MultiUsersSelect
			conversations: MultiConversationsSelect
			channels: MultiChannelsSelect
		}[Type & string]
	: {
			static: StaticSelect & InferOptionsBuiltType<Options>
			external: ExternalSelect
			users: UsersSelect
			conversations: ConversationsSelect
			channels: ChannelsSelect
		}[Type & string])

type ExtractValues<Options extends OptionsSpecifier> = Options extends {
	options: OptionObjectBuilder[]
}
	? Options['options'][number] extends Builder<infer Output extends { value: string }>
		? Output['value']
		: never
	: Options extends { option_groups: OptionGroupBuilder<any>[] }
		? Options['option_groups'][number] extends Builder<
				infer Output extends { options: { value: string }[] }
			>
			? Output['options'][number]['value']
			: never
		: never

export type SingleSelectMenuBuilder<ActionID extends string = string> =
	| StaticSelectBuilder<OptionsSpecifier, ActionID>
	| UsersSelectBuilder<ActionID>
	| ConversationsSelectBuilder<ActionID>
	| ChannelsSelectBuilder<ActionID>
	| ExternalSelectBuilder<ActionID>

export type MultiSelectMenuBuilder<ActionID extends string = string> =
	| MultiStaticSelectBuilder<OptionsSpecifier, ActionID>
	| MultiUsersSelectBuilder<ActionID>
	| MultiConversationsSelectBuilder<ActionID>
	| MultiChannelsSelectBuilder<ActionID>
	| MultiExternalSelectBuilder<ActionID>

export type AnySelectMenuBuilder<ActionID extends string = string> =
	| SingleSelectMenuBuilder<ActionID>
	| MultiSelectMenuBuilder<ActionID>

export class SelectBuilder<ActionID extends string = string> extends BlockElementBuilder<
	InferBuiltType<SelectType, boolean, any, ActionID>,
	ActionID
> {
	private _default?: (string | OptionObjectBuilder)[]
	private _confirm?: ConfirmBuilder<true, true, true, true>
	private _autofocus?: boolean
	private _placeholder?: TextObjectBuilder<false>
	private _multiple: boolean = false

	// multi only
	private _max?: number

	// external only
	private _minQueryLength?: number

	// conversations only
	private _defaultCurrent?: boolean
	private _filter?: ConversationsSelect['filter']

	constructor(
		private _type?: SelectType,
		private _options?: OptionsSpecifier,
	) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): SelectBuilder<ActionID> {
		return this._id(actionId)
	}

	users() {
		this._type = 'users'
		return this
	}

	conversations() {
		this._type = 'conversations'
		return this
	}

	channels() {
		this._type = 'channels'
		return this
	}

	dynamic() {
		this._type = 'external'
		return this
	}

	multiple() {
		this._multiple = true
		return this
	}

	minQueryLength(minQueryLength: number) {
		this._minQueryLength = minQueryLength
		return this
	}

	max(maxItems: number) {
		this._max = maxItems
		return this
	}

	confirm(
		confirm:
			| ConfirmBuilder<true, true, true, true>
			| {
					title: string | TextObjectBuilder<false>
					text: string | TextObjectBuilder
					confirm: string | TextObjectBuilder<false>
					deny: string | TextObjectBuilder<false>
					style?: ColorScheme
			  },
	) {
		this._confirm = confirm instanceof ConfirmBuilder ? confirm : buildConfirm(confirm)
		return this
	}

	autofocus(autofocus: boolean = true) {
		this._autofocus = autofocus
		return this
	}

	placeholder(placeholder: string | TextObjectBuilder<false>) {
		this._placeholder = ensureIsTextObjectBuilder(placeholder).plain()
		return this
	}

	default(...values: (string | UserRef | User | ChannelRef | Channel | OptionObjectBuilder)[]) {
		this._default = values.map((v) =>
			typeof v === 'string' ? v : v instanceof OptionObjectBuilder ? v : v.id,
		)
		return this
	}

	override _build() {
		const data = super._build()
		if (this._multiple) {
			return { ...data, max_selected_items: this._max }
		}
		return data
	}

	override build(): any {
		if (!this._type) {
			throw new Error('Select element has unknown type')
		}

		const data = {
			...this._build(),
			confirm: this._confirm?.build(),
			autofocus: this._autofocus,
			placeholder: this._placeholder?.build(),
		}

		if (this._type === 'static') {
			return { ...data, ...this.#buildStatic() } satisfies StaticSelect | MultiStaticSelect
		}

		if (this._multiple) {
			switch (this._type) {
				case 'external':
					return {
						...data,
						type: 'multi_external_select',
						initial_options: (this._default as OptionObjectBuilder[])?.map((o) => o.build()),
						min_query_length: this._minQueryLength,
					} satisfies MultiExternalSelect
				case 'users':
					return {
						...data,
						type: 'multi_users_select',
						initial_users: this._default as string[] | undefined,
					} satisfies MultiUsersSelect
				case 'conversations':
					return {
						...data,
						type: 'multi_conversations_select',
						initial_conversations: this._default as string[] | undefined,
					} satisfies MultiConversationsSelect
				case 'channels':
					return {
						...data,
						type: 'multi_channels_select',
						initial_channels: this._default as string[] | undefined,
					} satisfies MultiChannelsSelect
			}
		} else {
			switch (this._type) {
				case 'external':
					return {
						...data,
						type: 'external_select',
						initial_option: (this._default?.[0] as OptionObjectBuilder | undefined)?.build(),
						min_query_length: this._minQueryLength,
					} satisfies ExternalSelect
				case 'users':
					return {
						...data,
						type: 'users_select',
						initial_user: this._default?.[0] as string | undefined,
					} satisfies UsersSelect
				case 'conversations':
					return {
						...data,
						type: 'conversations_select',
						initial_conversation: this._default?.[0] as string | undefined,
					} satisfies ConversationsSelect
				case 'channels':
					return {
						...data,
						type: 'channels_select',
						initial_channel: this._default?.[0] as string | undefined,
					} satisfies ChannelsSelect
			}
		}
	}

	#buildStatic(): StaticSelect | MultiStaticSelect {
		if (!this._options || (!this._options.options && !this._options.option_groups)) {
			throw new Error('One of options and option_groups is required for static select menus')
		}

		let optionGroups: { label: PlainTextElement; options: PlainTextOption[] }[] | undefined
		let options: PlainTextOption[] | undefined
		let allOptions: PlainTextOption[]
		if (this._options.options) {
			options = this._options.options.map((o) => o.build())
			allOptions = options
		} else {
			optionGroups = this._options.option_groups.map((o) => o.build())
			allOptions = optionGroups.flatMap((o) => o.options)
		}

		const optionsData = this._options.options
			? { options: this._options.options.map((o) => o.build()) }
			: { option_groups: this._options.option_groups.map((o) => o.build()) }

		const defaultData = this._multiple
			? {
					initial_options: this._default
						? this._default
								.map((v) => allOptions.find((o) => o.value === v))
								.filter((o) => o !== undefined)
						: undefined,
				}
			: {
					initial_option: this._default?.[0]
						? allOptions.find((o) => o.value === this._default![0])
						: undefined,
				}

		return {
			type: this._multiple ? 'multi_static_select' : 'static_select',
			...optionsData,
			...defaultData,
		}
	}
}

interface SelectBuilderBase {
	/**
	 * Adds a confirmation dialog when the user interacts with this element.
	 *
	 * @param confirm A confirmation builder or configuration object
	 * @returns This builder
	 */
	confirm(
		confirm:
			| ConfirmBuilder<true, true, true, true>
			| {
					title: string | TextObjectBuilder<false>
					text: string | TextObjectBuilder
					confirm: string | TextObjectBuilder<false>
					deny: string | TextObjectBuilder<false>
					style?: ColorScheme
			  },
	): this

	autofocus(autofocus?: boolean): this

	placeholder(placeholder: string | TextObjectBuilder<false>): this
}

interface UndecidedSelectBuilder extends SelectBuilderBase {
	users(): UsersSelectBuilder
	conversations(): ConversationsSelectBuilder
	channels(): ChannelsSelectBuilder
	dynamic(): ExternalSelectBuilder
	multiple(): MultiUndecidedSelectBuilder
}

interface MultiUndecidedSelectBuilder extends SelectBuilderBase {
	users(): MultiUsersSelectBuilder
	conversations(): MultiConversationsSelectBuilder
	channels(): MultiChannelsSelectBuilder
	dynamic(): MultiExternalSelectBuilder
}

export interface StaticSelectBuilder<
	Options extends OptionsSpecifier,
	ActionID extends string = string,
>
	extends
		BlockElementBuilder<InferBuiltType<'static', false, Options, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): StaticSelectBuilder<Options, ActionID>
	default(value: ExtractValues<Options>): this
	multiple(): MultiStaticSelectBuilder<Options, ActionID>
}

export interface MultiStaticSelectBuilder<
	Options extends OptionsSpecifier,
	ActionID extends string = string,
>
	extends
		BlockElementBuilder<InferBuiltType<'static', true, Options, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): MultiStaticSelectBuilder<Options, ActionID>
	default(...values: ExtractValues<Options>[]): this
}

export interface UsersSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'users', false, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): UsersSelectBuilder<ActionID>
	default(user: User | UserRef | string): this
}

export interface MultiUsersSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'users', true, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): MultiUsersSelectBuilder<ActionID>
	default(...users: (User | UserRef | string)[]): this
}

export interface ConversationsSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'conversations', false, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): ConversationsSelectBuilder<ActionID>
	default(conversation: Channel | ChannelRef | string): this
}

export interface MultiConversationsSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'conversations', true, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): MultiConversationsSelectBuilder<ActionID>
	default(...conversations: (Channel | ChannelRef | string)[]): this
}

export interface ChannelsSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'channels', false, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): ChannelsSelectBuilder<ActionID>
	default(channel: Channel | ChannelRef | string): this
}

export interface MultiChannelsSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'channels', true, undefined, ActionID>, ActionID>,
		SelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): MultiChannelsSelectBuilder<ActionID>
	default(...channels: (Channel | ChannelRef | string)[]): this
}

interface ExternalSelectBuilderBase extends SelectBuilderBase {
	minQueryLength(minQueryLength: number): this
}

export interface ExternalSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'external', false, undefined, ActionID>, ActionID>,
		ExternalSelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): ExternalSelectBuilder<ActionID>
	default(option: OptionObjectBuilder): this
}

export interface MultiExternalSelectBuilder<ActionID extends string = string>
	extends
		BlockElementBuilder<InferBuiltType<'external', true, undefined, ActionID>, ActionID>,
		ExternalSelectBuilderBase {
	id<ActionID extends string>(actionId: ActionID): MultiExternalSelectBuilder<ActionID>
	default(...options: OptionObjectBuilder[]): this
}

export function select(): UndecidedSelectBuilder

export function select<Options extends OptionObjectBuilder[]>(
	...options: Options
): StaticSelectBuilder<{ options: Options }>

export function select<OptionGroups extends OptionGroupBuilder<any>[]>(
	...optionGroups: OptionGroups
): StaticSelectBuilder<{ option_groups: OptionGroups }>

export function select(...options: OptionObjectBuilder[] | OptionGroupBuilder<any>[]) {
	if (!options.length) {
		return new SelectBuilder(undefined, undefined) as UndecidedSelectBuilder
	}
	if (options[0]! instanceof OptionObjectBuilder) {
		return new SelectBuilder('static', {
			options: options as OptionObjectBuilder[],
		}) as StaticSelectBuilder<any, string>
	} else {
		return new SelectBuilder('static', {
			option_groups: options as OptionGroupBuilder<any>[],
		}) as StaticSelectBuilder<any, string>
	}
}

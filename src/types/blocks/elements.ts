/** Block kit elements, as documented on https://docs.slack.dev/reference/block-kit/block-elements. */

import type {
	Button,
	ChannelsSelect,
	Checkboxes,
	ColorScheme,
	ConversationsSelect,
	Datepicker,
	DateTimepicker,
	EmailInput,
	ExternalSelect,
	FeedbackButtons,
	FileInput,
	IconButton,
	ImageElement as Image,
	MultiChannelsSelect,
	MultiConversationsSelect,
	MultiExternalSelect,
	MultiStaticSelect,
	MultiUsersSelect,
	NumberInput,
	Overflow,
	PlainTextInput,
	RadioButtons,
	RichTextInput,
	StaticSelect,
	Timepicker,
	URLInput,
	UsersSelect,
	WorkflowButton,
} from '@slack/types'

import type { File } from '../objects/file'
import type { RichTextBlock } from './blocks'
import type { MrkdwnObject, PlainTextObject, PlainTextOptionObject } from './objects'

/** An option in checkboxes or radio buttons. Its `text` and `description` can also be `mrkdwn`. */
export interface CheckboxOptionObject extends Omit<
	PlainTextOptionObject,
	'text' | 'description' | 'url'
> {
	text: PlainTextObject | MrkdwnObject
	description?: PlainTextObject | MrkdwnObject
}

export interface Element<Type extends string = string> {
	type: Type
	action_id?: string
}

export interface Action<Type extends string = string> {
	type: Type
	block_id: string
	action_id: string
	action_ts: string
}

export interface Value<Type extends string = string> {
	type: Type
}

/** {@inheritDoc @slack/types#Button} */
export interface ButtonElement extends Button {
	/** User IDs that can see this button. Defaults to all users. */
	visible_to_user_ids?: string[]

	/** A prompt sent to Slackbot when the button is clicked. Up to 4000 characters. */
	agent_prompt?: string

	/**
	 * Short text shown to the user in the Slackbot message. The user can still expand to read the
	 * full prompt. Defaults to the button's text.
	 */
	agent_prompt_display?: string
}

export interface ButtonAction
	extends
		Action<ButtonElement['type']>,
		Pick<
			ButtonElement,
			'confirm' | 'text' | 'value' | 'style' | 'agent_prompt' | 'agent_prompt_display'
		> {}

/** {@inheritDoc @slack/types#ChannelsSelect} */
export interface ChannelsSelectElement extends ChannelsSelect {}

export interface ChannelsSelectValue
	extends
		Value<ChannelsSelectElement['type']>,
		Pick<ChannelsSelectElement, 'response_url_enabled'> {
	selected_channel: string | null
}

export interface ChannelsSelectAction
	extends
		Action<ChannelsSelect['type']>,
		ChannelsSelectValue,
		Pick<ChannelsSelectElement, 'initial_channel' | 'confirm'> {}

/** {@inheritDoc @slack/types#Checkboxes} */
export interface CheckboxesElement extends Omit<Checkboxes, 'options' | 'initial_options'> {
	/** {@inheritDoc @slack/types#Checkboxes.options} */
	options: CheckboxOptionObject[]

	/** {@inheritDoc @slack/types#Checkboxes.initial_options} */
	initial_options?: CheckboxOptionObject[]

	/** User IDs that can see this checkboxes element. Defaults to all users. */
	visible_to_user_ids?: string[]
}

export interface CheckboxesValue extends Value<Checkboxes['type']> {
	selected_options: CheckboxOptionObject[]
}

export interface CheckboxesAction
	extends Action<Checkboxes['type']>, CheckboxesValue, Pick<CheckboxesElement, 'confirm'> {}

/** {@inheritDoc @slack/types#ConversationsSelect} */
export interface ConversationsSelectElement extends ConversationsSelect {}

export interface ConversationsSelectValue
	extends
		Value<ConversationsSelect['type']>,
		Pick<ConversationsSelectElement, 'response_url_enabled'> {
	selected_conversation: string | null
}

export interface ConversationsSelectAction
	extends
		Action<ConversationsSelect['type']>,
		ConversationsSelectValue,
		Pick<ConversationsSelectElement, 'initial_conversation' | 'confirm'> {}

/** {@inheritDoc @slack/types#Datepicker} */
export interface DatepickerElement extends Datepicker {}

export interface DatepickerValue extends Value<Datepicker['type']> {
	selected_date: string | null
}

export interface DatepickerAction
	extends
		Action<Datepicker['type']>,
		DatepickerValue,
		Pick<DatepickerElement, 'initial_date' | 'confirm'> {}

/** {@inheritDoc @slack/types#DateTimepicker} */
export interface DatetimepickerElement extends DateTimepicker {}

export interface DatetimepickerValue extends Value<DateTimepicker['type']> {
	selected_date_time: number | null
}

export interface DatetimepickerAction
	extends
		Action<DateTimepicker['type']>,
		DatetimepickerValue,
		Pick<DatetimepickerElement, 'initial_date_time' | 'confirm'> {}

/** {@inheritDoc @slack/types#EmailInput} */
export interface EmailTextInputElement extends EmailInput {}

export interface EmailTextInputValue extends Value<EmailInput['type']> {
	value?: string // may be an empty string
}

export interface EmailTextInputAction extends Action<EmailInput['type']>, EmailTextInputValue {
	value: string // may be an empty string
}

/** {@inheritDoc @slack/types#ExternalSelect} */
export interface ExternalSelectElement extends ExternalSelect {}

export interface ExternalSelectValue extends Value<ExternalSelect['type']> {
	selected_option: PlainTextOptionObject | null
}

export interface ExternalSelectAction
	extends
		Action<ExternalSelect['type']>,
		ExternalSelectValue,
		Pick<ExternalSelectElement, 'initial_option' | 'placeholder' | 'confirm'> {}

/** {@inheritDoc @slack/types#FeedbackButtons} */
export interface FeedbackButtonsElement extends FeedbackButtons {}

export interface FeedbackButtonsAction extends Action<FeedbackButtons['type']> {
	/** The `text` of the clicked button. */
	text: PlainTextObject

	/** The `value` of the clicked button. */
	value: string
}

/** {@inheritDoc @slack/types#FileInput} */
export interface FileInputElement extends FileInput {}

export interface FileInputValue extends Value<FileInput['type']> {
	files: File[]
}

// doesn't seem to exist...?
// export interface FileInputAction
// 	extends Action<FileInput['type']>, FileInputValue, Pick<FileInputElement, never> {}

/** {@inheritDoc @slack/types#IconButton} */
export interface IconButtonElement extends IconButton {}

export interface IconButtonAction
	extends
		Action<IconButton['type']>,
		Pick<IconButtonElement, 'icon' | 'text' | 'value' | 'confirm'> {}

/** {@inheritDoc @slack/types#ImageElement} */
export type ImageElement = Image & {}

/** {@inheritDoc @slack/types#MultiChannelsSelect} */
export interface MultiChannelsSelectElement extends MultiChannelsSelect {}

export interface MultiChannelsSelectValue extends Value<MultiChannelsSelect['type']> {
	selected_channels: string[]
}

export interface MultiChannelsSelectAction
	extends
		Action<MultiChannelsSelect['type']>,
		MultiChannelsSelectValue,
		Pick<MultiChannelsSelectElement, 'initial_channels' | 'confirm'> {}

/** {@inheritDoc @slack/types#MultiConversationsSelect} */
export interface MultiConversationsSelectElement extends MultiConversationsSelect {}

export interface MultiConversationsSelectValue extends Value<MultiConversationsSelect['type']> {
	selected_conversations: string[]
}

export interface MultiConversationsSelectAction
	extends
		Action<MultiConversationsSelect['type']>,
		MultiConversationsSelectValue,
		Pick<MultiConversationsSelectElement, 'initial_conversations' | 'confirm'> {}

/** {@inheritDoc @slack/types#MultiExternalSelect} */
export interface MultiExternalSelectElement extends Omit<MultiExternalSelect, 'focus_on_load'> {}

export interface MultiExternalSelectValue extends Value<MultiExternalSelect['type']> {
	selected_options: PlainTextOptionObject[]
}

export interface MultiExternalSelectAction
	extends
		Action<MultiExternalSelect['type']>,
		MultiExternalSelectValue,
		Pick<MultiExternalSelectElement, 'initial_options' | 'placeholder' | 'confirm'> {}

/** {@inheritDoc @slack/types#MultiStaticSelect} */
export interface MultiStaticSelectElement extends MultiStaticSelect {}

export interface MultiStaticSelectValue extends Value<MultiStaticSelect['type']> {
	selected_options: PlainTextOptionObject[]
}

export interface MultiStaticSelectAction
	extends
		Action<MultiStaticSelect['type']>,
		MultiStaticSelectValue,
		Pick<MultiStaticSelectElement, 'initial_options' | 'placeholder' | 'confirm'> {}

/** {@inheritDoc @slack/types#MultiUsersSelect} */
export interface MultiUsersSelectElement extends MultiUsersSelect {}

export interface MultiUsersSelectValue extends Value<MultiUsersSelect['type']> {
	selected_users: string[]
}

export interface MultiUsersSelectAction
	extends
		Action<MultiUsersSelect['type']>,
		MultiUsersSelectValue,
		Pick<MultiUsersSelectElement, 'initial_users' | 'confirm'> {}

/** {@inheritDoc @slack/types#NumberInput} */
export interface NumberInputElement extends NumberInput {}

export interface NumberInputValue extends Value<NumberInput['type']> {
	value?: string | null
}

export interface NumberInputAction extends Action<NumberInput['type']>, NumberInputValue {
	value: string | null
}

/** {@inheritDoc @slack/types#Overflow} */
export interface OverflowElement extends Overflow {}

export interface OverflowAction extends Action<Overflow['type']>, Pick<OverflowElement, 'confirm'> {
	selected_option: PlainTextOptionObject
}

/** {@inheritDoc @slack/types#PlainTextInput} */
export interface PlainTextInputElement extends PlainTextInput {}

export interface PlainTextInputValue extends Value<PlainTextInput['type']> {
	value: string | null
}

export interface PlainTextInputAction
	extends
		Action<PlainTextInput['type']>,
		PlainTextInputValue,
		Pick<PlainTextInputElement, 'initial_value'> {}

/** {@inheritDoc @slack/types#RadioButtons} */
export interface RadioButtonsElement extends Omit<RadioButtons, 'options' | 'initial_option'> {
	options: CheckboxOptionObject[]
	initial_option?: CheckboxOptionObject
}

export interface RadioButtonsValue extends Value<RadioButtons['type']> {
	selected_option: CheckboxOptionObject | null
}

export interface RadioButtonsAction
	extends
		Action<RadioButtons['type']>,
		RadioButtonsValue,
		Pick<RadioButtonsElement, 'initial_option' | 'confirm'> {}

/** {@inheritDoc @slack/types#RichTextInput} */
export interface RichTextInputElement extends RichTextInput {}

export interface RichTextInputValue extends Value<RichTextInput['type']> {
	rich_text_value?: RichTextBlock
}

export interface RichTextInputAction
	extends
		Action<RichTextInput['type']>,
		Omit<RichTextInputValue, 'rich_text_value'>,
		Pick<RichTextInputElement, never> {
	rich_text_value: RichTextBlock | null
}

/** {@inheritDoc @slack/types#StaticSelect} */
export interface StaticSelectElement extends StaticSelect {}

export interface StaticSelectValue extends Value<StaticSelect['type']> {
	selected_option: PlainTextOptionObject | null
}

export interface StaticSelectAction
	extends
		Action<StaticSelect['type']>,
		StaticSelectValue,
		Pick<StaticSelectElement, 'initial_option' | 'placeholder' | 'confirm'> {}

/** {@inheritDoc @slack/types#Timepicker} */
export interface TimepickerElement extends Timepicker {}

export interface TimepickerValue extends Value<Timepicker['type']> {
	selected_time: string | null
	timezone?: string
}

export interface TimepickerAction
	extends
		Action<Timepicker['type']>,
		TimepickerValue,
		Pick<TimepickerElement, 'initial_time' | 'timezone' | 'confirm'> {}

/** {@inheritDoc @slack/types#URLInput} */
export interface URLTextInputElement extends URLInput {}

export interface URLTextInputValue extends Value<URLInput['type']> {
	value?: string // may be empty string
}

export interface URLTextInputAction extends Action<URLInput['type']>, URLTextInputValue {
	value: string
}

/** {@inheritDoc @slack/types#UsersSelect} */
export interface UsersSelectElement extends UsersSelect {}

export interface UsersSelectValue extends Value<UsersSelect['type']> {
	selected_user: string | null
}

export interface UsersSelectAction
	extends
		Action<UsersSelect['type']>,
		UsersSelectValue,
		Pick<UsersSelectElement, 'initial_user' | 'confirm'> {}

/** {@inheritDoc @slack/types#WorkflowButton} */
export interface WorkflowButtonElement extends Omit<WorkflowButton, 'confirm'> {}

export type { ColorScheme as ButtonStyle }

/** All known elements in this version of `slack.ts`. */
export type KnownElement =
	| ButtonElement
	| ChannelsSelectElement
	| CheckboxesElement
	| ConversationsSelectElement
	| DatepickerElement
	| DatetimepickerElement
	| EmailTextInputElement
	| ExternalSelectElement
	| FeedbackButtonsElement
	| FileInputElement
	| IconButtonElement
	| ImageElement
	| MultiChannelsSelectElement
	| MultiConversationsSelectElement
	| MultiExternalSelectElement
	| MultiStaticSelectElement
	| MultiUsersSelectElement
	| NumberInputElement
	| OverflowElement
	| PlainTextInputElement
	| RadioButtonsElement
	| RichTextInputElement
	| StaticSelectElement
	| TimepickerElement
	| URLTextInputElement
	| UsersSelectElement
	| WorkflowButtonElement

export type KnownAction =
	| ButtonAction
	| ChannelsSelectAction
	| CheckboxesAction
	| ConversationsSelectAction
	| DatepickerAction
	| DatetimepickerAction
	| EmailTextInputAction
	| ExternalSelectAction
	| FeedbackButtonsAction
	| IconButtonAction
	| MultiChannelsSelectAction
	| MultiConversationsSelectAction
	| MultiExternalSelectAction
	| MultiStaticSelectAction
	| MultiUsersSelectAction
	| NumberInputAction
	| OverflowAction
	| PlainTextInputAction
	| RadioButtonsAction
	| RichTextInputAction
	| StaticSelectAction
	| TimepickerAction
	| URLTextInputAction
	| UsersSelectAction

export type KnownValue =
	| ChannelsSelectValue
	| CheckboxesValue
	| ConversationsSelectValue
	| DatepickerValue
	| DatetimepickerValue
	| EmailTextInputValue
	| ExternalSelectValue
	| FileInputValue
	| MultiChannelsSelectValue
	| MultiConversationsSelectValue
	| MultiExternalSelectValue
	| MultiStaticSelectValue
	| MultiUsersSelectValue
	| NumberInputValue
	| PlainTextInputValue
	| RadioButtonsValue
	| RichTextInputValue
	| StaticSelectValue
	| TimepickerValue
	| URLTextInputValue
	| UsersSelectValue

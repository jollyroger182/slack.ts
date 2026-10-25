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
	FileInput,
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

export interface ChannelsSelectValue extends Value<ChannelsSelectElement['type']> {}

export interface ChannelsSelectAction
	extends
		Action<ChannelsSelect['type']>,
		Pick<ChannelsSelectElement, 'initial_channel' | 'response_url_enabled'> {
	selected_channel: string
}

/** {@inheritDoc @slack/types#Checkboxes} */
export interface CheckboxesElement extends Checkboxes {}

export interface CheckboxesValue extends Value<Checkboxes['type']> {}

export interface CheckboxesAction
	extends Action<Checkboxes['type']>, Pick<CheckboxesElement, never> {}

/** {@inheritDoc @slack/types#ConversationsSelect} */
export interface ConversationsSelectElement extends ConversationsSelect {}

export interface ConversationsSelectValue extends Value<ConversationsSelect['type']> {}

export interface ConversationsSelectAction
	extends Action<ConversationsSelect['type']>, Pick<ConversationsSelectElement, never> {}

/** {@inheritDoc @slack/types#Datepicker} */
export interface DatepickerElement extends Datepicker {}

export interface DatepickerValue extends Value<Datepicker['type']> {}

export interface DatepickerAction
	extends Action<Datepicker['type']>, Pick<DatepickerElement, never> {}

/** {@inheritDoc @slack/types#DateTimepicker} */
export interface DateTimepickerElement extends DateTimepicker {}

export interface DateTimepickerValue extends Value<DateTimepicker['type']> {}

export interface DateTimepickerAction
	extends Action<DateTimepicker['type']>, Pick<DateTimepickerElement, never> {}

/** {@inheritDoc @slack/types#EmailInput} */
export interface EmailInputElement extends EmailInput {}

export interface EmailInputValue extends Value<EmailInput['type']> {}

export interface EmailInputAction
	extends Action<EmailInput['type']>, Pick<EmailInputElement, never> {}

/** {@inheritDoc @slack/types#ExternalSelect} */
export interface ExternalSelectElement extends ExternalSelect {}

export interface ExternalSelectValue extends Value<ExternalSelect['type']> {}

export interface ExternalSelectAction
	extends Action<ExternalSelect['type']>, Pick<ExternalSelectElement, never> {}

/** {@inheritDoc @slack/types#FileInput} */
export interface FileInputElement extends FileInput {}

export interface FileInputValue extends Value<FileInput['type']> {}

export interface FileInputAction extends Action<FileInput['type']>, Pick<FileInputElement, never> {}

/** {@inheritDoc @slack/types#ImageElement} */
export type ImageElement = Image & {}

export interface ImageValue extends Value<Image['type']> {}

export interface ImageAction extends Action<Image['type']>, Pick<ImageElement, never> {}

/** {@inheritDoc @slack/types#MultiChannelsSelect} */
export interface MultiChannelsSelectElement extends MultiChannelsSelect {}

export interface MultiChannelsSelectValue extends Value<MultiChannelsSelect['type']> {}

export interface MultiChannelsSelectAction
	extends Action<MultiChannelsSelect['type']>, Pick<MultiChannelsSelectElement, never> {}

/** {@inheritDoc @slack/types#MultiConversationsSelect} */
export interface MultiConversationsSelectElement extends MultiConversationsSelect {}

export interface MultiConversationsSelectValue extends Value<MultiConversationsSelect['type']> {}

export interface MultiConversationsSelectAction
	extends Action<MultiConversationsSelect['type']>, Pick<MultiConversationsSelectElement, never> {}

/** {@inheritDoc @slack/types#MultiExternalSelect} */
export interface MultiExternalSelectElement extends MultiExternalSelect {}

export interface MultiExternalSelectValue extends Value<MultiExternalSelect['type']> {}

export interface MultiExternalSelectAction
	extends Action<MultiExternalSelect['type']>, Pick<MultiExternalSelectElement, never> {}

/** {@inheritDoc @slack/types#MultiStaticSelect} */
export interface MultiStaticSelectElement extends MultiStaticSelect {}

export interface MultiStaticSelectValue extends Value<MultiStaticSelect['type']> {}

export interface MultiStaticSelectAction
	extends Action<MultiStaticSelect['type']>, Pick<MultiStaticSelectElement, never> {}

/** {@inheritDoc @slack/types#MultiUsersSelect} */
export interface MultiUsersSelectElement extends MultiUsersSelect {}

export interface MultiUsersSelectValue extends Value<MultiUsersSelect['type']> {}

export interface MultiUsersSelectAction
	extends Action<MultiUsersSelect['type']>, Pick<MultiUsersSelectElement, never> {}

/** {@inheritDoc @slack/types#NumberInput} */
export interface NumberInputElement extends NumberInput {}

export interface NumberInputValue extends Value<NumberInput['type']> {}

export interface NumberInputAction
	extends Action<NumberInput['type']>, Pick<NumberInputElement, never> {}

/** {@inheritDoc @slack/types#Overflow} */
export interface OverflowElement extends Overflow {}

export interface OverflowValue extends Value<Overflow['type']> {}

export interface OverflowAction extends Action<Overflow['type']>, Pick<OverflowElement, never> {}

/** {@inheritDoc @slack/types#PlainTextInput} */
export interface PlainTextInputElement extends PlainTextInput {}

export interface PlainTextInputValue extends Value<PlainTextInput['type']> {}

export interface PlainTextInputAction
	extends Action<PlainTextInput['type']>, Pick<PlainTextInputElement, never> {}

/** {@inheritDoc @slack/types#RadioButtons} */
export interface RadioButtonsElement extends RadioButtons {}

export interface RadioButtonsValue extends Value<RadioButtons['type']> {}

export interface RadioButtonsAction
	extends Action<RadioButtons['type']>, Pick<RadioButtonsElement, never> {}

/** {@inheritDoc @slack/types#RichTextInput} */
export interface RichTextInputElement extends RichTextInput {}

export interface RichTextInputValue extends Value<RichTextInput['type']> {}

export interface RichTextInputAction
	extends Action<RichTextInput['type']>, Pick<RichTextInputElement, never> {}

/** {@inheritDoc @slack/types#StaticSelect} */
export interface StaticSelectElement extends StaticSelect {}

export interface StaticSelectValue extends Value<StaticSelect['type']> {}

export interface StaticSelectAction
	extends Action<StaticSelect['type']>, Pick<StaticSelectElement, never> {}

/** {@inheritDoc @slack/types#Timepicker} */
export interface TimepickerElement extends Timepicker {}

export interface TimepickerValue extends Value<Timepicker['type']> {}

export interface TimepickerAction
	extends Action<Timepicker['type']>, Pick<TimepickerElement, never> {}

/** {@inheritDoc @slack/types#URLInput} */
export interface URLInputElement extends URLInput {}

export interface URLInputValue extends Value<URLInput['type']> {}

export interface URLInputAction extends Action<URLInput['type']>, Pick<URLInputElement, never> {}

/** {@inheritDoc @slack/types#UsersSelect} */
export interface UsersSelectElement extends UsersSelect {}

export interface UsersSelectValue extends Value<UsersSelect['type']> {}

export interface UsersSelectAction
	extends Action<UsersSelect['type']>, Pick<UsersSelectElement, never> {}

/** {@inheritDoc @slack/types#WorkflowButton} */
export interface WorkflowButtonElement extends WorkflowButton {}

export interface WorkflowButtonValue extends Value<WorkflowButton['type']> {}

export interface WorkflowButtonAction
	extends Action<WorkflowButton['type']>, Pick<WorkflowButtonElement, never> {}

export type { ColorScheme as ButtonStyle }

/** All known elements in this version of `slack.ts`. */
export type KnownElement =
	| ButtonElement
	| ChannelsSelectElement
	| Checkboxes
	| ConversationsSelect
	| Datepicker
	| DateTimepicker
	| EmailInput
	| ExternalSelect
	| FileInput
	| ImageElement
	| MultiChannelsSelect
	| MultiConversationsSelect
	| MultiExternalSelect
	| MultiStaticSelect
	| MultiUsersSelect
	| NumberInput
	| Overflow
	| PlainTextInput
	| RadioButtons
	| RichTextInput
	| StaticSelect
	| Timepicker
	| URLInput
	| UsersSelect
	| WorkflowButton

export type KnownAction = ButtonAction

export type KnownValue = never

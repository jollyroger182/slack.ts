import type { PlainTextOption } from '@slack/types'
import type { File } from './file'

export interface ChannelsSelectValue {
	type: 'channels_select'
	selected_channel: string
}

export interface CheckboxesValue {
	type: 'checkboxes'
	selected_options: PlainTextOption[]
}

export interface ConversationsSelectValue {
	type: 'conversations_select'
	selected_conversation: string
}

export interface DatePickerValue {
	type: 'datepicker'
	selected_date: string
}

export interface DatetimePickerValue {
	type: 'datetimepicker'
	selected_date_time: number
}

export interface EmailInputValue {
	type: 'email_text_input'
	value: string
}

export interface FileInputValue {
	type: 'file_input'
	files: File[]
}

export interface MultiStaticSelectValue {
	type: 'multi_static_select'
	selected_options: PlainTextOption[]
}

export interface PlainTextInputValue {
	type: 'plain_text_input'
	value: string
}

export interface RadioValue {
	type: 'radio_buttons'
	selected_option: PlainTextOption
}

export interface StaticSelectValue {
	type: 'static_select'
	selected_option: PlainTextOption
}

export type StateValue =
	| CheckboxesValue
	| DatePickerValue
	| DatetimePickerValue
	| EmailInputValue
	| FileInputValue
	| PlainTextInputValue
	| StaticSelectValue

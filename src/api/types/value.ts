import type { PlainTextOption } from '@slack/types'
import type { File } from './file'

export interface CheckboxesValue {
	type: 'checkboxes'
	selected_options: PlainTextOption[]
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

export interface PlainTextInputValue {
	type: 'plain_text_input'
	value: string
}

export type StateValue =
	| CheckboxesValue
	| DatePickerValue
	| DatetimePickerValue
	| EmailInputValue
	| FileInputValue
	| PlainTextInputValue

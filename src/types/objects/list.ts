import type { RichTextBlock } from '../blocks/blocks'

export interface ListMetadata {
	schema: ListColumn[]
	subtask_schema: ListColumn[]
	views: ListView[]
	integrations: unknown[] // TODO
	icon?: string
	description?: string
	description_blocks?: RichTextBlock[]
	is_trial?: boolean
	creation_source: unknown
	todo_mode?: boolean
	default_view?: string
}

export interface ListView {
	id: string
	name: string
	type: 'record' | 'table' | 'board' | (string & {})
	is_locked: boolean
	position: string
	columns: ListViewColumn[]
	date_created: number
	created_by: string
	sorts?: ListViewSort[]
	filters?: ListViewFilter[]
	info_column_filters?: unknown[]
	grouping?: { group_by: string; group_by_column_id: string }
	stick_column_left?: boolean
	is_all_items_view?: boolean
	default_view_key?: string
	show_completed_items?: boolean
}

export interface ListViewColumn {
	visible: boolean
	key: string
	id: string
	position: string
	width?: number
	should_wrap_text?: boolean
}

export interface ListViewSort {
	key: string
	column_id: string
	ascending: boolean
}

export interface ListViewFilter {
	key: string
	column_id: string
	operator:
		| 'equal'
		| 'not_equal'
		| 'less_than'
		| 'greater_than'
		| 'contains'
		| 'does_not_contain'
		| 'is_empty'
		| 'is_not_empty'
		| (string & {})
	// values are OR'd
	values: string[]
	typed_values: unknown[]
}

interface ListColumnBase<Type extends string = string> {
	type: Type
	id: string
	key: string
	name: string
	is_primary_column?: boolean
	options?: Record<string, unknown>
}

export interface ListColumnText extends ListColumnBase<'text'> {}

export interface ListColumnMessage extends ListColumnBase<'message'> {}

export interface ListColumnNumber extends ListColumnBase<'number'> {
	options?: { precision?: number }
}

export type ListChoiceColor =
	| 'indigo'
	| 'blue'
	| 'cyan'
	| 'pink'
	| 'yellow'
	| 'green'
	| 'gray'
	| 'red'
	| 'purple'
	| 'orange'
	| 'brown'

export interface ListColumnSelect extends ListColumnBase<'select'> {
	options?: {
		format?: 'single_select' | 'multi_select'
		choices?: { value: string; label: string; color: ListChoiceColor }[]
	}
}

export interface ListColumnDate extends ListColumnBase<'date'> {
	options?: {
		format?: 'single'
		date_format?:
			'default' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'MMMM DD, YYYY' | 'DD MMMM YYYY'
	}
}

export interface ListColumnUser extends ListColumnBase<'user'> {
	options?: {
		format?: 'single_entity' | 'multi_entity'
		/** Joined by `|` when there are multiple */
		default_value?: string | null
		default_value_typed?: { user: string[] }
		show_member_name?: boolean
		notify_users?: boolean
	}
}

export interface ListColumnAttachment extends ListColumnBase<'attachment'> {}

export interface ListColumnCheckbox extends ListColumnBase<'checkbox'> {}

export interface ListColumnEmail extends ListColumnBase<'email'> {}

export interface ListColumnPhone extends ListColumnBase<'phone'> {}

export interface ListColumnChannel extends ListColumnBase<'channel'> {
	options?: {
		format?: 'single_entity' | 'multi_entity'
		/** Joined by `|` when there are multiple */
		default_value?: string | null
		default_value_typed?: { channel: string[] }
		show_member_name?: boolean
	}
}

export interface ListColumnRating extends ListColumnBase<'rating'> {
	options?: {
		emoji?: string
		max?: number
		emoji_team_id?: string
		emoji_url?: string
	}
}

export interface ListColumnCreatedBy extends ListColumnBase<'created_by'> {}

export interface ListColumnLastEditedBy extends ListColumnBase<'last_edited_by'> {}

export interface ListColumnCreatedTime extends ListColumnBase<'created_time'> {}

export interface ListColumnLastEditedTime extends ListColumnBase<'last_edited_time'> {}

export interface ListColumnVote extends ListColumnBase<'vote'> {
	options?: {
		emoji?: string
		emoji_team_id?: string
		emoji_url?: string
	}
}

export interface ListColumnCanvas extends ListColumnBase<'canvas'> {
	options?: {
		format?: 'single_entity'
		default_value?: null
		show_member_name?: true
	}
}

export interface ListColumnLink extends ListColumnBase<'link'> {}

export interface ListColumnTodoCompleted extends ListColumnBase<'todo_completed'> {}

export interface ListColumnTodoAssignee extends ListColumnBase<'todo_assignee'> {
	options?: {
		format?: 'single_entity' | 'multi_entity'
		/** Joined by `|` when there are multiple */
		default_value?: string | null
		default_value_typed?: { user: string[] }
		show_member_name?: boolean
	}
}

export interface ListColumnTodoDueDate extends ListColumnBase<'todo_due_date'> {}

export type ListColumnCreatable =
	| ListColumnText
	| ListColumnMessage
	| ListColumnNumber
	| ListChoiceColor
	| ListColumnSelect
	| ListColumnDate
	| ListColumnUser
	| ListColumnAttachment
	| ListColumnCheckbox
	| ListColumnEmail
	| ListColumnPhone
	| ListColumnChannel
	| ListColumnRating
	| ListColumnCreatedBy
	| ListColumnLastEditedBy
	| ListColumnCreatedTime
	| ListColumnLastEditedTime
	| ListColumnVote
	| ListColumnCanvas
	| ListColumnLink

export type ListColumn =
	ListColumnCreatable | ListColumnTodoCompleted | ListColumnTodoAssignee | ListColumnTodoDueDate

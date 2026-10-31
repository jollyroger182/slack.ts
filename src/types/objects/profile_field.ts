export interface ProfileField {
	id: string
	ordering: number
	field_name: string
	label: string
	hint: string
	type: 'text' | 'options_list' | 'long_text' | 'date' | 'user' | 'tags' | 'link' | 'file'
	/** The configured options for a field. Only possible for `options_list` fields. */
	possible_values: string[] | null
	options: { is_scim: boolean; is_protected: boolean }
	is_hidden: boolean
	section_id: string
}

export interface EmojiListParams {
	/** Include a list of categories for Unicode emoji and the emoji in each category */
	include_categories?: boolean
}

export interface EmojiListResponse {
	emoji: Record<string, string>
	cache_ts: string
	categories_version?: string
	categories?: { name: string; emoji_names: string[] }[]
}

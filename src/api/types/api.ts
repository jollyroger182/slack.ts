export interface CursorPaginationParams {
	/**
	 * Paginate through collections of data by setting the cursor parameter to a next_cursor attribute
	 * returned by a previous request's response_metadata. Default value fetches the first "page" of
	 * the collection.
	 */
	cursor?: string

	/**
	 * The maximum number of items to return. Fewer than the requested number of items may be
	 * returned, even if the end of the list hasn't been reached.
	 */
	limit?: number
}

export interface TimestampPaginationParams {
	/**
	 * Include items with `oldest` or `latest` timestamps in results. Ignored unless either timestamp
	 * is specified.
	 */
	inclusive?: boolean

	/** Only items before this Unix timestamp will be included in results. */
	latest?: string

	/** Only items after this Unix timestamp will be included in results. */
	oldest?: string

	/**
	 * The maximum number of items to return. Fewer than the requested number of items may be
	 * returned, even if the end of the list hasn't been reached.
	 */
	limit?: number
}

export interface CursorPaginationResponse {
	has_more: boolean
	response_metadata?: { next_cursor: string }
}

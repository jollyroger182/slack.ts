import type {
	ActionsBlock as SlackActionsBlock,
	AlertBlock as SlackAlertBlock,
	CardBlock as SlackCardBlock,
	CarouselBlock as SlackCarouselBlock,
	ContainerBlock as SlackContainerBlock,
	ContextActionsBlock as SlackContextActionsBlock,
	ContextBlock as SlackContextBlock,
	DataTableBlock as SlackDataTableBlock,
	DividerBlock as SlackDividerBlock,
	FileBlock as SlackFileBlock,
	HeaderBlock as SlackHeaderBlock,
	ImageBlock as SlackImageBlock,
	InputBlock as SlackInputBlock,
	MarkdownBlock as SlackMarkdownBlock,
	PlanBlock as SlackPlanBlock,
	RichTextBlock as SlackRichTextBlock,
	SectionBlock as SlackSectionBlock,
	TableBlock as SlackTableBlock,
	TaskCardBlock as SlackTaskCardBlock,
	VideoBlock as SlackVideoBlock,
} from '@slack/types'

export interface Block<Type extends string = string> {
	type: Type

	/**
	 * A unique identifier for the block. If not specified, it will be generated. Maximum length is
	 * 255 characters.
	 */
	block_id?: string
}

/** {@inheritDoc @slack/types#ActionsBlock} */
export interface ActionsBlock extends SlackActionsBlock {}

/** {@inheritDoc @slack/types#AlertBlock} */
export interface AlertBlock extends SlackAlertBlock {}

/** {@inheritDoc @slack/types#CardBlock} */
export interface CardBlock extends SlackCardBlock {}

/** {@inheritDoc @slack/types#CarouselBlock} */
export interface CarouselBlock extends SlackCarouselBlock {}

/** {@inheritDoc @slack/types#ContainerBlock} */
export interface ContainerBlock extends SlackContainerBlock {}

/** {@inheritDoc @slack/types#ContextActionsBlock} */
export interface ContextActionsBlock extends SlackContextActionsBlock {}

/** {@inheritDoc @slack/types#ContextBlock} */
export interface ContextBlock extends SlackContextBlock {}

/** {@inheritDoc @slack/types#DataTableBlock} */
export interface DataTableBlock extends SlackDataTableBlock {}

/** {@inheritDoc @slack/types#DividerBlock} */
export interface DividerBlock extends SlackDividerBlock {}

/** {@inheritDoc @slack/types#FileBlock} */
export interface FileBlock extends SlackFileBlock {}

/** {@inheritDoc @slack/types#HeaderBlock} */
export interface HeaderBlock extends SlackHeaderBlock {}

/** {@inheritDoc @slack/types#ImageBlock} */
export type ImageBlock = SlackImageBlock & {}

/* *{@inheritDoc @slack/types#InputBlock} */
export interface InputBlock extends SlackInputBlock {}

/** {@inheritDoc @slack/types#MarkdownBlock} */
export interface MarkdownBlock extends SlackMarkdownBlock {}

/** {@inheritDoc @slack/types#PlanBlock} */
export interface PlanBlock extends SlackPlanBlock {}

/** {@inheritDoc @slack/types#RichTextBlock} */
export interface RichTextBlock extends SlackRichTextBlock {}

/** {@inheritDoc @slack/types#SectionBlock} */
export interface SectionBlock extends SlackSectionBlock {}

/** {@inheritDoc @slack/types#TableBlock} */
export interface TableBlock extends SlackTableBlock {}

/** {@inheritDoc @slack/types#TaskCardBlock} */
export interface TaskCardBlock extends SlackTaskCardBlock {}

/** {@inheritDoc @slack/types#VideoBlock} */
export interface VideoBlock extends SlackVideoBlock {}

/**
 * All Slack block types documented at https://docs.slack.dev/reference/block-kit/blocks. For
 * documented and undocumented blocks, see {@link KnownBlock}.
 */
export type DocumentedBlock =
	| ActionsBlock
	| AlertBlock
	| CardBlock
	| CarouselBlock
	| ContainerBlock
	| ContextActionsBlock
	| ContextBlock
	| DataTableBlock
	| DividerBlock
	| FileBlock
	| HeaderBlock
	| ImageBlock
	| InputBlock
	| MarkdownBlock
	| PlanBlock
	| RichTextBlock
	| SectionBlock
	| TableBlock
	| TaskCardBlock
	| VideoBlock

/** Allowed enum in the `background_color` property of {@link CalloutBlock|callout blocks}. */
export type CalloutColor =
	'indigo' | 'blue' | 'jade' | 'pink' | 'gray' | 'purple' | 'orange' | 'brown' | 'green'

/** Allowed blocks in the `child_blocks` property of {@link CalloutBlock|callout blocks}. */
export type CalloutChildBlock =
	| SectionBlock
	| DividerBlock
	| ImageBlock
	| HeaderBlock
	| RichTextBlock
	| ContactCardBlock
	| FileBlock

/**
 * Displays a card with a background color and some children blocks.
 *
 * This is an undocumented block.
 */
export interface CalloutBlock extends Block<'callout'> {
	/** Background color of the callout. */
	background_color: CalloutColor

	/** Blocks to display inside the callout card. */
	child_blocks: Block[]
}

export type CanvasTableChildBlock =
	SectionBlock | DividerBlock | ImageBlock | ContactCardBlock | RichTextBlock | FileBlock

/** A cell in a {@link CanvasTableBlock}. */
export interface CanvasTableCell {
	type: 'canvas_table_cell'

	/** Whether this is a header cell. Header cells are centered and have a different background color. */
	header: boolean

	/** Blocks in the cell. */
	child_blocks: CanvasTableChildBlock[]

	/**
	 * Width of this cell, in pixels. Only the value in the first row matters in rendering; all other
	 * rows are silently ignored.
	 */
	width?: number
}

/** A row in a {@link CanvasTableBlock}. */
export interface CanvasTableRow {
	type: 'canvas_table_row'

	/** Cells in this row. Each row must have at leat one cell. */
	cells: CanvasTableCell[]
}

/**
 * A table of arbitrary blocks as cells. On mobile, this renders as a broken "open in canvas" link.
 *
 * This is an undocumented block.
 */
export interface CanvasTableBlock extends Block<'canvas_table'> {
	/** Rows in the table. */
	rows: CanvasTableRow[]
}

/**
 * Shows a channel section in the Slack sidebar.
 *
 * This is an undocumented block.
 *
 * @remarks
 *   Only the `channel_ids` field is server-side validated; all other fields can have any type.
 */
export interface ChannelSectionBlock extends Block<'channel_section' | 'channel_set'> {
	/** Name of the channel section. */
	channel_set_name?: string

	/** Array of channel IDs. */
	channel_ids?: string[]

	/** Emoji for the channel section. */
	emoji?: string

	/**
	 * Optional ID for the channel section (`Csl0123456789`). If unset, the Slack client will create a
	 * new channel section when a user copies a link from the block.
	 */
	link_id?: string

	destination_channel_id?: string
	target_user_ids?: string[]
	accepted_user_ids?: string[]
	is_channel_set_preview?: boolean
}

/** Block types accepted by {@link ConditionBlock}'s `default` and `cases[].blocks`. */
export type ConditionChildBlock =
	| ActionsBlock
	| ContextBlock
	| DividerBlock
	| ImageBlock
	| SectionBlock
	| HeaderBlock
	| VideoBlock
	| RichTextBlock
	| InputBlock
	| EventBlock
	| FileBlock
	| CallBlock
	| MessageBlock

export type Condition = { op: '=' | '!=' } & (
	| { type: 'client'; value: 'desktop' | 'ios' | 'android' | (string & {}) }
	| { type: 'content_type'; value: 'condition_demo' | (string & {}) }
	| { type: 'team'; value: string }
)

/** A branch in a {@link ConditionBlock}. */
export interface ConditionCase {
	/** A list of conditions. All of them must match for this branch to activate. */
	conditions: Condition[]

	/** A list of blocks to render when the {@link conditions} match. */
	blocks: ConditionChildBlock[]
}

/**
 * Conditionally renders blocks. Currently not supported on Android.
 *
 * This is an undocumented block.
 */
export interface ConditionBlock extends Block<'condition'> {
	/** Cases of conditions and what to show when a condition matches. */
	cases: ConditionCase[]

	/** Fallback blocks to display when no conditions match. */
	default?: ConditionChildBlock[]
}

/**
 * Renders a Slack user in a card.
 *
 * This is an undocumented block.
 */
export interface ContactCardBlock extends Block<'contact_card'> {
	/** The ID of the user to display. */
	contact_user_id: string
}

/** A section on a pie chart. */
export interface PieChartSegment {
	/** Label on this section of the pie chart. Maximum 20 characters. */
	label: string

	/** Relative size of this section. */
	value: number
}

/** A pie chart. Can be used in a {@link DataVisualizationBlock}. */
export interface PieChart {
	type: 'pie'

	/** Sections of the pie chart. Maximum 12 elements. */
	segments: PieChartSegment[]
}

export interface AxisConfig {
	/** Unique labels for the X axis points, in order of display. Maximum 20 characters each. */
	categories: string[]

	/** Label below the X axis. Maximum 50 characters. */
	x_label: string

	/** Label next to the Y axis. Maximum 50 characters. */
	y_label: string
}

export interface ChartPoint {
	/** Category label. Must match a label defined in `axis_config`. */
	label: string

	/** Y axis value of the point. */
	value: number
}

export interface ChartSeries {
	/** Unique series label. Maximum 20 characters. */
	name: string

	/** List of data points, one per category defined in `axis_config`. */
	data: ChartPoint[]
}

/** A line, bar, or area chart. Can be used in a {@link DataVisualizationBlock}. */
export interface AxesChart {
	type: 'bar' | 'line' | 'area'

	/** Configuration of the X axis. */
	axis_config: AxisConfig

	/** List of series on the chart. */
	series: ChartSeries[]
}

export type DataVisualizationChart = PieChart | AxesChart

export interface DataVisualizationBlock extends Block<'data_visualization'> {
	/** A label displayed above the chart. Maximum length 50 characters. */
	title: string

	/** The chart object to display. */
	chart: DataVisualizationChart

	/** Custom size of the chart. Currently has no effect. */
	size?: 'small' | 'large'

	/**
	 * Custom preview images. Has no effect when sent by the client. Always exists on server
	 * responses.
	 */
	preview_images?: {
		/** Light mode preview image URL. */
		preview_image_light_mode?: string
		/** Light mode preview image Slack ID. */
		slack_file_id_light_mode?: string
		/** Dark mode preview image URL. */
		preview_image_dark_mode?: string
		/** Dark mode preview image Slack ID. */
		slack_file_id_dark_mode?: string
	}
}

// tentative | accepted | declined | needs_action

/**
 * A calendar event displayed in an {@link EventBlock}.
 *
 * The minimally required fields are `start` and `end`; if you don't provide both, Slack will throw
 * a schema error. However, for events to show up, you need at least the {@link organizer} and
 * {@link attendees} fields too. In addition, if the event is in the future (i.e., at least one of
 * {@link start} and {@link end} is in the future, then the user must be in the {@link attendees}
 * array, linked by `user_id`; otherwise, the block will show as "We can’t fully display this
 * message."
 */
export interface CalendarEvent {
	start: { date_time: number; date?: string }
	end: { date_time: number; date?: string }
	organizer?: { email: string; name: string; user_id?: string }
	attendees?: {
		email: string
		name: string
		rsvp?: 'tentative' | 'accepted' | 'declined' | 'needs_action'
		user_id?: string
	}[]

	title?: string
	/** Status of the event. `cancelled` makes the event show as cancelled (grayed out) */
	status?: 'confirmed' | 'tentative' | 'cancelled'
	app_type?: 'gcal' | 'ocal' | 'ocal_gcc'
	meeting_url?: string
	meeting_provider?: string // slack, zoom, hangout, webex, msft_teams, bluejeans, google_meet, chime, skype
	web_link?: string
	copies?: string[]
	attendee_count?: number // shows as NaN without this
	needs_refetch?: boolean

	// not shown in the message
	location?: string
	description?: string
}

/**
 * A calendar event. This is part of Slack's Google Calendar / Outlook Calendar integration.
 *
 * This is an undocumented block.
 */
export interface EventBlock extends Block<'event'> {
	/** Identifier of the block. Required for event blocks. */
	block_id: string

	/**
	 * Slack event ID for the event. To discover these, use the `meetings.list` endpoint with a user
	 * session token (`xoxd-...`), or use the `calendar.event.create` endpoint to create an event.
	 */
	event_id: string

	/**
	 * Set by the server when a nonexistent `event_id` is passed. Errors when sent by the client. At
	 * least one of this or {@link event} will be present in a server response. On mobile, the
	 * presence of this field means {@link event} won't get rendered, though on desktop, it still
	 * might.
	 */
	is_deleted?: boolean

	/**
	 * The event represented by the block. If not set, the server will look up an event from
	 * `event_id`, and if an event is not found, set {@link is_deleted} to `true` and leave this field
	 * empty. When provided by the client, it takes precendence over the server's fetching logic, and
	 * it is shown on desktop even when `event_id` is nonexistent (though {@link is_deleted} will
	 * still be set).
	 */
	event?: CalendarEvent
}

/**
 * Shows a loading animation.
 *
 * This is an undocumented block.
 */
export interface LoadingBlock extends Block<'loading'> {}

// TODO: what is this?
// export interface MCPAppBlock extends Block<'mcp_app'> {}

/**
 * Renders a message card, similar to how Slack renders message unfurls and forwards, but a lot more
 * cursed. If the user is not in the channel, or if the message does not exist, it renders as an
 * empty bubble.
 *
 * This is an undocumented block.
 */
export interface MessageEmbedBlock extends Block<'message_embed'> {
	/** The team where the message is posted. */
	team_id: string

	/** The channel where the message is posted. */
	channel: string

	/** The timestamp of the message. */
	ts: string
}

// TODO: what is this??
// export interface SharePromptBlock extends Block<'share_prompt'> {
// 	prompt: string
// 	label: string
// }

/**
 * Shares a card for a Slack workflow. Only a few fields are required; however, if you don't provide
 * fields like `title` and `description`, the card will omit these fields instead of fetch them from
 * the workflow configuration.
 *
 * This is an undocumented block.
 */
export interface ShareShortcutBlock extends Block<'share_shortcut'> {
	/** The workflow app ID. */
	app_id: string

	/** The workflow function trigger ID (`Ft012345678`). */
	function_trigger_id: string

	/** The team / enterprise that owns the workflow app. */
	owning_team_id: string

	is_workflow_app?: boolean
	sales_home_workflow_app_type?: number
	app_collaborators?: string[]
	title?: string
	description?: string
	bot_user_id?: string
	workflow_id?: string
	developer_trace_id?: string
	trigger_type?: string
	trigger_subtype?: string
	share_url?: string
	contains_ai_steps?: boolean
	button_label?: string
	url?: string
}

/**
 * All known Slack block types.
 *
 * This may include unofficial blocks, observed from Block Kit Builder and the Slack client; for a
 * list of documented blocks, see {@link DocumentedBlock}.
 */
export type KnownBlock =
	| DocumentedBlock
	| CalloutBlock
	| CanvasTableBlock
	| ChannelSectionBlock
	| ConditionBlock
	| ContactCardBlock
	| DataVisualizationBlock
	| EventBlock
	| LoadingBlock
	| MessageEmbedBlock
	| ShareShortcutBlock

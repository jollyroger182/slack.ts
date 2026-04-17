import type { EventWrapper } from '../../src/api/events'
import type {
	BlockAction,
	BlockActions,
	ButtonAction,
} from '../../src/api/interactive/block_actions'
import type { PublicChannel } from '../../src/api/types/conversation'
import type { NormalMessage } from '../../src/api/types/message'
import type { User } from '../../src/api/types/user'

export const PUBLIC_CHANNEL_DATA: PublicChannel = {
	id: 'C123',
	name: 'general',
	is_channel: true,
	is_group: false,
	is_im: false,
	created: 1234567890,
	updated: 1234567890000,
	creator: 'U123',
	is_archived: false,
	is_general: true,
	unlinked: 0,
	name_normalized: 'general',
	is_shared: false,
	is_ext_shared: false,
	is_org_shared: false,
	pending_shared: [],
	is_pending_ext_shared: false,
	is_member: true,
	is_private: false,
	is_mpim: false,
	topic: { value: 'General channel', creator: 'U123', last_set: 1234567890 },
	purpose: { value: 'General discussion', creator: 'U123', last_set: 1234567890 },
	previous_names: [],
	locale: 'en-US',
	context_team_id: 'T123',
}

export const MESSAGE_DATA: NormalMessage = {
	type: 'message',
	user: 'U123',
	text: 'Hello world',
	ts: '123456.789',
	team: 'T123',
}

export function normalMessage(overrides?: Partial<NormalMessage>) {
	return { ...MESSAGE_DATA, ...overrides }
}

export const MESSAGE_EVENT: EventWrapper = {
	type: 'event_callback',
	token: 'test',
	team_id: 'T123',
	api_app_id: 'A123',
	event: { ...MESSAGE_DATA, channel: 'C123', event_ts: '123456.789' },
	event_id: 'Ev123',
	event_time: 1234567890,
	event_context: 'ctx123',
	authorizations: [],
	is_ext_shared_channel: false,
	context_team_id: 'T123',
	context_enterprise_id: null,
}

export const USER_DATA = {
	id: 'U123',
	team_id: 'T123',
	name: 'test_username',
	deleted: false,
	color: '9b3b45',
	real_name: 'Test User',
	tz: 'Asia/Chongqing',
	tz_label: 'China Standard Time',
	tz_offset: 28800,
	profile: {
		real_name: 'Test User',
		display_name: 'iamtest',
		avatar_hash: '71c179eb0441',
		real_name_normalized: 'Test User',
		display_name_normalized: 'iamtest',
		image_24: 'https://picsum.photos/24/24',
		image_32: 'https://picsum.photos/32/32',
		image_48: 'https://picsum.photos/48/48',
		image_72: 'https://picsum.photos/72/72',
		image_192: 'https://picsum.photos/192/192',
		image_512: 'https://picsum.photos/512/512',
		first_name: 'Test',
		last_name: 'User',
		team: 'T123',
		email: 'testuser@example.com',
		title: 'Q/A Engineer',
		pronouns: 'they/them',
		phone: '',
		skype: '',
		status_text: '',
		status_text_canonical: '',
		status_emoji: '',
		status_emoji_display_info: [],
		status_expiration: 0,
		huddle_state: 'default_unset',
		huddle_state_expiration_ts: 1234567890,
		ooo_message: '',
		start_date: '2026-01-01',
		guest_invited_by: '',
	},
	is_admin: false,
	is_owner: false,
	is_primary_owner: false,
	is_restricted: false,
	is_ultra_restricted: false,
	is_bot: false,
	updated: 1234567890,
	is_app_user: false,
	has_2fa: true,
} satisfies User

export const BUTTON_DATA = {
	type: 'button',
	block_id: '12345',
	action_id: 'test_button',
	action_ts: '123456.789',
	text: { type: 'plain_text', text: 'press me' },
} as const satisfies ButtonAction

export function blockActions(...actions: BlockAction[]): BlockActions {
	return {
		type: 'block_actions',
		team: { id: 'T123', domain: 'test' },
		user: {
			id: 'U123',
			username: USER_DATA.name,
			name: USER_DATA.profile.display_name,
			team_id: 'T123',
		},
		api_app_id: 'A123',
		token: 'abcdef',
		trigger_id: '123456abc',
		container: {
			type: 'message',
			channel_id: 'C123',
			message_ts: '123456.789',
			is_ephemeral: false,
		},
		message: {
			type: 'message',
			ts: '123456.789',
			user: 'U123',
			text: 'hello world',
			team: 'T123',
		},
		actions,
	}
}

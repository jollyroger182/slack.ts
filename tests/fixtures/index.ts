import type { EventWrapper } from '../../src/api/events'
import type { PublicChannel } from '../../src/api/types/conversation'
import type { NormalMessage } from '../../src/api/types/message'

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

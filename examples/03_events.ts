/** This file lists all the event types you'll see in a `slack.ts` app. */

import { App, option, optionGroup } from 'slack.ts'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN!
const SLACK_CHANNEL = 'C123456'

const app = new App({
	token: SLACK_BOT_TOKEN,
	receiver: { type: 'socket', appToken: SLACK_APP_TOKEN },
})

/**
 * `event` events are triggered for each Events API payload. There are also `event:type` events,
 * which are filtered to a specific type. You would usually prefer the latter over the former. For
 * some types, there are also specific wrappers for them (like `home` and `message`) that are
 * usually easier to work with.
 *
 * If an event has a `user` or `channel` field, it will be automatically wrapped in a corresponding
 * helper object.
 */

app.on('event', async (event) => {
	console.log(event.type, 'event received')
})

app.on('event:member_joined_channel', async (event) => {
	const user = await event.user.fetch()
	const channel = await event.channel.fetch()
	console.log(`@${user.profile.display_name || user.real_name} joined channel #${channel.name}`)
})

/**
 * `message` events are triggered for each event of type "message" from Slack. Note that this not
 * only includes user-sent messages, but also includes system messages (like channel join messages)
 * and special messages (like message deletion events). The parameter to the callback is a message
 * object, which exposes raw fields as well as helper methods.
 *
 * You can use `message:subtype` to further filter message events to a subtype (use `message:normal`
 * for normal messages, i.e. those with no subtype field), `message#C123` to subscribe to only
 * message events in a given channel, or mix and match them like `message:normal#C123`.
 */

app.on('message', async (message) => {
	console.log(`message with subtype ${message.subtype}: ${message.text}`)
})

app.on('message:normal', async (message) => {
	const user = await message.author.fetch()
	console.log(`normal message received from ${user.name}`)
})

app.on(`message#${SLACK_CHANNEL}`, async (message) => {
	console.log(`message event with subtype ${message.subtype} received in the channel`)
})

app.on(`message:message_deleted#${SLACK_CHANNEL}`, async (message) => {
	console.log(`message with ts ${message.deleted_ts} deleted from <#${SLACK_CHANNEL}>`)
})

/**
 * `home` events are triggered when the user opens the App Home of your app. They contain a
 * `respond` utility to call the `views.publish` API method.
 */

app.on('home', async (event) => {
	await event.respond({
		type: 'home',
		blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'welcome to the app!' } }],
	})
})

/**
 * `action` events are triggered for block action payloads received on the interactivity API. The
 * parameter to the callback is an action object, which contains a `respond` utility.
 *
 * There are also `action:type`, `action.action_id`, and `action:type.action_id` variants, which are
 * hopefully straightforward.
 */

app.on('action', async (action) => {
	console.log(`block action of type ${action.type} received`)
	await action.respond.message('action received!')
})

app.on('action:button', async (action) => {
	console.log('button pressed')
	await action.respond.edit({
		blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'no more button for you' } }],
	})
})

app.on('action.close_menu', async (action) => {
	console.log('action with the given action_id received')
	await action.respond.delete()
})

app.on('action:overflow.main_menu', async (action) => {
	/** Here `action` is narrowed to an overflow */
	console.log('chosen item:', action.selected_option.text)
})

/**
 * `actions` events are triggered for block action payloads received on the interactivity API. It
 * will be passed the plain JS object of the `block_actions` payload. You would usually use one of
 * the `action` events instead.
 */

app.on('actions', async (actions) => {
	console.log(actions.actions.length, 'actions received')
})

/**
 * `submit` events are triggered when a modal is submitted. You can also use `submit.callback_id` to
 * filter to a certain callback ID.
 */

app.on('submit', async (submission) => {
	console.log('form submitted with values', submission.values)
	/**
	 * You can only respond with a message if the modal contains a `conversations_select` element with
	 * `response_url_enabled` set to `true`. See
	 * https://docs.slack.dev/surfaces/modals#modal_response_url for more details.
	 */
	await submission.respond.message('data received!')
})

app.on('submit.order_confirm', async (submission) => {
	console.log(`modal with the given callback_id (${submission.view.callback_id}) submitted`)
})

/**
 * `slash` events are triggered for slash command executions. There's also `/command-name` events
 * for slash commands with a given name.
 */

app.on('slash', async (slash) => {
	const user = await slash.user.fetch()
	console.log(`${user.name} ran slash command ${slash.command}`)
})

app.on('/echo', async (slash) => {
	await slash.respond.message(slash.text || 'usage: /echo <text>')
})

/**
 * `autocomplete` events are triggered for options menu autocompletion requests. You must call the
 * `respond` method with options or option groups. Of course, we also have `autocomplete.action_id`
 * to filter by the action ID of the option menu being autocompleted.
 */

app.on('autocomplete', async (event) => {
	if (event.action_id !== 'greetings') {
		/**
		 * For more information about the `option` and `optionGroup` builders, see the block kit
		 * example.
		 */
		await event.respond(option('option 1'), option('option 2'))
	}
})

app.on('autocomplete.greetings', async (event) => {
	await event.respond(
		optionGroup('english', option('hello'), option('hi')),
		optionGroup('spanish', option('hola'), option('buenas tardes')),
	)
})

await app.start()

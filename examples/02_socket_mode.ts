import { App } from 'slack.ts'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN!

const app = new App({
	token: SLACK_BOT_TOKEN,
	/**
	 * A **receiver** is an object that receives events. There are many types of receivers, including
	 * HTTP, socket mode, user RTM, and more. Here, we create a socket mode receiver, which uses
	 * Slack's Socket Mode API to connect to Slack's servers and receive events.
	 */
	receiver: {
		type: 'socket',
		appToken: SLACK_APP_TOKEN,
	},
})

/**
 * All kinds of events are registered with the `app.on` function, which takes two arguments: an
 * event specifier, and a callback function.
 *
 * The event specifier is very powerful. It can perform many kinds of filtering on events, and is
 * fully typed. Here, we use the "message:normal" specifier to respond to all "normal" messages
 * (i.e., messages with no `subtype` value).
 */
app.on('message:normal', async (message) => {
	/**
	 * This `message` object, just like most objects you'll see with `slack.ts`, is not a plain
	 * object. It has all the fields of a Slack message (in this case, its type is narrowed to a
	 * "normal message" instead of all message subtypes), as well as a couple of helpers, such as
	 * `author` and `reply`.
	 */
	if (message.text?.startsWith('!greet')) {
		/**
		 * Sometimes you'll encounter object references (like `message.author`) which don't have the
		 * data, only the identifier. Use the `.fetch` method on them to return a new object with the
		 * data fetched. (In this case, a `users.info` API method will be called.)
		 */
		const user = await message.author.fetch()
		await message.reply(`Hello, ${user.profile.display_name || user.real_name}!`)
	}
})

/** This starts the receiver and starts listening to events. */
await app.start()

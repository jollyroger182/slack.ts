import { App } from 'slack.ts'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!
const SLACK_CHANNEL = 'C123456'

/**
 * The `App` class is the main entrypoint of a `slack.ts` project, whether you just need to use the
 * web API or also need to receive events.
 */
const app = new App({ token: SLACK_BOT_TOKEN })

/**
 * `slack.ts` uses an object-oriented, ergonomic API model, instead of the RPC model that you might
 * have seen with Bolt. For example, `app.channel` returns an object that references the channel
 * with the given ID.
 */
const channel = app.channel(SLACK_CHANNEL)

/** You can send messages... */
await channel.send('Hello, slack.ts!')

/** ...fetch channel info... */
const info = await channel.fetch()
console.log(info.name, info.is_private)

/** ...and read messages. */
for await (const message of channel.messages({ limit: 10 })) {
	const user = await message.author?.fetch()
	console.log(`@${user?.profile.display_name || user?.real_name}: ${message.text}`)
}

/** For more operations, check out the other methods on `App`, `Channel`, etc! */

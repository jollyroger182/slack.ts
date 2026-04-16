# The (in)complete guide to `slack.ts`

`slack.ts` is a TypeScript-first Slack API library that ~~has~~ will have full feature parity with `@slack/bolt`, Slack's official library. It aims to be fluent, rigorously typed (even blocks and `action_id`s), and intuitive.

To navigate this guide, use the Table of Contents to jump to the section you're interested in.

## Table of contents

- [The (in)complete guide to `slack.ts`](#the-incomplete-guide-to-slackts)
  - [Table of contents](#table-of-contents)
  - [Receivers](#receivers)
    - [Socket](#socket)
    - [HTTP](#http)
    - [Fetch](#fetch)
  - [Event system](#event-system)
  - [Reference objects (stubs)](#reference-objects-stubs)
  - [Block kit builder](#block-kit-builder)
  - [Wait](#wait)
  - [Respond](#respond)

## Receivers

To use a lot of Slack's API (events, interactivity, slash commands, etc.), your app needs to receive messages from Slack. Slack supports two methods for this: HTTP requests, where you expose an HTTP endpoint that Slack sends a request to; and Socket Mode, where you establish a WebSocket connection with Slack. `slack.ts` supports both!

To enable receiving these messages from Slack, you need to set the `receiver` key in the options object you pass to `App`. The value should be a receiver-specific configuration object. There are three receivers available:

### Socket

The socket receiver implements the Socket Mode protocol. To use it, set the `receiver` key to an object like the following:

```typescript
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: {
    type: 'socket',
    appToken: process.env.SLACK_APP_TOKEN!,
  },
})
```

The `appToken` must have the `connections:write` scope.

### HTTP

The HTTP receiver starts an HTTP server using the `http` module, which is builtin in Node.js. To use it, set the `receiver` key to an object like the following:

```typescript
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: {
    type: 'http',
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    port: 3000,
    path: '/slack/events',
  },
})
```

The `port` and `path` parameters are optional and default to `3000` and `'/slack/events'`, respectively.

In cases where you need to serve other content (such as a website) on the same HTTP server, or you want to use another server (such as Bun's builtin server), you can use the `fetch` receiver instead.

### Fetch

The fetch receiver does not start any server or connection by itself. Instead, you are responsible for setting up your own HTTP server, and for the requests you want `slack.ts` to handle, you call the `fetch` method on the receiver object (obtained via `app.receiver`). This is especially useful in serverless environments (like Cloudflare Workers) or when you need to host custom content on the same HTTP server.

To use the fetch receiver, set the `receiver` key to an object like the following:

```typescript
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: {
    type: 'fetch',
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    waitUntil: ctx.waitUntil,
  },
})
```

The `waitUntil` parameter is optional and mainly used in serverless environments, where non-`await`ed promises are not executed when the HTTP request context terminates. It will be called with promise objects that should be awaited (such as async event handlers). For example, in Cloudflare Workers, you can do the following:

```typescript
import { env, waitUntil } from 'cloudflare:workers'

const app = new App({
  token: env.SLACK_BOT_TOKEN,
  receiver: {
    type: 'fetch',
    signingSecret: env.SLACK_SIGNING_SECRET!,
    waitUntil: waitUntil,
  },
})
```

## Event system

The events received from Slack, including interactions, slash commands, and more, are exposed on the `App` object, which is an `EventEmitter`-like object. (The difference is that the `app.emit` method is `async`, and you can `await` it to wait for all event listeners to complete.)

You can register event handlers with the `app.on` method like so:

```typescript
app.on('message', async (message) => {
  if (message.user === process.env.SLACK_USER_ID) return
  await message.reply('I am listening :eyes:')
})
```

All of the events are typed. Here are all the events available (sorry for the wall of text):

- `event`: An Events API event is received. The listener is called with the event wrapper plain object.
- `` `event:${EventType}` ``: Emitted when an Events API event of the specified type is received. `EventType` can be any Events API event type (`message`, `app_mention`, etc).
- `actions`: A `block_actions` interaction payload is received. The listener is called with the entire payload, which contains an `actions` field with an array of actions.
- `action`: Emitted for each action in the `actions` field of a `block_actions` payload. The listener is called with an `ActionInstance`, which has the `respond` utility method as well as the fields on the action itself.
- `` `action:${ActionType}` ``, `` `action.${ActionID}` ``, `` `action:${ActionType}.${ActionID}` ``: Emitted when an action of the specified type (`button`, `overflow`, etc) and/or `action_id` is received. The parameter passed to the listener is an `ActionInstance` narrowed to the given type.
- `submit`: A modal was submitted. The listener is called with a `SubmissionInstance`, which has the `respond` utility method as well as the fields on the submission object itself.
- `` `submit.${CallbackID}` ``: Emitted when a modal with the given `callback_id` is submitted. The parameter is the same as for `submit`.
- `message`: A `message` event is received on the Events API. The parameter is a `MessageInstance`, the same object you get from sending a message.
- `` `message:${Subtype}` ``, `` `message#${ChannelID}` ``, `` `message:${Subtype}#${ChannelID}` ``: Same as above, except limited to the given subtype (`normal` for messages with no subtype, `channel_join`, etc) and/or channel ID. The parameter is appropriately narrowed.
- `slash`: A slash command is executed. The listener is called with a `SlashCommandInstance`, which contains the `respond` utility as well as fields on the payload object itself.
- `` `/${Name}` ``: Same as above, except only for the given slash command name.
- `autocomplete`: A user typed some text into an external select menu, and Slack requests autocompletions. The listener is called with an `AutocompleteInstance`, which contains the `respond` utility (which you _must_ call) and the fields on the raw payload.
- `` `autocomplete.${ActionID}` ``: Same as above, except only for select menus with the given `action_id`.
- `home`: A `app_home_opened` event is received. listener is called with a `HomeOpenedInstance`, which contains the `respond` utility as well as fields on the payload object itself.

## Reference objects (stubs)

Many methods on `App`, as well as on other objects, return a "reference object", or stub, instead of the object itself. For example, `app.channel('C0123456789')` doesn't actually fetch the channel from the server. Instead, it creates a stub with the channel's ID. This stub allows you to call the same methods as an actual channel object (like `send`), but doesn't have the channel's information (name, creator, etc). This saves a network request if you don't need the channel info.

To actually fetch the information, you can `await` the stub, like this: `const channel = await app.channel('C0123456789')`. Now, the `channel` object will contain fields like `name` and `creator`. In this case, `slack.ts` sends a `conversations.info` API request under the hood to fetch the channel details.

## Block kit builder

`slack.ts` comes with a beautifully typed block kit builder. It supports ~~all~~ most blocks and lets you create blocks by chaining function calls. The actions (buttons, ) For example:

```typescript
import { actions, blocks, button, overflow, R, richText, section } from 'slack.ts'

const message = await app.channel('C0123456789').send({
	blocks: blocks(
		// mrkdwn section block with accessory
		section(':white_check_mark: *Your order has been confirmed!*').accessory(
			overflow(
				option('Contact support').value('support'),
				option('Cancel order').value('cancel'),
			).id('menu'),
		),

		// section with mrkdwn fields
		section(
			'*Customer*\nFoo Bar',
			'*Total*\n$113.00',
			'*Items*\nWireless Earbuds Pro, USB-C Cable ×2',
			'*Est. delivery*\nApr 19–21',
		),

		// actions block
		actions(button('Track order').url('https://example.com'), button('View details').id('details')),
	),
})

const action = await message.wait.action(/* `action_id` is autocompleted here */ 'menu', 'details')

if (action.action_id === /* and here */ 'details') {
	await action.respond.message({ ... })
} else if (action.value === /* and even the value here */ 'support') {
	await action.respond.message({ ... })
} else {
	await action.respond.message({ ... })
}
```

For a more comprehensive overview of the blocks implemented, view [this example file](/examples/blocks.ts).

## Wait

Slack's Bolt framework exclusively uses the event listener model, where all user interactions trigger an event that you handle. `slack.ts` uses a similar model, but also supports explicitly waiting for some events. This is useful in asking for user confirmation, multi-step flows, etc.

Objects that support waiting will have a `wait` field, which contains methods you can call to wait for certain events. For example, a message has `wait.action` which you can call to wait for an interactive action on this message to occur:

```typescript
const message = await app.channel('C0123456789').send({
  blocks: blocks(actions(button('click me').id('action_id'))),
})

const action = await message.wait.action('action_id')

await action.respond.message('hello world')
```

The app object, channel objects, and some more objects also have `wait` properties. Refer to their documentations for more info on how to use them.

**NOTE**: Waiting will probably not work in serverless environments! This is because a new Slack request executes a new instance of the serverless function, which can't resolve a promise in another instance.

## Respond

Many objects have a `respond` field which you can use to respond to the event. They have various shapes and forms: some are objects while some are functions, but they generally do the same thing, and they're designed to be as intuitive as possible. Refer to the individual documentations to find out how to use them.

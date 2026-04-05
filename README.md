# slack.ts

An opinionated Slack API library with full TypeScript support.

## Usage

You can install this package from npm with

```shell
npm i slack.ts
# or
bun add slack.ts
```

Sample usage:

```typescript
import { App } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.message(async ({ message }) => {
	if (message.user === process.env.SLACK_USER_ID) return
	await message.reply("I'm always listening :eyes:")
})

await app.start()
```

For more examples, see [the examples directory](./examples).

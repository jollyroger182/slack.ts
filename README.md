# slack.ts

Ergonomic TypeScript Slack client library.

## Installation

```sh
$ bun add slack.ts
$ npm add slack.ts
$ pnpm add slack.ts
```

## Usage

```ts
import { Client, FetchReceiver } from "slack.ts";

const receiver = new FetchReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

const client = new Client(process.env.SLACK_TOKEN!, { receiver });

client.on("event:message", async (event) => {
	if (event.subtype) return;
	console.log(event.channel, event.ts, event.user, event.text);
});
```

## Documentation

Coming soon!

# slack.ts

An opinionated Slack API library with full TypeScript support.

## Usage

```typescript
import { App } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN
})

await app.channel('C0123456ABC').send('Hello, slack.ts!')
```

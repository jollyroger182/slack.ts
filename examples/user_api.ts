import { App } from '../src'

const app = new App({
	token: { cookie: process.env.SLACK_XOXD!, token: process.env.SLACK_XOXC! },
})

await app.channel(process.env.SLACK_CHANNEL!).send(':wave: Hello, team!')

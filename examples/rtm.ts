import { App } from 'slack.ts'

const app = new App({
	token: { cookie: process.env.SLACK_XOXD!, token: process.env.SLACK_XOXC! },
	receiver: { type: 'rtm' },
})

app.on('event:reaction_added', async ({ payload }) => {
	if (payload.item.type === 'message') {
		const msg = await app.channel(payload.item.channel).message(payload.item.ts)
		console.log(`+:${payload.reaction}:`, msg.text)
	}
})

app.on('message:normal', (message) => {
	console.log(message.author.id, message.text)
})

app.on('message:message_changed', (message) => {
	console.log(message)
})

await app.start()

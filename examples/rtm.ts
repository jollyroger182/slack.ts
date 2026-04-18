import { App, RTMReceiver } from 'slack.ts'

const app = new App({
	token: { cookie: process.env.SLACK_XOXD!, token: process.env.SLACK_XOXC! },
	receiver: { type: 'rtm' },
})
const rtm = app.receiver as RTMReceiver

app.on('event:reaction_added', async ({ payload }) => {
	if (payload.item.type === 'message') {
		const msg = await app.channel(payload.item.channel).message(payload.item.ts)
		console.log(`+:${payload.reaction}:`, msg.text)
		await rtm.subscribe(payload.user)
	}
})

app.on('message:normal', (message) => {
	console.log(message.author.id, message.text)
})

app.on('message:message_changed', (message) => {
	console.log(message)
})

rtm.on('presence_change', (event) => {
	console.log(event.user ?? event.users, event.presence)
})

await app.start()

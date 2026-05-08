import { App } from 'slack.ts'

const app = new App({ token: process.env.SLACK_BOT_TOKEN })

const channel = app.channel(process.env.SLACK_CHANNEL!)

for await (const message of channel.messages({ limit: 10 })) {
	console.log(new Date(Number(message.ts) * 1000).toISOString(), message.author?.id, message.text)
	for await (const reply of message.replies({ limit: 3, root: false })) {
		console.log('-', new Date(Number(reply.ts) * 1000).toISOString(), reply.author?.id, reply.text)
	}
}

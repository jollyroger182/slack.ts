import { App } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN!,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('/echo', async (command) => {
	if (!command.text.trim()) {
		return command.respond.message({ text: 'usage: `/echo <text>`', ephemeral: true })
	}
	await command.respond.message(command.text)
})

app.on('message:message_deleted', async (message) => {
	console.log(message.raw)
})

await app.start()

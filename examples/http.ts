import { App } from '../src'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: {
		type: 'http',
		signingSecret: process.env.SLACK_SIGNING_SECRET!,
		port: 17236,
	},
})

app.on('message:normal', async (message) => {
	if (message.author.id === process.env.SLACK_USER_ID) return

	await message.reply('guh')
})

await app.start()

import { App, blocks, R, richText } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('home', async (event) => {
	await event.respond({
		type: 'home',
		blocks: blocks(
			richText(
				R.section('Hello world!\nIt is now ', R.date(new Date(), '{date}, {time}').bold(), '.'),
			),
		),
	})
})

await app.start()

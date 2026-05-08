import { App } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN!,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('message:normal', async (message) => {
	if (!message.text?.startsWith('?order')) return

	const confirmMessage = await message.channel.send({
		text: 'Would you like to place your order?',
		blocks: [
			{ type: 'section', text: { type: 'mrkdwn', text: 'Would you like to place your order?' } },
			{
				type: 'actions',
				elements: [
					{
						type: 'button',
						action_id: 'place_order',
						text: { type: 'plain_text', text: 'Yes' },
						style: 'primary',
					},
					{
						type: 'button',
						action_id: 'cancel_order',
						text: { type: 'plain_text', text: 'No' },
						style: 'danger',
					},
				],
			},
		],
	})

	const action = await confirmMessage.wait
		.timeout(60_000)
		.action(
			'button.place_order',
			'button.cancel_order',
			({ event }) => event.user.id === message.author.id,
		)

	if (action.action_id === 'place_order') {
		await action.respond.message(':white_check_mark: Order placed!')
	} else {
		await action.respond.message(':x: Order canceled.')
	}
})

await app.start()

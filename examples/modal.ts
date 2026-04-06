import { App } from '../src'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN!,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('message', async (message) => {
	if (!message.isNormal() || !message.text?.startsWith('?order')) return

	const confirmMessage = await message.channel.send({
		text: 'Click here to enter your information',
		blocks: [
			{ type: 'section', text: { type: 'mrkdwn', text: 'Click to enter your shipping info' } },
			{
				type: 'actions',
				elements: [
					{ type: 'button', action_id: 'info', text: { type: 'plain_text', text: 'Click me' } },
				],
			},
		],
	})

	const action = await confirmMessage.wait
		.timeout(60_000)
		.action('button.info', ({ event }) => event.user.id === message.author.id)

	const modal = await action.respond.modal({
		type: 'modal',
		title: { type: 'plain_text', text: 'Place order' },
		submit: { type: 'plain_text', text: 'Order' },
		blocks: [
			{ type: 'section', text: { type: 'mrkdwn', text: 'Please enter your shipping info below.' } },
			{
				type: 'input',
				block_id: 'name',
				label: { type: 'plain_text', text: 'Your name' },
				element: { type: 'plain_text_input', action_id: 'value' },
			},
			{
				type: 'input',
				block_id: 'address',
				label: { type: 'plain_text', text: 'Address' },
				element: { type: 'plain_text_input', multiline: true, action_id: 'value' },
			},
		],
	})

	const submission = await modal.wait.timeout(300_000).submit()

	const values = submission.view.state.values
	const name = values.name!.value!.value
	const address = values.address!.value!.value

	await action.respond.message(
		`:white_check_mark: Sent your order to *${name}* at:\n\`\`\`\n${address}\n\`\`\``,
	)
})

await app.start()

import { actions, App, blocks, button, input, plainTextInput, section } from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN!,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('message', async (message) => {
	if (!message.isNormal() || !message.text?.startsWith('?order')) return

	const confirmMessage = await message.channel.send({
		text: 'Click here to enter your information',
		blocks: blocks(
			section('Click to enter your shipping info'),
			actions(button('Click me').id('info')),
		),
	})

	const action = await confirmMessage.wait
		.timeout(60_000)
		.action('button.info', ({ event }) => event.user.id === message.author.id)

	const modal = await action.respond.modal({
		type: 'modal',
		title: { type: 'plain_text', text: 'Place order' },
		submit: { type: 'plain_text', text: 'Order' },
		blocks: blocks(
			section('Please enter your shipping info below.'),
			input(plainTextInput().id('value')).id('name'),
			input(plainTextInput().id('value')).id('address'),
		),
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

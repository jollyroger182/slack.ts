import {
	actions,
	App,
	blocks,
	button,
	input,
	option,
	overflow,
	plainTextInput,
	section,
} from '../src'

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
			actions(
				button('Click me').id('info'),
				overflow(option('Cancel').value('cancel')).id('menu').confirm({
					title: 'Cancel order',
					text: 'Do you want to cancel your order?',
					confirm: 'Cancel',
					deny: 'Close',
					style: 'danger',
				}),
			),
		),
	})

	const action = await confirmMessage.wait
		.timeout(60_000)
		.action('info', 'menu', ({ event }) => event.user.id === message.author.id)

	if (action.action_id === 'menu') {
		return
	}

	const modal = await action.respond.modal({
		type: 'modal',
		title: { type: 'plain_text', text: 'Place order' },
		submit: { type: 'plain_text', text: 'Order' },
		blocks: blocks(
			section('Please enter your shipping info below.'),
			input(plainTextInput().id('value')).id('name').label('Name'),
			input(plainTextInput().id('value').multiline()).id('address').label('Address'),
		),
	})

	const submission = await modal.wait.timeout(300_000).submit()
	const name = submission.values.name.value.value
	const address = submission.values.address.value.value

	await action.respond.message(
		`:white_check_mark: Sent your order to *${name}* at:\n\`\`\`\n${address}\n\`\`\``,
	)
})

await app.start()

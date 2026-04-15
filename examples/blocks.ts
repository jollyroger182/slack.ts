import {
	actions,
	App,
	blocks,
	button,
	checkboxes,
	datePicker,
	datetimePicker,
	emailInput,
	fileInput,
	image,
	input,
	mrkdwn,
	option,
	optionGroup,
	overflow,
	plain,
	plainTextInput,
	section,
	select,
	text,
} from 'slack.ts'

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('action.show_modal', async (action) => {
	const modal = await action.respond.modal({
		type: 'modal',
		callback_id: 'modal',
		title: { type: 'plain_text', text: 'modal' },
		submit: { type: 'plain_text', text: 'submit' },
		blocks: blocks(
			// section
			section(plain('plain text, no *mrkdwn*')),
			section(mrkdwn('also *mrkdwn* _text_')),
			section(text('*mrkdwn* _text_')),
			section('also *mrkdwn* _text_, with accessory').accessory(
				button('accessory').id('accessory'),
			),
			section('section with photo').accessory(
				image('a placeholder image').url('https://picsum.photos/100/100'),
			),
			section().fields('*mrkdwn* fields', plain('and plaintext _fields_')),

			// actions
			actions(
				button('normal').value('value').id('btn_normal'),
				button('link').url('https://example.com').id('btn_link'),
				button('primary').style('primary').id('btn_primary'),
				button('danger').style('danger').id('btn_danger'),
				overflow(option('item 1').value('a'), option('item 2').value('b')).id('overflow'),
			),
			// actions (inputs)
			actions(
				datePicker().default('2026-01-01').id('date_picker'),
				datetimePicker().default(new Date()).id('datetime_picker'),
				checkboxes(option('checkbox 1').value('a'), option('checkbox 2').value('b'))
					.default('a')
					.id('checkboxes'),
			).id('inputs'),
			// actions (select menus)
			actions(
				select(option('opt 1').value('a'), option('opt 2').value('b')).default('a').id('static'),
				select(
					optionGroup('x', option('opt 1').value('a'), option('opt 2').value('b')),
					optionGroup('y', option('opt 3').value('c')),
				)
					.placeholder('select a thing')
					.id('static2'),
				select().conversations().default(process.env.SLACK_CHANNEL!).id('convo'),
			).id('selects'),

			// input
			input(
				'multi static select',
				select(option('opt 1').value('a'), option('opt 2').value('b'))
					.multiple()
					.default('a', 'b')
					.id('mstatic'),
			).dispatch(),
			input(
				'multi convo select',
				select()
					.multiple()
					.conversations()
					.placeholder('placeholder')
					.confirm({ title: 'confirm?', text: 'are you sure?', confirm: 'yes', deny: 'no' })
					.id('value'),
			)
				.dispatch()
				.id('convo'),
			input('multi user select', select().multiple().users().id('value')).dispatch().id('user'),
			input('multi channel select', select().multiple().channels().id('value'))
				.dispatch()
				.id('channel'),
			input('multi dynamic select', select().multiple().dynamic().id('value'))
				.dispatch()
				.id('dynamic'),
			input(
				plainTextInput()
					.triggers('on_enter_pressed')
					.placeholder('enter something')
					.default('hello world')
					.min(1)
					.max(20)
					.id('input'),
			)
				.dispatch()
				.hint('enter any text')
				.label('text input'),
			input(
				emailInput()
					.triggers('on_enter_pressed')
					.placeholder('enter your email')
					.default('hello@example.com')
					.id('email'),
			).label('email input'),
			input(fileInput('jpg', 'png', 'jpeg').id('value'))
				.label('image')
				.optional()
				.id('file'),
		),
	})

	const submission = await modal.wait.submit()
	console.log(JSON.stringify(submission.values, null, 2))
})

app.on('action', (action) => {
	console.log(action.raw)
})

app.on('autocomplete', async (event) => {
	await event.respond(option('text').value('a'), option('more text').value('b'))
})

await app.start()

await app.channel(process.env.SLACK_CHANNEL!).send({
	blocks: blocks(actions(button('show modal with all blocks').id('show_modal'))),
})

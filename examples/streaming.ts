/**
 * This file implements a basic AI-connected chatbot. It requires the following environment
 * variables:
 *
 * - OPENAI_API_KEY: An API key to pass in the Authorization header, not including "Bearer".
 * - OPENAI_API_URL: An OpenAI-compatible request URL. Must support the `/chat/completions` endpoint.
 *   (Default: "https://api.openai.com/v1")
 * - OPENAI_MODEL: A string to pass in the "model" field in the request data. (Default: "gpt-5-nano")
 */

import { App, blocks, contextActions, feedbackButtons, iconButton } from 'slack.ts'

const API_KEY = process.env.OPENAPI_API_KEY
const API_URL = process.env.OPENAPI_API_URL || 'https://api.openai.com/v1'
const API_MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano'

if (!API_KEY) {
	throw new Error('OPENAPI_KEY environment variable not set')
}

async function* streamChatCompletion(message: string) {
	const resp = await fetch(`${API_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			model: API_MODEL,
			stream: true,
			messages: [{ role: 'user', content: message }],
		}),
	})

	const reader = resp.body!.getReader()
	const decoder = new TextDecoder()

	let remainingChunk = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		remainingChunk += decoder.decode(value)
		const lines = remainingChunk.split('\n')
		const fullLines = lines.slice(0, -1).filter((line) => line.startsWith('data: '))
		remainingChunk = lines[lines.length - 1] || ''

		for (const line of fullLines) {
			const data = line.slice(6)
			if (data === '[DONE]') break

			const parsed = JSON.parse(data)
			const token = parsed.choices[0]?.delta?.content as string | undefined
			if (token) yield token
		}
	}
}

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: { type: 'socket', appToken: process.env.SLACK_APP_TOKEN! },
})

app.on('message:normal', async (message) => {
	if (message.user === user_id || message.thread_ts || !message.text) return

	const stream = await message.stream({ id: message.user, team_id: message.team })
	for await (const chunk of streamChatCompletion(message.text)) {
		await stream.append(chunk)
	}
	await stream.stop({
		blocks: blocks(
			contextActions(
				feedbackButtons().positive('Good', 'good').negative('Bad', 'bad'),
				iconButton('trash', 'Delete this response'),
			),
		),
	})
})

const { user_id } = await app.request('auth.test', {})

await app.start()

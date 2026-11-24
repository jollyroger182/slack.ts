import { describe, expect, it, test } from 'bun:test'

import type { CardBlock } from '../types'
import { JSXError } from '../utils/jsx'
import { Actions, Alert, Card, Section } from './blocks'
import { Button, Image } from './elements'

describe('JSX block builders', () => {
	test('Actions block', () => {
		expect(
			<Actions id="blkid">
				<Button>text</Button>
			</Actions>,
		).toEqual({
			type: 'actions',
			block_id: 'blkid',
			elements: [{ type: 'button', text: { type: 'plain_text', text: 'text' } }],
		})

		expect(() => <Actions></Actions>).toThrow(JSXError)
		expect(() => (
			<Actions>
				<Image alt="alt" src="https://example.com"></Image>
			</Actions>
		)).toThrow(JSXError)
	})

	test('Alert block', () => {
		expect(<Alert level="info">hello world</Alert>).toEqual({
			type: 'alert',
			text: { type: 'mrkdwn', text: 'hello world' },
			level: 'info',
		})
		expect(
			<Alert id="blkid" plain emoji={false}>
				hello world
			</Alert>,
		).toEqual({
			type: 'alert',
			block_id: 'blkid',
			text: { type: 'plain_text', text: 'hello world', emoji: false },
		})

		expect(() => <Alert></Alert>).toThrow(JSXError)
	})

	test('Card block', () => {
		expect(<Card></Card>).toEqual({ type: 'card' })
		expect(
			<Card
				id="blkid"
				title="title"
				subtitle="subtitle"
				icon={<Image alt="icon alt" src="https://example.com/icon"></Image>}
				heroImage={<Image alt="hero alt" src="https://example.com/hero"></Image>}
			>
				body
				<Button>click</Button>
			</Card>,
		).toEqual({
			type: 'card',
			block_id: 'blkid',
			title: { type: 'mrkdwn', text: 'title' },
			subtitle: { type: 'mrkdwn', text: 'subtitle' },
			icon: { type: 'image', alt_text: 'icon alt', image_url: 'https://example.com/icon' },
			hero_image: { type: 'image', alt_text: 'hero alt', image_url: 'https://example.com/hero' },
			body: { type: 'mrkdwn', text: 'body' },
			actions: [{ type: 'button', text: { type: 'plain_text', text: 'click' } }],
		} satisfies CardBlock)

		expect(() => <Card icon="https://example.com"></Card>).toThrow(JSXError)
		expect(() => <Card heroImage="https://example.com"></Card>).toThrow(JSXError)
	})
})

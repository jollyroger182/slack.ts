import { App } from '../src'

const app = new App({ token: process.env.SLACK_TOKEN! })

const channel = app.channel(process.env.SLACK_CHANNEL!)
const message = await channel.send({ text: 'hello world' })
console.log(message.channel)

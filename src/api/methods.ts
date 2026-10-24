export type MethodMap = {
	'chat.postMessage': {
		params: { channel: string; text?: string }
		response: { ts: string; message: { ts: string } }
	}
}

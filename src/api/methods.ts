import type { Equals } from '../utils/types'

export type MethodMap = {
	'auth.test': {
		params: {}
		response: { url: string; team: string; user: string; team_id: string; user_id: string }
	}
	'chat.postMessage': {
		params: { channel: string; text?: string }
		response: { ts: string; message: { ts: string } }
	}
}

export type KnownMethods = keyof MethodMap
export type OptionalParamMethods = {
	[M in KnownMethods]: Equals<Partial<MethodMap[M]['params']>, MethodMap[M]['params']> extends true
		? M
		: never
}[KnownMethods]

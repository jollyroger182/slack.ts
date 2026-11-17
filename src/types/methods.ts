import type { Equals } from '../utils/types'
import type { DocumentedMethodMap } from './generated/methods'

interface CustomMethodMap {}

export interface MethodMap
	extends CustomMethodMap, Omit<DocumentedMethodMap, keyof CustomMethodMap> {}

export type KnownMethods = keyof MethodMap

export type OptionalParamMethods = {
	[M in KnownMethods]: Equals<Partial<MethodMap[M]['params']>, MethodMap[M]['params']> extends true
		? M
		: never
}[KnownMethods]

export type PaginatingMethods = {
	[M in KnownMethods]: MethodMap[M] extends {
		params: { cursor?: string; limit?: number }
		response: { response_metadata?: { next_cursor?: string } }
	}
		? M
		: never
}[KnownMethods]

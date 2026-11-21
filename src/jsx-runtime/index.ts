import { ensureChildren } from '../utils/jsx'

export function jsx(element: string | typeof Fragment | ((props: any) => JSX.Element), props: any) {
	if (typeof element === 'string') {
		return { $inline: element, props, children: ensureChildren(props.children) }
	}
	if (element == Fragment) {
		return ensureChildren(props.children)
	}
	return element(props)
}

export const jsxs = jsx

export const Fragment = Symbol()

export declare namespace JSX {
	type Element = any

	interface ElementChildrenAttribute {
		children: {}
	}

	interface IntrinsicAttributes {
		children?: any
	}

	interface IntrinsicElements {
		a: { href: string }
		b: {}
		strong: {}
		i: {}
		em: {}
		u: {}
		s: {}
		del: {}
		code: {}
	}
}

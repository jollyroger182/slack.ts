export function ensureChildren(children: any) {
	return flatten(Array.isArray(children) ? children : [children])
}

function flatten(array: any[]): any[] {
	return array
		.flatMap((x) => (Array.isArray(x) ? flatten(x) : [x]))
		.filter((x) => x !== null && x !== undefined && typeof x !== 'boolean')
		.map((x) => (typeof x === 'number' ? x.toString() : x))
}

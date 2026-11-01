import { resolve } from 'node:path'

import { cachedRequest, generateInterface } from '../utils'
import page from './index.html'

// usage: bun scripts/review-methods/server.ts [state.json] [--port 3939]

export interface MethodState {
	reviewed?: boolean
	notes?: string
	// arg.name -> TS type
	args?: Record<string, string>
	// arg.name -> required, only where it differs from the docs
	argsRequired?: Record<string, boolean>
	// response paths (`path.join(',')`) that are not optional
	required?: string[]
	// response path -> TS type
	types?: Record<string, string>
	// response path -> replacement example value
	values?: Record<string, unknown>
}

export interface ReviewState {
	// slack type -> TS type
	typeMap: Record<string, string>
	methods: Record<string, MethodState>
}

export interface MethodArg {
	name: string
	// missing when the docs don't list a type
	type?: string
	required: boolean
}

export interface MethodInfo {
	name: string
	description: string
	family: string
	args: MethodArg[]
	// heading ids on the docs page, e.g. `arguments`, `response`
	anchors: string[]
	// undefined when generate-methods would skip the method
	example?: unknown
	rawExample?: string
	issue?: 'no-example' | 'parse-failed' | 'empty'
	error?: string
}

const argv = process.argv.slice(2)
const portIndex = argv.indexOf('--port')
const port = portIndex === -1 ? 3939 : Number(argv.splice(portIndex, 2)[1])
const statePath = resolve(argv[0] ?? 'scripts/generate-methods.json')

// keep in sync with scripts/generate-methods.ts
const removeExamplePrefixes = [`{"url": "","description": "Typical success response","example": `]

async function loadMethods(): Promise<MethodInfo[]> {
	const list = JSON.parse(await cachedRequest('https://docs.slack.dev/reference/methods.json')) as {
		name: string
		description: string
		family: [string]
	}[]

	const methods: MethodInfo[] = []
	for (const { name, description, family } of list) {
		const page = await cachedRequest(`https://docs.slack.dev/reference/methods/${name}.md`)

		const args = Array.from(
			page.matchAll(/^\*\*`(.+)`\*\*(?:`(.+)`)?(Required|Optional)$/gm),
			(m) => ({
				name: m[1]!,
				type: m[2],
				required: m[3] === 'Required',
			}),
		)

		const anchors = Array.from(page.matchAll(/^#+ .+ \{#([^}]+)\}$/gm), (m) => m[1]!)

		const info: MethodInfo = { name, description, family: family[0], args, anchors }
		methods.push(info)

		const exampleMatch = page.match(
			/## Response {#response}\n\n(?:#### [^\n]+\n\n)?```\n(.+?)\n```/s,
		)
		let exampleJson = '{}'
		if (!exampleMatch) {
			info.issue = 'no-example'
		} else {
			exampleJson = exampleMatch[1]!
			for (const prefix of removeExamplePrefixes) {
				if (exampleJson.startsWith(prefix)) {
					exampleJson = exampleJson.substring(prefix.length)
				}
			}
			info.rawExample = exampleJson
		}

		let example
		try {
			example = JSON.parse(exampleJson)
		} catch (e) {
			info.issue = 'parse-failed'
			info.error = String(e)
			continue
		}
		if (typeof example === 'string') example = {}
		delete example.ok

		info.example = example
		if (!info.issue && !Object.keys(example).length) info.issue = 'empty'
	}
	return methods
}

function own<T>(record: Record<string, T> | undefined, key: string): T | undefined {
	return record && Object.hasOwn(record, key) ? record[key] : undefined
}

// mirrors the output of scripts/generate-methods.ts for one method
function render(info: MethodInfo, state: ReviewState) {
	if (info.example === undefined) return `// skipped by generate-methods: ${info.error}`

	const method = own(state.methods, info.name) ?? {}

	const lines = [`export interface ${tsName(info.name)}Params {`]
	for (const arg of info.args) {
		if (arg.name === 'token') continue

		const type =
			own(method.args, arg.name) ??
			(arg.type ? (own(state.typeMap, arg.type) ?? arg.type) : 'unknown')
		const required = own(method.argsRequired, arg.name) ?? arg.required
		lines.push(`\t"${arg.name}"${required ? '' : '?'}: ${type}`)
	}
	lines.push('}')

	lines.push(
		generateInterface(info.example, `${tsName(info.name)}Response`, {
			isOptional: (path) => !(method.required ?? []).includes(path.join(',')),
			overrideType: (path) => own(method.types, path.join(',')),
			overrideValue: (path) => own(method.values, path.join(',')),
		}),
	)
	return lines.join('\n')
}

function tsName(name: string) {
	return name[0]?.toUpperCase() + name.replace(/\.([a-z])/g, (_, c) => c.toUpperCase()).substring(1)
}

function sortKeys<T>(record: Record<string, T> = {}) {
	return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
}

// drops empty fields and sorts keys so the file diffs cleanly
function normalize(state: ReviewState): ReviewState {
	const methods: Record<string, MethodState> = {}
	for (const [name, method] of Object.entries(sortKeys(state.methods))) {
		const out: MethodState = {}
		if (method.reviewed) out.reviewed = true
		if (method.notes?.trim()) out.notes = method.notes
		if (method.args && Object.keys(method.args).length) out.args = method.args
		if (method.argsRequired && Object.keys(method.argsRequired).length) {
			out.argsRequired = method.argsRequired
		}
		if (method.required?.length) out.required = [...new Set(method.required)]
		if (method.types && Object.keys(method.types).length) out.types = method.types
		if (method.values && Object.keys(method.values).length) out.values = method.values
		if (Object.keys(out).length) methods[name] = out
	}
	return { typeMap: sortKeys(state.typeMap), methods }
}

async function readStateText() {
	const file = Bun.file(statePath)
	return (await file.exists()) ? await file.text() : ''
}

function parseState(text: string): ReviewState {
	const state = text ? (JSON.parse(text) as Partial<ReviewState>) : {}
	return {
		typeMap: state.typeMap ?? { integer: 'number', array: 'unknown[]' },
		methods: state.methods ?? {},
	}
}

const methods = await loadMethods()
const methodsByName = new Map(methods.map((m) => [m.name, m]))

// what we last read or wrote, to notice edits made to the file by hand
let lastStateText = await readStateText()

Bun.serve({
	port,
	development: true,
	routes: {
		'/': page,
		'/api/methods': () => Response.json(methods),
		'/api/state': {
			GET: async () => {
				lastStateText = await readStateText()
				return Response.json({ path: statePath, state: parseState(lastStateText) })
			},
			PUT: async (req) => {
				const onDisk = await readStateText()
				if (onDisk !== lastStateText && !new URL(req.url).searchParams.has('force')) {
					// the client gets the disk version and decides, so don't conflict on it again
					lastStateText = onDisk
					return Response.json({ path: statePath, state: parseState(onDisk) }, { status: 409 })
				}
				const text = JSON.stringify(normalize((await req.json()) as ReviewState), null, '\t') + '\n'
				if (text !== onDisk) await Bun.write(statePath, text)
				lastStateText = text
				return Response.json({ ok: true })
			},
		},
		'/api/preview': {
			POST: async (req) => {
				const { name, state } = (await req.json()) as { name: string; state: ReviewState }
				const info = methodsByName.get(name)
				if (!info) return new Response('unknown method', { status: 404 })
				return Response.json({ ts: render(info, state) })
			},
		},
	},
})

console.log(`reviewing ${methods.length} methods, saving to ${statePath}`)
console.log(`http://localhost:${port}`)

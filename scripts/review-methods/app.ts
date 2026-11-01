import type { MethodInfo, MethodState, ReviewState } from './server'

type Filter = 'todo' | 'reviewed' | 'edited' | 'issues' | 'all'
type Child = Node | string | null | undefined | false

interface Row {
	path: string[]
	key: string
	label: string
	depth: number
	// depth counting only object keys, used for the default collapse level
	keyDepth: number
	kind: string
	sample: string
	inferred: string
	// example value before any value override, to prefill the value editor
	original: unknown
	requirable: boolean
	expandable: boolean
	typeOverride?: string
	valueOverride: boolean
	hidden: boolean
}

const filters: [Filter, string][] = [
	['todo', 'to review'],
	['reviewed', 'reviewed'],
	['edited', 'edited'],
	['issues', 'issues'],
	['all', 'all'],
]

let methods: MethodInfo[] = []
const byName = new Map<string, MethodInfo>()
// arg.name -> every method that has a param with that name
const argUsage = new Map<string, { method: string; type?: string }[]>()

let state: ReviewState
let statePath = ''
let current: string | null = null
let view: 'method' | 'maps' = 'method'
let filter: Filter = 'todo'
let query = ''
let mapsQuery = ''

// method -> collapsed response paths
const collapsed = new Map<string, Set<string>>()
// `${method}|${path}` -> draft text of an open value editor
const valueDrafts = new Map<string, string>()
const valueErrors = new Map<string, string>()

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

function h<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	props: Record<string, unknown> = {},
	...children: Child[]
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag)
	for (const [k, v] of Object.entries(props)) {
		if (v === undefined || (v === false && !(k in el))) continue
		if (k === 'class') el.className = String(v)
		else if (k === 'style') el.setAttribute('style', String(v))
		else if (k.startsWith('data-')) el.setAttribute(k, String(v))
		else if (k in el) (el as any)[k] = v
		else el.setAttribute(k, String(v))
	}
	el.append(...(children.filter((c) => c != null && c !== false) as (Node | string)[]))
	return el
}

function own<T>(record: Record<string, T> | undefined, key: string): T | undefined {
	return record && Object.hasOwn(record, key) ? record[key] : undefined
}

function methodState(name: string, create = false): MethodState {
	let m = own(state.methods, name)
	if (!m) {
		m = {}
		if (create) state.methods[name] = m
	}
	return m
}

function setRecord<T>(record: Record<string, T> | undefined, key: string, value: T | undefined) {
	const out = { ...record }
	if (value === undefined) delete out[key]
	else out[key] = value
	return out
}

function isEdited(m: MethodState) {
	return !!(
		m.required?.length ||
		Object.keys(m.args ?? {}).length ||
		Object.keys(m.argsRequired ?? {}).length ||
		Object.keys(m.types ?? {}).length ||
		Object.keys(m.values ?? {}).length ||
		m.notes?.trim()
	)
}

function matchesFilter(info: MethodInfo, f: Filter) {
	const m = methodState(info.name)
	switch (f) {
		case 'todo':
			return !m.reviewed
		case 'reviewed':
			return !!m.reviewed
		case 'edited':
			return isEdited(m)
		case 'issues':
			return !!info.issue
		case 'all':
			return true
	}
}

// space-separated terms that all have to match; each term is a case-insensitive regex,
// or a plain substring when it isn't valid regex (e.g. while still typing it)
function compileQuery(q: string) {
	let invalid = false
	const matchers = q
		.split(/\s+/)
		.filter(Boolean)
		.map((term) => {
			try {
				const re = new RegExp(term, 'i')
				return (s: string) => re.test(s)
			} catch {
				invalid = true
				const lower = term.toLowerCase()
				return (s: string) => s.toLowerCase().includes(lower)
			}
		})
	return {
		invalid,
		// a term matches if it matches any of the given strings
		test: (...strings: string[]) => matchers.every((m) => strings.some(m)),
	}
}

function visibleMethods() {
	const q = compileQuery(query)
	return methods.filter((info) => matchesFilter(info, filter) && q.test(info.name))
}

// ---- saving ----

let saveTimer: ReturnType<typeof setTimeout> | undefined
let saving = false
let saveAgain = false
let conflictState: ReviewState | null = null

function setStatus(text: string, error = false) {
	const el = $('save-status')
	el.textContent = text
	el.classList.toggle('error', error)
}

function changed() {
	setStatus(conflictState ? 'conflict' : 'unsaved', !!conflictState)
	clearTimeout(saveTimer)
	saveTimer = setTimeout(() => save(), 400)
	schedulePreview()
}

async function save(force = false) {
	saveTimer = undefined
	if (conflictState && !force) return
	if (saving) {
		saveAgain = true
		return
	}
	saving = true
	setStatus('saving…')
	try {
		const res = await fetch(`/api/state${force ? '?force=1' : ''}`, {
			method: 'PUT',
			body: JSON.stringify(state),
		})
		if (res.status === 409) {
			conflictState = ((await res.json()) as { state: ReviewState }).state
			$('conflict').hidden = false
			setStatus('conflict', true)
			return
		}
		if (!res.ok) throw new Error(await res.text())
		setStatus('saved')
	} catch (e) {
		console.error(e)
		setStatus('save failed', true)
	} finally {
		saving = false
		if (saveAgain) {
			saveAgain = false
			save()
		}
	}
}

window.addEventListener('pagehide', () => {
	if (saveTimer && !conflictState) {
		fetch('/api/state', { method: 'PUT', body: JSON.stringify(state), keepalive: true })
	}
})

$('conflict-reload').onclick = () => {
	if (!conflictState) return
	state = conflictState
	conflictState = null
	$('conflict').hidden = true
	setStatus('loaded from disk')
	renderAll()
	schedulePreview()
}

$('conflict-overwrite').onclick = () => {
	conflictState = null
	$('conflict').hidden = true
	save(true)
}

// ---- preview ----

let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewSeq = 0
let previewText = ''

function schedulePreview() {
	clearTimeout(previewTimer)
	previewTimer = setTimeout(updatePreview, 120)
}

async function updatePreview() {
	const seq = ++previewSeq
	if (view !== 'method' || !current) {
		previewText = ''
		$('preview-code').textContent = view === 'maps' ? 'pick a method to preview its output' : ''
		return
	}
	const res = await fetch('/api/preview', {
		method: 'POST',
		body: JSON.stringify({ name: current, state }),
	})
	const text = res.ok
		? ((await res.json()) as { ts: string }).ts
		: `// preview failed: ${await res.text()}`
	if (seq !== previewSeq) return
	previewText = text
	$('preview-code').innerHTML = highlight(text)
}

function escapeHtml(s: string) {
	return s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

function highlight(ts: string) {
	return ts
		.split('\n')
		.map((line) => {
			const m = line.match(/^(\t*)"([^"]*)"(\??): (.*)$/)
			if (m) {
				const [, indent, key, opt, type] = m
				return `${indent}<span class="k${opt ? '' : ' req'}">"${escapeHtml(key!)}"</span>${
					opt ? '<span class="opt">?</span>' : ''
				}<span class="p">: </span><span class="t">${escapeHtml(type!)}</span>`
			}
			return escapeHtml(line).replace(
				/^export interface/,
				'<span class="kw">export interface</span>',
			)
		})
		.join('\n')
}

$('copy-preview').onclick = () => navigator.clipboard.writeText(previewText)

// ---- sidebar ----

function renderSidebar() {
	const reviewed = methods.filter((m) => methodState(m.name).reviewed).length
	$('progress-bar').style.width = `${(reviewed / methods.length) * 100}%`
	$('progress-text').textContent = `${reviewed} / ${methods.length} reviewed`

	$('filters').replaceChildren(
		...filters.map(([f, label]) =>
			h(
				'button',
				{
					class: f === filter ? 'active' : '',
					onclick: () => {
						filter = f
						renderSidebar()
					},
				},
				`${label} ${methods.filter((m) => matchesFilter(m, f)).length}`,
			),
		),
	)

	const items: Node[] = []
	let family = ''
	for (const info of visibleMethods()) {
		if (info.family !== family) {
			family = info.family
			items.push(h('div', { class: 'family' }, family))
		}
		const m = methodState(info.name)
		let mark = h('span', { class: 'mark' })
		if (info.issue === 'parse-failed') {
			mark = h('span', { class: 'mark bad', title: 'skipped: example is not valid JSON' }, '✕')
		} else if (m.reviewed) {
			mark = h('span', { class: 'mark reviewed', title: 'reviewed' }, '✓')
		} else if (info.issue) {
			mark = h('span', { class: 'mark issue', title: issueText(info) }, '!')
		}
		items.push(
			h(
				'div',
				{
					class: `method-item${info.name === current && view === 'method' ? ' selected' : ''}${m.reviewed ? ' reviewed' : ''}`,
					'data-name': info.name,
					onclick: () => select(info.name),
				},
				mark,
				h('span', { class: 'name' }, info.name),
				isEdited(m) && h('span', { class: 'mark edited', title: 'has overrides or notes' }, '●'),
			),
		)
	}
	if (!items.length) items.push(h('div', { class: 'family' }, 'nothing here'))
	$('method-list').replaceChildren(...items)
	$('state-path').textContent = statePath
}

function issueText(info: MethodInfo) {
	switch (info.issue) {
		case 'no-example':
			return 'no response example in the docs'
		case 'empty':
			return 'example has no fields besides ok'
		case 'parse-failed':
			return 'example is not valid JSON'
	}
	return ''
}

function select(name: string) {
	view = 'method'
	current = name
	if (decodeURIComponent(location.hash.slice(1)) !== name)
		history.replaceState(null, '', `#${name}`)
	renderAll()
	$('main').scrollTop = 0
	document
		.querySelector(`.method-item[data-name="${CSS.escape(name)}"]`)
		?.scrollIntoView({ block: 'nearest' })
	schedulePreview()
}

// "12 / 200" within the current filter, or "– / 200" when the method is filtered out
function positionText() {
	const visible = visibleMethods()
	const index = visible.findIndex((m) => m.name === current)
	return `${index === -1 ? '–' : index + 1} / ${visible.length}`
}

function move(delta: number) {
	const visible = visibleMethods()
	if (!visible.length) return
	let index = visible.findIndex((m) => m.name === current)
	if (index === -1) {
		// current method was filtered out (e.g. just reviewed), continue from its position in the full list
		const pos = methods.findIndex((m) => m.name === current)
		index = visible.findIndex((m) => methods.indexOf(m) > pos)
		if (index === -1) index = visible.length
		if (delta > 0) index -= 1
	}
	const next = visible[Math.max(0, Math.min(visible.length - 1, index + delta))]
	if (next) select(next.name)
}

function toggleReviewed(name: string) {
	const m = methodState(name, true)
	m.reviewed = !m.reviewed
	changed()
	return m.reviewed
}

// marking reviewed moves on to the next method, unmarking stays put
function toggleReviewedAndAdvance() {
	const name = current
	if (!name) return
	if (toggleReviewed(name)) move(1)
	// move() doesn't render when there's nowhere to go
	if (current === name) renderAll()
}

// ---- method view ----

function buildRows(info: MethodInfo, m: MethodState, collapsedPaths = new Set<string>()): Row[] {
	const rows: Row[] = []

	function walk(
		obj: any,
		path: string[],
		depth: number,
		keyDepth: number,
		label: string,
		requirable: boolean,
		hidden: boolean,
	) {
		const key = path.join(',')
		const original = obj
		const typeOverride = path.length ? own(m.types, key) : undefined
		// generateInterface checks type overrides first and ignores falsy override values
		const valueOverride = !typeOverride && !!own(m.values, key)
		if (valueOverride) obj = own(m.values, key)

		let kind: string
		let sample = ''
		if (typeOverride) {
			kind = 'type'
		} else if (Array.isArray(obj)) {
			kind = obj.length ? 'array' : 'unknown[]'
			sample = `${obj.length} item${obj.length === 1 ? '' : 's'}`
		} else if (obj === null || obj === undefined) {
			kind = 'unknown'
			sample = String(obj)
		} else if (typeof obj === 'object') {
			const n = Object.keys(obj).length
			kind = n ? 'object' : '{}'
			sample = `${n} key${n === 1 ? '' : 's'}`
		} else {
			kind = typeof obj
			sample = JSON.stringify(obj)
		}

		const expandable =
			!typeOverride && (Array.isArray(obj) ? obj.length > 0 : kind === 'object' && obj !== null)
		rows.push({
			path,
			key,
			label,
			depth,
			keyDepth,
			kind,
			sample,
			inferred: inferType(obj),
			original,
			requirable,
			expandable,
			typeOverride,
			valueOverride,
			hidden,
		})
		if (!expandable) return

		const childHidden = hidden || collapsedPaths.has(key)
		if (Array.isArray(obj)) {
			walk(obj[0], [...path, '0'], depth + 1, keyDepth, '[0]', false, childHidden)
		} else {
			for (const [k, v] of Object.entries(obj)) {
				walk(v, [...path, k], depth + 1, keyDepth + 1, k, true, childHidden)
			}
		}
	}

	walk(info.example, [], 0, 0, 'response', false, false)
	return rows
}

function inferType(obj: unknown): string {
	if (Array.isArray(obj)) return obj.length ? `${inferType(obj[0])}[]` : 'unknown[]'
	if (obj === null || obj === undefined) return 'unknown'
	if (typeof obj === 'object') return Object.keys(obj).length ? '{ … }' : '{}'
	return typeof obj
}

function collapsedFor(info: MethodInfo) {
	let set = collapsed.get(info.name)
	if (!set) {
		// default: show top-level keys and one level below them
		set = new Set(
			buildRows(info, methodState(info.name))
				.filter((r) => r.expandable && r.keyDepth >= 2)
				.map((r) => r.key),
		)
		collapsed.set(info.name, set)
	}
	return set
}

function setRequired(info: MethodInfo, keys: string[], on: boolean) {
	const m = methodState(info.name, true)
	const set = new Set(m.required ?? [])
	for (const key of keys) {
		if (on) set.add(key)
		else set.delete(key)
	}
	const order = buildRows(info, m).map((r) => r.key)
	m.required = [...order.filter((k) => set.has(k)), ...[...set].filter((k) => !order.includes(k))]
	changed()
}

function renderAll() {
	renderSidebar()
	renderMain()
}

// re-renders the main pane, keeping focus and caret in the input being typed in
function renderMain() {
	const main = $('main')
	const active = document.activeElement as HTMLInputElement | null
	const fid = active?.dataset?.fid
	const selection = fid ? [active!.selectionStart, active!.selectionEnd] : null
	const scroll = main.scrollTop

	main.replaceChildren(...(view === 'maps' ? renderMaps() : renderMethod()))

	main.scrollTop = scroll
	if (fid) {
		const el = main.querySelector<HTMLInputElement>(`[data-fid="${CSS.escape(fid)}"]`)
		if (el) {
			el.focus()
			if (selection?.[0] != null) el.setSelectionRange(selection[0], selection[1] ?? null)
		}
	}
}

function renderMethod(): Node[] {
	const info = current ? byName.get(current) : undefined
	if (!info) return [h('p', { class: 'muted' }, 'pick a method on the left')]
	const m = methodState(info.name)
	const out: Node[] = []

	out.push(
		h(
			'div',
			{ class: 'method-head' },
			h('div', {}, h('h2', {}, info.name), h('p', { class: 'description' }, info.description)),
			h(
				'div',
				{ class: 'actions' },
				docsLink(info, undefined, 'docs ↗', 'button-link'),
				h('button', { title: 'previous (k)', onclick: () => move(-1) }, '←'),
				h('span', { class: 'position muted small' }, positionText()),
				h('button', { title: 'next (j)', onclick: () => move(1) }, '→'),
				h(
					'button',
					{
						class: m.reviewed ? 'done' : 'primary',
						title: m.reviewed ? 'unmark (r)' : 'mark reviewed and go to the next one (r)',
						onclick: toggleReviewedAndAdvance,
					},
					m.reviewed ? 'reviewed ✓' : 'mark reviewed (r)',
				),
			),
		),
	)

	if (info.issue === 'parse-failed') {
		out.push(
			h(
				'div',
				{ class: 'banner bad' },
				"the docs example isn't valid JSON, so generate-methods skips this method entirely. overrides can't fix it; the parsing in the script has to.",
				h('pre', { class: 'mono' }, `${info.error}\n\n${info.rawExample ?? ''}`),
			),
		)
		out.push(renderNotes(info, m), ...renderParams(info))
		return out
	}
	if (info.issue === 'no-example') {
		out.push(
			h(
				'div',
				{ class: 'banner warn' },
				'the docs have no response example, so the response is generated from {}. give the root row a value override to give it a shape.',
			),
		)
	} else if (info.issue === 'empty') {
		out.push(
			h(
				'div',
				{ class: 'banner warn' },
				'the docs example has no fields besides ok. if the method does return more, give the root row a value override.',
			),
		)
	}

	out.push(renderNotes(info, m))
	out.push(...renderResponse(info, m))
	out.push(...renderParams(info))

	if (info.rawExample !== undefined) {
		let pretty = info.rawExample
		try {
			pretty = JSON.stringify(JSON.parse(pretty), null, 2)
		} catch {}
		out.push(
			h(
				'section',
				{},
				h('details', {}, h('summary', {}, 'raw docs example'), h('pre', { class: 'mono' }, pretty)),
			),
		)
	}

	out.push(
		h(
			'div',
			{ class: 'kbd-help' },
			h('kbd', {}, 'j'),
			' / ',
			h('kbd', {}, 'k'),
			' next / previous   ',
			h('kbd', {}, 'r'),
			' toggle reviewed (and go next)   ',
			h('kbd', {}, '/'),
			' search   ',
			h('kbd', {}, 'd'),
			' / ',
			h('kbd', {}, 'p'),
			' / ',
			h('kbd', {}, 'e'),
			' docs: page / params / response   ',
			h('kbd', {}, 'esc'),
			' leave a text field',
		),
	)
	return out
}

const docsKeys: Record<string, string> = { page: 'd', arguments: 'p', response: 'e' }

// every docs link opens in the same named tab
function docsLink(info: MethodInfo, anchor?: string, label = 'docs ↗', cls = 'doc-link') {
	if (anchor && !info.anchors.includes(anchor)) return null
	return h(
		'a',
		{
			class: cls,
			href: `https://docs.slack.dev/reference/methods/${info.name}${anchor ? `#${anchor}` : ''}`,
			target: 'slack-docs',
			title: `open in the slack-docs tab (${docsKeys[anchor ?? 'page']})`,
			'data-doc': anchor ?? 'page',
		},
		label,
	)
}

function renderNotes(info: MethodInfo, m: MethodState) {
	return h(
		'section',
		{},
		h('div', { class: 'section-head' }, h('h3', {}, 'notes')),
		h('textarea', {
			class: 'notes',
			rows: 1,
			placeholder:
				'anything to remember about this method (saved in the json, ignored by the script)',
			value: m.notes ?? '',
			'data-fid': 'notes',
			oninput: (e: Event) => {
				methodState(info.name, true).notes = (e.target as HTMLTextAreaElement).value
				changed()
				renderSidebar()
			},
		}),
	)
}

function renderResponse(info: MethodInfo, m: MethodState): Node[] {
	const collapsedPaths = collapsedFor(info)
	const rows = buildRows(info, m, collapsedPaths)
	const required = new Set(m.required ?? [])
	const topLevel = rows.filter((r) => r.depth === 1 && r.requirable).map((r) => r.key)

	const head = h(
		'div',
		{ class: 'section-head' },
		h(
			'h3',
			{},
			`response · ${[...required].filter((k) => rows.some((r) => r.key === k)).length} required`,
		),
		docsLink(info, 'response'),
		h(
			'button',
			{ class: 'small-btn', onclick: () => (setRequired(info, topLevel, true), renderAll()) },
			'require all top-level',
		),
		h(
			'button',
			{
				class: 'small-btn',
				onclick: () => (setRequired(info, [...required], false), renderAll()),
			},
			'clear required',
		),
		h(
			'button',
			{
				class: 'small-btn',
				onclick: () => {
					collapsedPaths.clear()
					renderMain()
				},
			},
			'expand all',
		),
		h(
			'button',
			{
				class: 'small-btn',
				onclick: () => {
					for (const r of rows) if (r.expandable && r.depth >= 1) collapsedPaths.add(r.key)
					renderMain()
				},
			},
			'collapse',
		),
	)

	const tree = h(
		'div',
		{ class: 'tree' },
		h(
			'div',
			{ class: 'tree-row header' },
			h('span', {}, 'key'),
			h('span', { class: 'req-cell' }, 'required'),
			h('span', {}, 'override type'),
			h('span', { title: 'override example value' }, '{ }'),
		),
	)

	for (const row of rows) {
		if (row.hidden) continue
		const isRequired = required.has(row.key)
		const editorId = `${info.name}|${row.key}`
		const editorOpen = valueDrafts.has(editorId)

		const keyCell = h(
			'div',
			{ class: 'key-cell', style: `padding-left:${row.depth * 16}px`, title: row.key || '(root)' },
			h(
				'span',
				{
					class: 'caret',
					onclick: row.expandable
						? () => {
								if (collapsedPaths.has(row.key)) collapsedPaths.delete(row.key)
								else collapsedPaths.add(row.key)
								renderMain()
							}
						: undefined,
				},
				row.expandable ? (collapsedPaths.has(row.key) ? '▸' : '▾') : '',
			),
			h(
				'span',
				{
					class: `key${row.label === '[0]' ? ' array-item' : ''}`,
					style: row.depth === 0 ? 'font-style:italic' : undefined,
				},
				row.label,
			),
			h(
				'span',
				{ class: `kind${['unknown', 'unknown[]', '{}'].includes(row.kind) ? ' unknown' : ''}` },
				row.kind,
			),
			h('span', { class: 'sample' }, row.valueOverride ? `${row.sample} (overridden)` : row.sample),
		)

		const reqCell = h(
			'span',
			{ class: 'req-cell' },
			row.requirable &&
				h('input', {
					type: 'checkbox',
					checked: isRequired,
					onchange: (e: Event) => {
						setRequired(info, [row.key], (e.target as HTMLInputElement).checked)
						renderAll()
					},
				}),
		)

		const typeInput = h('input', {
			type: 'text',
			class: 'mono',
			value: row.typeOverride ?? '',
			placeholder: row.depth === 0 ? 'use a value override' : row.inferred,
			disabled: row.depth === 0,
			title:
				row.depth === 0
					? 'generateInterface would emit `export interface X <type>`, which is not valid TS'
					: undefined,
			'data-fid': `type|${row.key}`,
			oninput: (e: Event) => {
				const value = (e.target as HTMLInputElement).value
				const method = methodState(info.name, true)
				method.types = setRecord(method.types, row.key, value.trim() ? value : undefined)
				changed()
				renderAll()
			},
			onkeydown: (e: KeyboardEvent) => {
				if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
			},
		})

		const valueBtn = h(
			'button',
			{
				class: `value-btn${row.valueOverride ? ' set' : ''}`,
				title: row.valueOverride ? 'edit value override' : 'override example value',
				disabled: !!row.typeOverride,
				onclick: () => {
					if (editorOpen) {
						valueDrafts.delete(editorId)
						valueErrors.delete(editorId)
					} else {
						const existing = own(m.values, row.key) ?? row.original
						valueDrafts.set(editorId, JSON.stringify(existing ?? null, null, 2))
					}
					renderMain()
				},
			},
			'{ }',
		)

		tree.append(
			h(
				'div',
				{
					class: `tree-row${isRequired ? ' required' : ''}${row.typeOverride || row.valueOverride ? ' overridden' : ''}`,
				},
				keyCell,
				reqCell,
				typeInput,
				valueBtn,
			),
		)

		if (editorOpen) tree.append(renderValueEditor(info, row, editorId))
	}

	const out: Node[] = [h('section', {}, head, tree)]

	// overrides that point at paths missing from the example (docs changed, or under a type override)
	const live = new Map(rows.map((r) => [r.key, r]))
	const stale: [string, string, () => void][] = []
	for (const key of m.required ?? []) {
		if (!live.get(key)?.requirable) {
			stale.push(['required', key, () => setRequired(info, [key], false)])
		}
	}
	for (const key of Object.keys(m.types ?? {})) {
		if (!live.has(key)) {
			stale.push(['type', key, () => (m.types = setRecord(m.types, key, undefined))])
		}
	}
	for (const key of Object.keys(m.values ?? {})) {
		if (!live.has(key)) {
			stale.push(['value', key, () => (m.values = setRecord(m.values, key, undefined))])
		}
	}
	if (stale.length) {
		out.push(
			h(
				'div',
				{ class: 'stale' },
				"these overrides point at paths that aren't in the example (or sit under a type override), so they do nothing:",
				h(
					'ul',
					{},
					...stale.map(([what, key, remove]) =>
						h(
							'li',
							{},
							`${what} `,
							h('code', {}, key || '(root)'),
							' ',
							h(
								'button',
								{
									class: 'small-btn',
									onclick: () => {
										remove()
										changed()
										renderAll()
									},
								},
								'remove',
							),
						),
					),
				),
			),
		)
	}
	return out
}

function renderValueEditor(info: MethodInfo, row: Row, editorId: string) {
	const close = () => {
		valueDrafts.delete(editorId)
		valueErrors.delete(editorId)
		renderAll()
	}
	const error = valueErrors.get(editorId)

	return h(
		'div',
		{ class: 'value-editor' },
		h(
			'div',
			{ class: 'muted small' },
			`replacement example value for `,
			h('code', {}, row.key || '(root)'),
			'. types (and the required / override paths below it) are generated from this instead of the docs example.',
		),
		h('textarea', {
			class: 'mono',
			value: valueDrafts.get(editorId) ?? '',
			'data-fid': `value|${row.key}`,
			spellcheck: false,
			oninput: (e: Event) => valueDrafts.set(editorId, (e.target as HTMLTextAreaElement).value),
		}),
		error && h('div', { class: 'error-text' }, error),
		h(
			'div',
			{ class: 'row' },
			h(
				'button',
				{
					class: 'primary',
					onclick: () => {
						let value: unknown
						try {
							value = JSON.parse(valueDrafts.get(editorId) ?? '')
						} catch (e) {
							valueErrors.set(editorId, String(e))
							return renderMain()
						}
						if (!value) {
							valueErrors.set(
								editorId,
								'generateInterface ignores falsy override values (null, 0, false, ""). use a type override instead.',
							)
							return renderMain()
						}
						const m = methodState(info.name, true)
						m.values = setRecord(m.values, row.key, value)
						changed()
						close()
					},
				},
				'apply',
			),
			row.valueOverride &&
				h(
					'button',
					{
						onclick: () => {
							const m = methodState(info.name, true)
							m.values = setRecord(m.values, row.key, undefined)
							changed()
							close()
						},
					},
					'remove override',
				),
			h('button', { onclick: close }, 'cancel'),
		),
	)
}

function argTypeInput(method: string, arg: string, fallback: string) {
	return h('input', {
		type: 'text',
		class: 'mono',
		value: own(methodState(method).args, arg) ?? '',
		placeholder: fallback,
		'data-fid': `arg|${method}|${arg}`,
		oninput: (e: Event) => {
			const value = (e.target as HTMLInputElement).value
			const m = methodState(method, true)
			m.args = setRecord(m.args, arg, value.trim() ? value : undefined)
			changed()
			renderAll()
		},
		onkeydown: (e: KeyboardEvent) => {
			if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
		},
	})
}

// what a param gets without a per-method override, same as generate-methods
function defaultArgType(slackType: string | undefined) {
	return slackType ? (own(state.typeMap, slackType) ?? slackType) : 'unknown'
}

function slackTypeCell(slackType: string | undefined) {
	return slackType
		? h('td', { class: 'mono muted' }, slackType)
		: h('td', { class: 'muted', title: "the docs don't list a type" }, '—')
}

function isLooseType(type: string) {
	return ['unknown[]', 'object', 'unknown'].includes(type)
}

function renderParams(info: MethodInfo): Node[] {
	const args = info.args.filter((a) => a.name !== 'token')
	const m = methodState(info.name)
	const out: Node[] = []

	if (!args.length) {
		out.push(
			h(
				'section',
				{},
				h('div', { class: 'section-head' }, h('h3', {}, 'params'), docsLink(info, 'arguments')),
				h('p', { class: 'muted' }, 'none'),
			),
		)
	} else {
		out.push(
			h(
				'section',
				{},
				h('div', { class: 'section-head' }, h('h3', {}, 'params'), docsLink(info, 'arguments')),
				h(
					'table',
					{},
					h(
						'thead',
						{},
						h(
							'tr',
							{},
							h('th', {}, 'name'),
							h('th', { class: 'req-cell' }, 'required'),
							h('th', {}, 'slack type'),
							h('th', {}, 'generated'),
							h('th', { style: 'width:30%' }, 'override type'),
							h('th', {}, 'same param elsewhere'),
						),
					),
					h(
						'tbody',
						{},
						...args.map((arg) => {
							const fromTypeMap = defaultArgType(arg.type)
							const override = own(m.args, arg.name)
							const type = override ?? fromTypeMap
							return h(
								'tr',
								{},
								h('td', { class: 'mono' }, arg.name),
								renderArgRequired(info, arg.name, arg.required),
								slackTypeCell(arg.type),
								h('td', { class: `mono${isLooseType(type) ? ' loose' : ''}` }, type),
								h('td', {}, argTypeInput(info.name, arg.name, fromTypeMap)),
								h('td', { class: 'small' }, ...renderElsewhere(info, arg.name, arg.type, override)),
							)
						}),
					),
				),
			),
		)
	}

	const missing = (name: string) => !args.some((a) => a.name === name)
	const stale = [
		...Object.keys(m.args ?? {})
			.filter(missing)
			.map((name) => ['type', name, () => (m.args = setRecord(m.args, name, undefined))] as const),
		...Object.keys(m.argsRequired ?? {})
			.filter(missing)
			.map(
				(name) =>
					[
						'required',
						name,
						() => (m.argsRequired = setRecord(m.argsRequired, name, undefined)),
					] as const,
			),
	]
	if (stale.length) {
		out.push(
			h(
				'div',
				{ class: 'stale' },
				"these param overrides point at params the method doesn't have (anymore), so they do nothing:",
				h(
					'ul',
					{},
					...stale.map(([what, name, remove]) =>
						h(
							'li',
							{},
							`${what} `,
							h('code', {}, name),
							' ',
							h(
								'button',
								{
									class: 'small-btn',
									onclick: () => {
										remove()
										changed()
										renderAll()
									},
								},
								'remove',
							),
						),
					),
				),
			),
		)
	}
	return out
}

// checkbox for whether a param is required; only stored when it differs from the docs
function renderArgRequired(info: MethodInfo, name: string, documented: boolean) {
	const override = own(methodState(info.name).argsRequired, name)
	const required = override ?? documented
	return h(
		'td',
		{ class: 'req-cell' },
		h('input', {
			type: 'checkbox',
			checked: required,
			title: `docs say ${documented ? 'required' : 'optional'}`,
			onchange: (e: Event) => {
				const checked = (e.target as HTMLInputElement).checked
				const m = methodState(info.name, true)
				m.argsRequired = setRecord(
					m.argsRequired,
					name,
					checked === documented ? undefined : checked,
				)
				changed()
				renderAll()
			},
		}),
		override !== undefined &&
			h('div', { class: 'tag overridden' }, `docs: ${documented ? 'required' : 'optional'}`),
	)
}

// what other methods with a param of the same name use, plus a way to copy this override to them
function renderElsewhere(
	info: MethodInfo,
	name: string,
	slackType: string | undefined,
	override: string | undefined,
) {
	const others = (argUsage.get(name) ?? []).filter((u) => u.method !== info.name)
	if (!others.length) return [h('span', { class: 'muted' }, 'only here')]

	// "1|type" for overrides, "0|type" for typeMap fallbacks
	const counts = new Map<string, string[]>()
	for (const u of others) {
		const override = own(methodState(u.method).args, name)
		const key = override ? `1|${override}` : `0|${defaultArgType(u.type)}`
		counts.set(key, [...(counts.get(key) ?? []), u.method])
	}

	const out: Child[] = [
		...[...counts].flatMap(([key, list], i) => [
			i ? h('br') : null,
			h(
				'span',
				{ class: key.startsWith('1|') ? 'mono' : 'mono muted', title: list.join('\n') },
				key.slice(2),
			),
			h('span', { class: 'muted' }, ` × ${list.length}${key.startsWith('1|') ? '' : ' default'}`),
		]),
	]

	if (override) {
		// only same slack type, a param named the same can still mean something different
		const targets = others.filter(
			(u) => u.type === slackType && own(methodState(u.method).args, name) !== override,
		)
		if (targets.length) {
			out.push(
				h('br'),
				h(
					'button',
					{
						class: 'small-btn',
						style: 'margin-top:4px',
						title: targets.map((u) => u.method).join('\n'),
						onclick: () => {
							for (const u of targets) {
								const m = methodState(u.method, true)
								m.args = setRecord(m.args, name, override)
							}
							changed()
							renderAll()
						},
					},
					`apply to ${targets.length} more (${slackType ?? 'untyped'})`,
				),
			)
		}
	}
	return out
}

// ---- types view ----

function renderMaps(): Node[] {
	const slackTypes = new Set(Object.keys(state.typeMap))
	for (const list of argUsage.values()) for (const u of list) if (u.type) slackTypes.add(u.type)

	const q = compileQuery(mapsQuery)
	const params = [...argUsage]
		.flatMap(([name, list]) => list.map((u) => ({ name, ...u })))
		.filter(
			(p) =>
				(!p.type ||
					p.type === 'array' ||
					p.type === 'object' ||
					own(methodState(p.method).args, p.name) !== undefined) &&
				q.test(p.name, p.method),
		)
		.sort((a, b) => a.name.localeCompare(b.name) || a.method.localeCompare(b.method))
	const overridden = params.filter(
		(p) => own(methodState(p.method).args, p.name) !== undefined,
	).length

	return [
		h(
			'div',
			{ class: 'method-head' },
			h(
				'div',
				{},
				h('h2', {}, 'types'),
				h(
					'p',
					{ class: 'description' },
					'the slack type map is the fallback for every param without a per-method override. untyped params fall back to unknown. below it are all untyped / array / object params (plus anything overridden), so loose ones can be typed in one place.',
				),
			),
		),
		h(
			'section',
			{},
			h('div', { class: 'section-head' }, h('h3', {}, 'slack type → ts type')),
			h(
				'table',
				{},
				h(
					'thead',
					{},
					h('tr', {}, h('th', {}, 'slack type'), h('th', {}, 'ts type'), h('th', {}, 'params')),
				),
				h(
					'tbody',
					{},
					...[...slackTypes].sort().map((t) =>
						h(
							'tr',
							{},
							h('td', { class: 'mono' }, t),
							h(
								'td',
								{},
								h('input', {
									type: 'text',
									class: 'mono',
									value: own(state.typeMap, t) ?? '',
									placeholder: t,
									'data-fid': `typemap|${t}`,
									oninput: (e: Event) => {
										const value = (e.target as HTMLInputElement).value
										state.typeMap = setRecord(state.typeMap, t, value.trim() ? value : undefined)
										changed()
										renderMain()
									},
								}),
							),
							h(
								'td',
								{ class: 'muted small' },
								String(
									methods.reduce(
										(n, m) => n + m.args.filter((a) => a.type === t && a.name !== 'token').length,
										0,
									),
								),
							),
						),
					),
				),
			),
		),
		h(
			'section',
			{},
			h(
				'div',
				{ class: 'section-head' },
				h('h3', {}, `params · ${overridden} / ${params.length} overridden`),
				h('input', {
					type: 'search',
					placeholder: 'filter by param or method (regex)',
					style: 'max-width:260px',
					class: q.invalid ? 'invalid' : '',
					title: q.invalid ? 'not valid regex, matching as plain text' : undefined,
					value: mapsQuery,
					'data-fid': 'maps-search',
					oninput: (e: Event) => {
						mapsQuery = (e.target as HTMLInputElement).value
						renderMain()
					},
				}),
			),
			h(
				'table',
				{ class: 'fixed' },
				h(
					'thead',
					{},
					h(
						'tr',
						{},
						h('th', { style: 'width:24%' }, 'param'),
						h('th', {}, 'method'),
						h('th', { style: 'width:12%' }, 'slack type'),
						h('th', { style: 'width:30%' }, 'override type'),
					),
				),
				h(
					'tbody',
					{},
					...params.map((p) =>
						h(
							'tr',
							{},
							h('td', { class: 'mono' }, p.name),
							h('td', {}, h('a', { href: `#${p.method}`, class: 'mono' }, p.method)),
							slackTypeCell(p.type),
							h('td', {}, argTypeInput(p.method, p.name, defaultArgType(p.type))),
						),
					),
				),
			),
		),
	]
}

$('args-tab-btn').onclick = () => {
	view = 'maps'
	renderAll()
	$('main').scrollTop = 0
	schedulePreview()
}

// ---- input ----

const search = $<HTMLInputElement>('search')
search.oninput = () => {
	query = search.value
	const invalid = compileQuery(query).invalid
	search.classList.toggle('invalid', invalid)
	search.title = invalid ? 'not valid regex, matching as plain text' : ''
	renderSidebar()
}
search.onkeydown = (e) => {
	if (e.key === 'Enter') {
		const first = visibleMethods()[0]
		if (first) select(first.name)
		search.blur()
	}
}

window.addEventListener('keydown', (e) => {
	const target = e.target as HTMLElement
	if (target.matches('input, textarea')) {
		if (e.key === 'Escape') target.blur()
		return
	}
	if (e.metaKey || e.ctrlKey || e.altKey) return

	if (e.key === 'j') move(1)
	else if (e.key === 'k') move(-1)
	else if (e.key === '/') {
		e.preventDefault()
		search.focus()
		search.select()
	} else if (e.key === 'r' && view === 'method') {
		toggleReviewedAndAdvance()
	} else if (view === 'method') {
		// click the rendered link so the shortcut opens exactly what the link would
		const doc = Object.entries(docsKeys).find(([, key]) => key === e.key)?.[0]
		if (doc) document.querySelector<HTMLAnchorElement>(`#main a[data-doc="${doc}"]`)?.click()
	}
})

window.addEventListener('hashchange', () => {
	const name = decodeURIComponent(location.hash.slice(1))
	if (byName.has(name) && (name !== current || view !== 'method')) select(name)
})

// ---- init ----

const [methodsRes, stateRes] = await Promise.all([
	fetch('/api/methods').then((r) => r.json()),
	fetch('/api/state').then((r) => r.json()),
])
methods = methodsRes as MethodInfo[]
state = (stateRes as { state: ReviewState }).state
statePath = (stateRes as { path: string }).path

for (const info of methods) {
	byName.set(info.name, info)
	for (const arg of info.args) {
		if (arg.name === 'token') continue
		let usage = argUsage.get(arg.name)
		if (!usage) argUsage.set(arg.name, (usage = []))
		usage.push({ method: info.name, type: arg.type })
	}
}

const fromHash = decodeURIComponent(location.hash.slice(1))
select(byName.has(fromHash) ? fromHash : (visibleMethods()[0] ?? methods[0]!).name)
setStatus('')

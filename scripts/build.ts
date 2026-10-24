import { rm } from 'node:fs/promises'

import { $, build, Glob } from 'bun'

const [entrypoints, tests] = await Promise.all([
	Array.fromAsync(new Glob('**/*.{ts,tsx}').scan('./src')).then((files) =>
		files
			.filter((file) => !file.includes('.test.') && !file.endsWith('.d.ts'))
			.map((file) => `./src/${file}`),
	),
	Array.fromAsync(new Glob('**/*.test.{ts,tsx}').scan('./src')).then((files) =>
		files.map((file) => `./src/${file}`),
	),
	rm('./dist', { recursive: true, force: true }),
])

await build({
	entrypoints: tests,
	check: true,

	target: 'node',
	format: 'esm',
	packages: 'external',
})

await build({
	entrypoints,
	outdir: './dist',
	check: true,

	target: 'node',
	format: 'esm',
	packages: 'external',
	splitting: true,
	sourcemap: 'linked',
})

await $`tsc -p tsconfig.build.json`

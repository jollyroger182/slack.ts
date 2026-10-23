import { $, build, Glob } from 'bun'
import { rm } from 'node:fs/promises'

const [entrypoints] = await Promise.all([
	Array.fromAsync(new Glob('*.{ts,tsx}').scan('./src'), (file) => `./src/${file}`),
	rm('./dist', { recursive: true, force: true }),
])

await build({
	entrypoints,
	outdir: './dist',

	target: 'node',
	format: 'esm',
	splitting: true,
	packages: 'external',
	sourcemap: 'linked',

	check: true,
})

await $`tsc -p tsconfig.build.json`

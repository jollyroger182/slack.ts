import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { $, build, Glob } from 'bun'

const [entrypoints, tests] = await Promise.all([
	Array.fromAsync(new Glob('**/*.{ts,tsx}').scan('./src')).then(
		(files) => files.filter((file) => !file.includes('.test.') && !file.endsWith('.d.ts')),
		// .map((file) => `./src/${file}`),
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

process.chdir('src')

await build({
	entrypoints,
	outdir: '../dist',
	check: true,

	target: 'node',
	format: 'esm',
	packages: 'external',
	splitting: true,
	sourcemap: 'linked',

	tsconfig: '../tsconfig.build.json',
})

process.chdir('..')

await $`tsc -p tsconfig.build.json`

// this is needed for `nodenext` consumers because node hates extensionless relative imports
// thanks claude
for await (const file of new Glob('**/*.d.ts').scan('./dist')) {
	const path = join('./dist', file)
	const text = await Bun.file(path).text()
	const fixed = text.replace(/(from |import\()(['"])(\.\.?(?:\/[^'"]*)?)\2/g, (m, pre, q, spec) => {
		const target = join(dirname(path), spec)
		if (existsSync(`${target}.d.ts`)) return `${pre}${q}${spec}.js${q}`
		if (existsSync(join(target, 'index.d.ts'))) return `${pre}${q}${spec}/index.js${q}`
		return m
	})
	if (fixed !== text) await Bun.write(path, fixed)
}

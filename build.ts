import 'bun'
import { rm } from 'node:fs/promises'

await rm('./dist', { recursive: true, force: true })

await Bun.build({
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
	target: 'node',
	format: 'esm',
})

await Bun.build({
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
	target: 'node',
	format: 'cjs',
	naming: '[name].cjs',
})

const proc = Bun.spawnSync(['bunx', 'tsc', '-p', 'tsconfig.build.json'], {
	stdout: 'inherit',
	stderr: 'inherit',
})
if (!proc.success) process.exit(1)

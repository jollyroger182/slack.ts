import 'bun'
import { rm } from 'node:fs/promises'

await rm('./dist', { recursive: true, force: true })

const proc = Bun.spawnSync(['bunx', 'tsc', '-p', 'tsconfig.build.json'], {
	stdout: 'inherit',
	stderr: 'inherit',
})
if (!proc.success) process.exit(1)

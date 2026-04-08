import { appendFile } from 'fs/promises'

const indexFile = 'src/api/index.ts'

while (true) {
	const name = prompt('Name:')!
	const post = !!prompt('Post?')!

	const segment = name.split('.')[0]
	const classPrefix = name
		.split('.')
		.map((x) => x.charAt(0).toUpperCase() + x.substring(1).toLowerCase())
		.join('')

	const file = `src/api/web/${segment}.ts`
	await appendFile(
		file,
		`\nexport interface ${classPrefix}Params {\n\t\n}\n\nexport interface ${classPrefix}Response {\n\t\n}\n`,
	)

	let indexText = await Bun.file(indexFile).text()
	if (indexText.includes(` } from './web/${segment}'`)) {
		indexText = indexText.replace(
			` } from './web/${segment}'`,
			`, ${classPrefix}Params, ${classPrefix}Response } from './web/${segment}'`,
		)
	} else if (indexText.includes(`} from './web/${segment}'`)) {
		indexText = indexText.replace(
			`} from './web/${segment}'`,
			`\t${classPrefix}Params,\n\t${classPrefix}Response\n} from './web/${segment}'`,
		)
	} else {
		indexText =
			`import type { ${classPrefix}Params, ${classPrefix}Response } from './web/${segment}'\n` +
			indexText
	}
	indexText = indexText.replace(
		'export interface SlackWebAPIMap {',
		`export interface SlackWebAPIMap {\n\t\'${name}\': {\n\t\tparams: ${classPrefix}Params\n\t\tresponse: ${classPrefix}Response\n\t}`,
	)
	if (post) {
		indexText = indexText.replace(
			'export const POST_METHODS: SlackAPIMethod[] = [',
			`export const POST_METHODS: SlackAPIMethod[] = [\n\t'${name}',`,
		)
	}
	await Bun.write(indexFile, indexText)
}

import { appendFile } from 'fs/promises'

const indexFile = 'src/api/web/index.ts'

while (true) {
	const name = prompt('Name:')!

	const segment = name.split('.')[0]
	const classPrefix = name
		.split('.')
		.map((x) => x.charAt(0).toUpperCase() + x.substring(1))
		.join('')

	const file = `src/api/web/${segment}.ts`
	await appendFile(
		file,
		`\nexport interface ${classPrefix}Params {\n\t\n}\n\nexport interface ${classPrefix}Response {\n\t\n}\n`,
	)

	let indexText = await Bun.file(indexFile).text()
	if (indexText.includes(` } from './${segment}'`)) {
		indexText = indexText.replace(
			` } from './${segment}'`,
			`, ${classPrefix}Params, ${classPrefix}Response } from './${segment}'`,
		)
	} else if (indexText.includes(`} from './${segment}'`)) {
		indexText = indexText.replace(
			`} from './${segment}'`,
			`\t${classPrefix}Params,\n\t${classPrefix}Response,\n} from './${segment}'`,
		)
	} else {
		indexText = indexText.replace(
			'\n\n',
			`\n\nimport type { ${classPrefix}Params, ${classPrefix}Response } from './${segment}'\n`,
		)
	}
	indexText = indexText.replace(
		'interface SlackWebAPIMapInternal {',
		`interface SlackWebAPIMapInternal {\n\t\'${name}\': {\n\t\tparams: ${classPrefix}Params\n\t\tresponse: ${classPrefix}Response\n\t}`,
	)
	await Bun.write(indexFile, indexText)
}

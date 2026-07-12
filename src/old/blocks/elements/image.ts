import type { ImageElement } from '@slack/types'
import { Builder } from '../base'
import type { DistributiveOmit } from '../../utils/typing'

export class ImageBuilder<HasSource extends boolean = false> extends Builder<
	ImageElement,
	HasSource
> {
	private _imageUrl?: string
	private _slackFile?: { url: string } | { id: string }

	constructor(private _altText: string) {
		super()
	}

	url(this: ImageBuilder<false>, url: string): ImageBuilder<true> {
		this._imageUrl = url
		return this as any
	}

	file(
		this: ImageBuilder<false>,
		file: string | { url: string } | { id: string },
	): ImageBuilder<true> {
		if (typeof file === 'string') {
			if (file.startsWith('http')) {
				file = { url: file }
			} else {
				file = { id: file }
			}
		}

		if ('url' in file && file.url) {
			this._slackFile = { url: file.url }
		} else if ('id' in file && file.id) {
			this._slackFile = { id: file.id }
		} else {
			throw new Error('Unknown file passed to ImageBuilder.file')
		}

		return this as any
	}

	override build(): ImageElement {
		const data = {
			...this._build(),
			type: 'image',
			alt_text: this._altText,
		} satisfies DistributiveOmit<ImageElement, 'image_url' | 'slack_file'>

		if (this._imageUrl) {
			return { ...data, image_url: this._imageUrl }
		}
		if (this._slackFile) {
			return { ...data, slack_file: this._slackFile }
		}
		throw new Error('One of image_url and slack_file must be set on image elements')
	}
}

export function image(altText: string) {
	return new ImageBuilder(altText)
}

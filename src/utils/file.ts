type TypedArray =
	Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array

export type InputFile =
	| ({ name: string; alt?: string; title?: string; length?: number } & (
			| { length: number; value: ReadableStream }
			| { value: Blob | ArrayBufferLike | DataView | TypedArray }
	  ))
	| File

export function resolveFile(file: InputFile) {
	if (file instanceof File) {
		return { name: file.name, length: file.size, value: file }
	}

	if (file.value instanceof ReadableStream) {
		return { ...file, length: file.length! }
	}

	const { value } = file

	if (value instanceof Blob) {
		return { ...file, length: value.size }
	}

	return { ...file, length: value.byteLength }
}

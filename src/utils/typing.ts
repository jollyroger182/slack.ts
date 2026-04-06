export type DistributiveOmit<T, Key extends keyof any> = T extends any ? Omit<T, Key> : never

export type DistributivePick<T, Key extends keyof T> = T extends any ? Pick<T, Key> : never

export type ExtractPrefix<
	T extends string,
	PrefixType extends string = string,
	Sep extends string = ':',
	IfNotFound = never,
> = T extends `${infer Prefix extends PrefixType}${Sep}${string}` ? Prefix : IfNotFound

export type NotNull<T> = T extends null ? never : T

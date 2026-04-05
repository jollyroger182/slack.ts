export type DistributiveOmit<T, Key extends keyof any> = T extends any ? Omit<T, Key> : never

export type ExtractPrefix<
	T extends string,
	Sep extends string = ':',
	IfNotFound = never,
> = T extends `${infer Prefix}${Sep}${string}` ? Prefix : IfNotFound

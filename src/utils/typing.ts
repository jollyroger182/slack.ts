export type DistributiveOmit<T, Key extends keyof any> = T extends any ? Omit<T, Key> : never

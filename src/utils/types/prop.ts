export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type Replace<T, U> = DistributiveOmit<T, keyof U> & U
export type ForceArray<A extends any[] | undefined> = A extends unknown[] ? A : []

/** Check if two types are exactly the same. */
export type Equals<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

/**
 * The known keys of an interface. Used in cases like `interface X extends Record<string, T>` to
 * find the keys actually on the type.
 */
export type KnownKeys<T> = keyof {
	[K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

/**
 * Attaches the key of an object to the type to each value, under a configurable key.
 *
 * @example
 * 	type ActionMap = WithIds<{ confirm: ButtonAction }, 'action_id'>
 * 	// { confirm: ButtonAction & { action_id: 'confirm' } }
 */
export type WithIds<M, IDKey extends string> = {
	[K in KnownKeys<M>]: M[K] & { [Key in IDKey]: K }
}

export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export type Simplify<T> = { [K in keyof T]: T[K] } & {}

export type DistributiveMerge<Union, Type> = Union extends unknown ? Simplify<Union & Type> : never

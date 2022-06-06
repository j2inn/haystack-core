/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

/**
 * Memoization Cache.
 */
export class MemoizeCache {
	/**
	 * The internal cache map.
	 */
	readonly #cache = new Map<string, any>()

	/**
	 * Get an item from the cache.
	 *
	 * ```typescript
	 * const myAge = getMemoizeCache(obj)?.get('age')
	 * ```
	 *
	 * @param name name of item to retrieve.
	 * @returns item or undefined.
	 */
	get(name: string): any {
		return this.#cache.get(name)
	}

	/**
	 * Set an item in the cache.
	 *
	 * ```typescript
	 * getMemoizeCache(obj)?.set('age', 123)
	 * ```
	 *
	 * @param name name of cached item.
	 * @param value cached item.
	 * @returns The cache item.
	 */
	set(name: string, value: any): any {
		this.#cache.set(name, value)
		return value
	}

	/**
	 * Return true if the item exists in the cache.
	 * 
	  ```typescript
	 * const isInCache = !!getMemoizeCache(obj)?.has('age')
	 * ```
	 * 
	 * @param name name of cached item to lookup.
	 * @returns true if an item is in cache.
	 */
	has(name: string): boolean {
		return this.#cache.has(name)
	}

	/**
	 * Clear all entries from the cache.
	 *
	 * ```typescript
	 * getMemoizeCache(obj)?.clear()
	 * ```
	 */
	clear(): void {
		this.#cache.clear()
	}

	/**
	 * Removes an item from the cache by name.
	 *
	 * ```typescript
	 * getMemoizeCache(obj).delete('memoizedElementName')
	 * ```
	 *
	 * @param name cached item name to remove
	 * @returns true if an item is successfully removed.
	 */
	remove(name: string): boolean {
		return this.#cache.delete(name)
	}

	/**
	 * Return the size of the cache.
	 *
	 * ```typescript
	 * const size = getMemoizeCache(obj).?size ?? 0
	 * ```
	 *
	 * @returns The size of the cache.
	 */
	get size(): number {
		return this.#cache.size
	}

	/**
	 * Returns if the cache is empty.
	 *
	 * @returns True if the cache is empty.
	 */
	isEmpty(): boolean {
		return this.size === 0
	}

	/**
	 * Return all of the cached keys.
	 *
	 * * ```typescript
	 * const keys = getMemoizeCache(obj)?.keys()
	 * ```
	 *
	 * @returns The cache's keys.
	 */
	get keys(): string[] {
		return [...this.#cache.keys()]
	}

	/**
	 * Return a copy of the cache as an object.
	 *
	 * ```typescript
	 * const obj = getMemoizeCache(obj)?.toObj()
	 * ```
	 *
	 * @returns The cached values.
	 */
	toObj(): Record<string, any> {
		const obj: Record<string, any> = {}

		for (const key of this.keys) {
			obj[key] = this.get(key)
		}

		return obj
	}

	/**
	 * Dump the value to the local console output.
	 *
	 * @param message An optional message to display before the value.
	 * @returns The value instance.
	 */
	inspect(message?: string): this {
		if (message) {
			console.log(String(message))
		}

		const obj: Record<string, any> = {}

		for (const key of this.keys) {
			obj[key] = String(this.get(key))
		}

		console.table(obj)

		return this
	}
}

interface MemoizedObjectInternal {
	$memoizeCache?: MemoizeCache
}

/**
 * Return the memoize cache.
 *
 * @param obj The object to return the cache from.
 * @returns The memorize cache.
 */
function getCache(obj: MemoizedObjectInternal): MemoizeCache {
	return obj.$memoizeCache ?? (obj.$memoizeCache = new MemoizeCache())
}

/**
 * Return the memoized cache to use or undefined if it can't be found.
 *
 * @param obj The object to look up the cache from.
 * @returns The memoize cache or undefined if not found.
 */
export function getMemoizeCache(obj: any): MemoizeCache | undefined {
	return obj?.$memoizeCache
}

/**
 * A property accessor decorator used for memoization of getters and methods.
 */
export function memoize(): (
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor
) => void {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	): PropertyDescriptor {
		// The original getter.
		const get = descriptor?.get
		const value = descriptor?.value

		if (typeof get === 'function') {
			return {
				get(): any {
					const cache = getCache(this as MemoizedObjectInternal)

					return cache.has(propertyKey)
						? cache.get(propertyKey)
						: cache.set(propertyKey, get.call(this))
				},
			}
		} else if (typeof value === 'function') {
			return {
				value(...args: any[]): any {
					const cache = getCache(this as MemoizedObjectInternal)

					const key = JSON.stringify({ propertyKey, args })

					return cache.has(key)
						? cache.get(key)
						: cache.set(key, value.apply(this, args))
				},
			}
		} else {
			throw new Error('Only class methods and getters can be memoized')
		}
	}
}

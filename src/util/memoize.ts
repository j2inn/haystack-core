/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off", @typescript-eslint/explicit-module-boundary-types: "off" */

/**
 * Memoization Cache
 */
class Cache {
	#cache: Map<string, any>

	constructor() {
		this.#cache = new Map()
	}

	/**
	 * Get
	 *
	 * Retrieve item from cache by name
	 *
	 * Example:
	 * ```typescript
	 * const myAge = (instance as MemoizedObject).getMemoizeCache()?.get('age')
	 * ```
	 *
	 * @param name name of item to retrieve
	 * @returns item or undefined
	 */
	public get(name: string): any {
		return this.#cache.get(name)
	}

	/**
	 * Set item in cache
	 *
	 * Adds or overwrites item in cache by name.
	 *
	 * Example:
	 * ```typescript
	 * (instance as MemoizedObject).getMemoizeCache()?.set('age', 123)
	 * ```
	 *
	 * @param name name of cached item
	 * @param value cached item
	 */
	public set(name: string, value: any): any {
		this.#cache.set(name, value)

		return value
	}

	/**
	 * Has
	 * 
	 * Checks if an item by name is already in cache.
	 * 
	  ```typescript
	 * const isInCache = (instance as MemoizedObject).getMemoizeCache()?.has('age')
	 * ```
	 * 
	 * @param name name of cached item to lookup
	 * @returns true if an item is in cache by name
	 */
	public has(name: string): boolean {
		return this.#cache.has(name)
	}

	/**
	 * Clear Cache
	 *
	 * Removes all cache entries
	 *
	 * Example:
	 * ```typescript
	 * (instance as MemoizedObject).getMemoizeCache()?.clear()
	 * ```
	 */
	public clear(): void {
		this.#cache.clear()
	}

	/**
	 * Remove
	 *
	 * Removes a single cache entry by name
	 *
	 * Example:
	 * ```typescript
	 * (instance as MemoizedObject).getMemoizeCache().remove('memoizedElementName')
	 * ```
	 *
	 * @param name cached item name to expire
	 */
	public remove(name: string): boolean {
		return this.#cache.delete(name)
	}
}

export interface MemoizedObject {
	getMemoizeCache(): Cache | undefined
}

interface MemoizedObjectInternal extends MemoizedObject {
	$memoizeCache?: Cache
}

/**
 * Return the memoize cache.
 *
 * @param obj The object to return the cache from.
 * @returns The memorize cache.
 */
function getCache(obj: MemoizedObjectInternal): Cache {
	return obj.$memoizeCache ?? (obj.$memoizeCache = new Cache())
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

		if (!Object.prototype.hasOwnProperty.call(target, 'getMemoizeCache')) {
			Object.defineProperty(target, 'getMemoizeCache', {
				value: function (this: MemoizedObjectInternal) {
					return this.$memoizeCache
				},
				configurable: false,
			})
		}

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
			throw new Error('Only methods and getters can be memoized')
		}
	}
}

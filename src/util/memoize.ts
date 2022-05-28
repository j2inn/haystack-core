/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off", @typescript-eslint/explicit-module-boundary-types: "off" */

/**
 * Memoization Cache
 */
class Cache {
	[prop: string]: any

	/**
	 * Expire cache
	 *
	 * Expires memoized cache by name, if the name is omitted, it will expire all
	 *
	 * Example:
	 * ```typescript
	 *
	 * // Expire by name
	 * (instance as MemoizedObject).$memoizeCache.expire('memoizedElementName')
	 *
	 * // Expire All
	 * (instance as MemoizedObject).$memoizeCache.expire()
	 * ```
	 *
	 * @param name cached item name to expire
	 */
	public expire(name?: string): void {
		if (name) {
			delete this[name]
		} else {
			Object.getOwnPropertyNames(this).forEach(
				(name) => delete this[name]
			)
		}
	}
}

export interface MemoizedObject {
	$memoizeCache?: Cache
}
/**
 * Return the memoize cache.
 *
 * @param obj The object to return the cache from.
 * @returns The memorize cache.
 */
function getCache(obj: MemoizedObject): Cache {
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

		if (typeof get === 'function') {
			return {
				get(): any {
					const cache = getCache(this as MemoizedObject)

					return Object.prototype.hasOwnProperty.call(
						cache,
						propertyKey
					)
						? cache[propertyKey]
						: (cache[propertyKey] = get.call(this))
				},
			}
		} else if (typeof value === 'function') {
			return {
				value(...args: any[]): any {
					const cache = getCache(this as MemoizedObject)

					const key = JSON.stringify({ propertyKey, args })

					return Object.prototype.hasOwnProperty.call(cache, key)
						? cache[key]
						: (cache[key] = value.apply(this, args))
				},
			}
		} else {
			throw new Error('Only methods and getters can be memoized')
		}
	}
}

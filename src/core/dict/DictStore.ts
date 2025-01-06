/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal } from '../HVal'
import { HValObj } from './HValObj'

/**
 * Inner backing data store for a dict.
 */
export interface DictStore {
	/**
	 * Returns a haystack value from the dict or undefined
	 * if it can't be found.
	 *
	 * @param name The name of the value to find.
	 * @return The value, null or undefined if it can't be found.
	 */
	get(name: string): OptionalHVal | undefined

	/**
	 * Returns true if the dict has the specified name.
	 *
	 * @param name The name of the value to find.
	 * @return True if the value exists.
	 */
	has(name: string): boolean

	/**
	 * Set a haystack value.
	 *
	 * @param name The name to set.
	 * @param value The haystack value to set.
	 */
	set(name: string, value: OptionalHVal): void

	/**
	 * Removes a property from the dict.
	 *
	 * @param name The property name.
	 */
	remove(name: string): void

	/**
	 * Clear all entries from the dict.
	 */
	clear(): void

	/**
	 * @returns All keys used in the dict.
	 */
	getKeys(): string[]

	/**
	 * @returns The underlying object being managed by the store.
	 */
	toObj(): HValObj

	/**
	 * @returns A JSON reprentation of the object.
	 */
	toJSON(): HaysonDict
}

/**
 * Type guard to check whether the store is a dict or not.
 *
 * @param store The dict store.
 * @returns true if the object is a dict store.
 */
export function isDictStore(store: unknown): store is DictStore {
	return typeof (store as DictStore)?.getKeys === 'function'
}

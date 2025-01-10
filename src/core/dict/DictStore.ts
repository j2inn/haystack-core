/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal } from '../HVal'
import { HValObj } from './HValObj'

export const DICT_STORE_SYMBOL = Symbol.for('haystack-core.dictStore')

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

	/**
	 * @returns A string containing the JSON representation of the object.
	 */
	toJSONString(): string

	/**
	 * @returns A byte buffer that has an encoded JSON string representation of the object.
	 */
	toJSONUint8Array(): Uint8Array

	/**
	 * Indicates this is a dict store.
	 */
	readonly [DICT_STORE_SYMBOL]: symbol
}

/**
 * Type guard to check whether the value is a dict store or not.
 *
 * @param value The value to test.
 * @returns true if the object is a dict store.
 */
export function isDictStore(value: unknown): value is DictStore {
	return !!((value as DictStore)?.[DICT_STORE_SYMBOL] === DICT_STORE_SYMBOL)
}

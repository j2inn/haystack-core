/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { OptionalHVal } from '../HVal'

export const LIST_STORE_SYMBOL = Symbol.for('listStore')

/**
 * Implements the storage for an HList.
 */
export interface ListStore<Value extends OptionalHVal> {
	/**
	 * The list values
	 */
	values: Value[]

	/**
	 * Indicates this is a list store.
	 */
	readonly [LIST_STORE_SYMBOL]: symbol
}

/**
 * Type guard to check whether the value is a list store.
 *
 * @param value The value to test.
 * @returns true if the object is a list store.
 */
export function isListStore<Value extends OptionalHVal>(
	value: unknown
): value is ListStore<Value> {
	return !!(
		(value as ListStore<Value>)?.[LIST_STORE_SYMBOL] === LIST_STORE_SYMBOL
	)
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonDict, HaysonGrid } from '../hayson'
import { Kind } from '../Kind'
import { GridColumn } from './GridColumn'

export const GRID_STORE_SYMBOL = Symbol.for('gridStore')

/**
 * The default grid version number.
 */
export const DEFAULT_GRID_VERSION = '3.0'

/**
 * The grid's version tag name.
 */
export const GRID_VERSION_NAME = 'ver'

/**
 * Implements the storage for an HGrid.
 *
 * This separates the HGrid interface from the actual storage,
 * which could be backed by a native one.
 */
export interface GridStore<DictVal extends HDict> {
	/**
	 * The grid's version number.
	 */
	version: string

	/**
	 * The stores's meta data.
	 */
	meta: HDict

	/**
	 * The stores's columns.
	 */
	columns: GridColumn[]

	/**
	 * The store's rows.
	 */
	rows: DictVal[]

	/**
	 * @returns A JSON reprentation of the grid.
	 */
	toJSON(): HaysonGrid

	/**
	 * @returns A string containing the JSON representation of the object.
	 */
	toJSONString(): string

	/**
	 * @returns A byte buffer that has an encoded JSON string representation of the object.
	 */
	toJSONUint8Array(): Uint8Array

	/**
	 * Indicates this is a grid store.
	 */
	[GRID_STORE_SYMBOL]: symbol
}

/**
 * Type guard to check whether the value is a grid store.
 *
 * @param store The grid store.
 * @returns true if the object is a grid store.
 */
export function isGridStore<DictVal extends HDict>(
	value: unknown
): value is GridStore<DictVal> {
	return !!(
		(value as GridStore<DictVal>)?.[GRID_STORE_SYMBOL] === GRID_STORE_SYMBOL
	)
}

/**
 * Returns a JSON reprentation of a grid store.
 *
 * @param grid The grid store.
 * @returns The JSON representation of the grid.
 */
export function gridStoreToJson<DictVal extends HDict>(
	grid: GridStore<DictVal>
): HaysonGrid {
	return {
		_kind: Kind.Grid,
		meta: {
			[GRID_VERSION_NAME]: grid.version,
			...grid.meta.toJSON(),
		},
		cols: grid.columns.map(
			(
				column: GridColumn
			): {
				name: string
				meta: HaysonDict
			} => ({
				name: column.name,
				meta: column.meta.toJSON(),
			})
		),
		rows: grid.rows.map((row: DictVal): HaysonDict => row.toJSON()),
	}
}

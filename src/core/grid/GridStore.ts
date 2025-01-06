/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { GridColumn } from './GridColumn'

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
	 * True if store has the column.
	 */
	hasColumn(name: string): boolean

	/**
	 * The stores's columns.
	 */
	columns: GridColumn[]

	/**
	 * Sets a column at the specified index.
	 */
	setColumn(index: number, column: GridColumn): void

	/**
	 * Returns a store column via its name or index number. If it can't be found
	 * then return undefined.
	 */
	getColumn(index: number | string): GridColumn | undefined

	/**
	 * Adds a column to the store.
	 */
	addColumn(name: string, meta: HDict | undefined): GridColumn

	/**
	 * Reorder the columns with the specified new order of names.
	 */
	reorderColumns(colNames: string[]): void

	/**
	 * Get the row by index
	 * @param index the index of the row
	 */
	get(index: number): DictVal | undefined

	/**
	 * The store's rows.
	 */
	rows: DictVal[]

	/**
	 * The number of rows in the store.
	 */
	readonly size: number
}

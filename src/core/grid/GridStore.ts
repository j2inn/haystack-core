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
	 * The stores's columns.
	 */
	columns: GridColumn[]

	/**
	 * The store's rows.
	 */
	rows: DictVal[]
}

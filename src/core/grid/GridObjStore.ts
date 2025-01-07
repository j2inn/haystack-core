/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonGrid } from '../hayson'
import { GridColumn } from './GridColumn'
import { GRID_STORE_SYMBOL, GridStore, gridToJson } from './GridStore'

/**
 * Implements the storage for an HGrid.
 *
 * This separates the HGrid interface from the actual storage,
 * which could be backed by a native one
 */
export class GridObjStore<DictVal extends HDict> implements GridStore<DictVal> {
	public version: string

	public meta: HDict

	public columns: GridColumn[]

	public rows: DictVal[]

	public [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	public constructor(
		version: string,
		meta: HDict,
		columns: GridColumn[],
		rows: DictVal[]
	) {
		this.version = version
		this.meta = meta
		this.columns = columns
		this.rows = rows
	}

	public toJSON(): HaysonGrid {
		return gridToJson(this)
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonGrid } from '../hayson'
import { HStr } from '../HStr'
import { makeValue } from '../util'
import { GridColumn } from './GridColumn'
import {
	DEFAULT_GRID_VERSION,
	GRID_STORE_SYMBOL,
	GRID_VERSION_NAME,
	GridStore,
} from './GridStore'

/**
 * Implements the storage for an HGrid using JSON.
 */
export class GridJsonStore<DictVal extends HDict>
	implements GridStore<DictVal>
{
	public version: string

	public meta: HDict

	public columns: GridColumn[]

	public rows: DictVal[]

	public [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	public constructor(grid: HaysonGrid) {
		let version = DEFAULT_GRID_VERSION

		let meta: HDict
		if (grid.meta) {
			meta = makeValue(grid.meta) as HDict

			// Remove the version from the meta. This is used when decoding a Hayson based grid that
			// adds the version number to the grid's meta data. We need to remove the version so
			// comparisons (i.e. `equals`) still work as expected.
			if (meta.has(GRID_VERSION_NAME)) {
				version =
					meta.get<HStr>(GRID_VERSION_NAME)?.value ??
					DEFAULT_GRID_VERSION

				meta.remove(GRID_VERSION_NAME)
			}
		} else {
			meta = new HDict()
		}

		this.version = version
		this.meta = meta
		this.columns = grid.cols
			? grid.cols.map(
					(column): GridColumn =>
						new GridColumn(
							column.name,
							column.meta
								? (makeValue(column.meta) as HDict)
								: undefined
						)
			  )
			: []
		this.rows = grid.rows
			? grid.rows.map((row) => makeValue(row) as DictVal)
			: []
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonDict, HaysonGrid } from '../hayson'
import { HStr } from '../HStr'
import { HVal, isHVal, valueIsKind } from '../HVal'
import { Kind } from '../Kind'
import { makeValue } from '../util'
import { GridColumn } from './GridColumn'
import { GridObj } from './GridObj'
import { DEFAULT_GRID_VERSION, GRID_VERSION_NAME, GridStore } from './GridStore'
import type { HGrid } from './HGrid'

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

	public constructor(
		arg?: GridObj<DictVal> | HaysonGrid | HVal | (HaysonDict | DictVal)[]
	) {
		let meta: HDict | undefined
		let columns: { name: string; meta?: HDict }[] | undefined
		let rows: DictVal[] | HaysonDict[] | undefined
		let version = DEFAULT_GRID_VERSION

		const value = arg as
			| GridObj<DictVal>
			| HaysonGrid
			| HVal
			| (HaysonDict | DictVal)[]
			| undefined
			| null

		if (value === undefined) {
			rows = []
		} else if (isHVal(value) || value === null) {
			if (valueIsKind<HGrid<DictVal>>(value, Kind.Grid)) {
				meta = value.meta
				columns = value.getColumns()
				rows = value.getRows()
				version = value.version
			} else if (valueIsKind<HDict>(value, Kind.Dict)) {
				rows = [value] as DictVal[]
			} else {
				rows = [HDict.make({ val: value }) as DictVal]
			}
		} else if (Array.isArray(value)) {
			rows = value.map(
				(dict: HaysonDict | DictVal): DictVal =>
					HDict.make(dict) as DictVal
			) as DictVal[]
		} else {
			// Covers grid objects (GridObj) and Hayson...

			if (value.meta) {
				meta = makeValue(value.meta) as HDict

				// Remove the version from the meta. This is used when decoding a Hayson based grid that
				// adds the version number to the grid's meta data. We need to remove the version so
				// comparisons (i.e. `equals`) still work as expected.
				if (meta.has(GRID_VERSION_NAME)) {
					version =
						meta.get<HStr>(GRID_VERSION_NAME)?.value ??
						DEFAULT_GRID_VERSION

					meta.remove(GRID_VERSION_NAME)
				}
			}

			if ((value as GridObj).columns) {
				columns = (value as GridObj).columns || []
			} else if ((value as HaysonGrid).cols) {
				const obj = value as HaysonGrid

				if (obj.cols) {
					columns = obj.cols.map(
						(
							col
						): {
							name: string
							meta?: HDict
						} => ({
							name: col.name,
							meta: col.meta
								? (makeValue(col.meta) as HDict)
								: undefined,
						})
					)
				}
			}

			// Both HaysonGrid and GridObj share a rows iterator property.
			if ((value as GridObj).rows) {
				rows = (value as GridObj<DictVal>).rows || []
			}

			if ((value as GridObj).version) {
				version =
					(value as GridObj<DictVal>).version || DEFAULT_GRID_VERSION
			}
		}

		meta = meta ?? HDict.make()
		columns = columns ?? []
		rows = rows ?? []

		for (let i = 0; i < rows.length; ++i) {
			rows[i] = makeValue(rows[i]) as DictVal
		}

		this.version = version
		this.meta = meta
		this.columns = columns.map(
			(column): GridColumn => new GridColumn(column.name, column.meta)
		)
		this.rows = rows as DictVal[]
	}
}

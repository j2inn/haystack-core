/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonDict, HaysonGrid } from '../hayson'
import { TEXT_ENCODER } from '../HVal'
import { Kind } from '../Kind'
import { GridColumn } from './GridColumn'
import { GRID_STORE_SYMBOL, GRID_VERSION_NAME, GridStore } from './GridStore'

/**
 * Implements the storage for an HGrid.
 *
 * This separates the HGrid interface from the actual storage,
 * which could be backed by a native one
 */
export class GridObjStore<DictVal extends HDict> implements GridStore<DictVal> {
	version: string

	meta: HDict

	columns: GridColumn[]

	rows: DictVal[];

	readonly [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	constructor(
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

	toJSON(): HaysonGrid {
		return {
			_kind: Kind.Grid,
			meta: {
				[GRID_VERSION_NAME]: this.version,
				...this.meta.toJSON(),
			},
			cols: this.columns.map((column: GridColumn) => ({
				name: column.name,
				meta: column.meta.toJSON(),
			})),
			rows: this.rows.map((row: DictVal): HaysonDict => row.toJSON()),
		}
	}

	toJSONString(): string {
		return JSON.stringify(this.toJSON())
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

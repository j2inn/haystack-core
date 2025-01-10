/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { DictJsonStore } from '../dict/DictJsonStore'
import { HDict } from '../dict/HDict'
import { HaysonDict, HaysonGrid } from '../hayson'
import { TEXT_ENCODER } from '../HVal'
import { Kind } from '../Kind'
import { GridColumn } from './GridColumn'
import {
	DEFAULT_GRID_VERSION,
	GRID_STORE_SYMBOL,
	GRID_VERSION_NAME,
	GridStore,
} from './GridStore'

/**
 * Implements the storage for an HGrid using JSON.
 *
 * This is designed to work as lazily and efficiently as possible.
 */
export class GridJsonStore<DictVal extends HDict>
	implements GridStore<DictVal>
{
	#version?: string

	#meta?: HDict
	#metaJson?: HaysonDict

	#columns?: GridColumn[]
	#columnsJson?: { name: string; meta?: HaysonDict }[]

	#rows?: DictVal[]
	#rowsJson?: HaysonDict[];

	readonly [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	constructor(grid: HaysonGrid) {
		this.#metaJson = grid.meta
		this.#columnsJson = grid.cols
		this.#rowsJson = grid.rows
	}

	get version(): string {
		if (this.#version === undefined) {
			this.#version = String(
				this.#metaJson?.[GRID_VERSION_NAME] ?? DEFAULT_GRID_VERSION
			)
		}

		return this.#version
	}

	set version(version: string) {
		this.#version = version
	}

	get meta(): HDict {
		if (!this.#meta) {
			if (this.#metaJson) {
				this.#meta = new HDict(new DictJsonStore(this.#metaJson))

				// Remove the version from the meta. This is used when decoding a Hayson based grid that
				// adds the version number to the grid's meta data. We need to remove the version so
				// comparisons (i.e. `equals`) still work as expected.
				if (this.#meta.has(GRID_VERSION_NAME)) {
					this.#meta.remove(GRID_VERSION_NAME)
				}
			} else {
				this.#meta = new HDict()
			}
		}

		return this.#meta
	}

	set meta(meta: HDict) {
		this.#meta = meta
	}

	get columns(): GridColumn[] {
		if (!this.#columns) {
			this.#columns =
				this.#columnsJson?.map(
					(column): GridColumn =>
						new GridColumn(
							column.name,
							column.meta
								? new HDict(new DictJsonStore(column.meta))
								: undefined
						)
				) ?? []

			this.#columnsJson = undefined
		}

		return this.#columns
	}

	set columns(columns: GridColumn[]) {
		this.#columns = columns
		this.#columnsJson = undefined
	}

	get rows(): DictVal[] {
		if (!this.#rows) {
			this.#rows =
				this.#rowsJson?.map(
					(row) => new HDict(new DictJsonStore(row)) as DictVal
				) ?? []

			this.#rowsJson = undefined
		}

		return this.#rows
	}

	set rows(rows: DictVal[]) {
		this.#rows = rows
		this.#rowsJson = undefined
	}

	toJSON(): HaysonGrid {
		// Return a new grid only with the parts of the grid that have changed.
		return {
			_kind: Kind.Grid,
			meta:
				this.#meta || this.#version
					? {
							[GRID_VERSION_NAME]: this.version,
							...this.meta.toJSON(),
					  }
					: this.#metaJson ?? {},
			cols: this.#columns
				? this.#columns.map((column: GridColumn) => ({
						name: column.name,
						meta: column.meta.toJSON(),
				  }))
				: this.#columnsJson ?? [],
			rows: this.#rows
				? this.#rows.map((row: DictVal): HaysonDict => row.toJSON())
				: this.#rowsJson ?? [],
		}
	}

	toJSONString(): string {
		return JSON.stringify(this.toJSON())
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonDict, HaysonGrid } from '../hayson'
import { TEXT_ENCODER } from '../HVal'
import { Kind } from '../Kind'
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
 *
 * This is designed to work as lazily and efficiently as possible.
 */
export class GridJsonStore<DictVal extends HDict>
	implements GridStore<DictVal>
{
	readonly #grid: HaysonGrid

	#version?: string
	#meta?: HDict
	#columns?: GridColumn[]
	#rows?: DictVal[]

	public readonly [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	public constructor(grid: HaysonGrid) {
		this.#grid = grid
	}

	public get version(): string {
		if (this.#version === undefined) {
			this.#version = String(
				this.#grid.meta?.[GRID_VERSION_NAME] ?? DEFAULT_GRID_VERSION
			)
		}

		return this.#version
	}

	public set version(version: string) {
		this.#version = version
	}

	public get meta(): HDict {
		if (!this.#meta) {
			if (this.#grid.meta) {
				this.#meta = makeValue(this.#grid.meta) as HDict

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

	public set meta(meta: HDict) {
		this.#meta = meta
	}

	public get columns(): GridColumn[] {
		if (!this.#columns) {
			this.#columns =
				this.#grid.cols?.map(
					(column): GridColumn =>
						new GridColumn(
							column.name,
							column.meta
								? (makeValue(column.meta) as HDict)
								: undefined
						)
				) ?? []
		}

		return this.#columns
	}

	public set columns(columns: GridColumn[]) {
		this.#columns = columns
	}

	public get rows(): DictVal[] {
		if (!this.#rows) {
			this.#rows =
				this.#grid.rows?.map((row) => makeValue(row) as DictVal) ?? []
		}

		return this.#rows
	}

	public set rows(rows: DictVal[]) {
		this.#rows = rows
	}

	public toJSON(): HaysonGrid {
		// If nothing has changed then just return the grid as it is.
		if (
			this.#version === undefined &&
			!this.#meta &&
			!this.#columns &&
			!this.#rows
		) {
			return this.#grid
		}

		// Return a new grid only with the parts of the grid that have changed.
		return {
			_kind: Kind.Grid,
			meta:
				this.#meta || this.#version
					? {
							[GRID_VERSION_NAME]: this.version,
							...this.meta.toJSON(),
					  }
					: this.#grid.meta,
			cols: this.#columns
				? this.#columns.map((column: GridColumn) => ({
						name: column.name,
						meta: column.meta.toJSON(),
				  }))
				: this.#grid.cols,
			rows: this.#rows
				? this.#rows.map((row: DictVal): HaysonDict => row.toJSON())
				: this.#grid.rows,
		}
	}

	public toJSONString(): string {
		return JSON.stringify(this.toJSON())
	}

	public toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

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
import { GridRowDictStore } from './GridRowDictStore'
import { DEFAULT_GRID_VERSION, GRID_VERSION_NAME, GridStore } from './GridStore'
import type { HGrid } from './HGrid'

/**
 * Implements the storage for an HGrid.
 *
 * This separates the HGrid interface from the actual storage,
 * which could be backed by a native one
 */
export class GridObjStore<DictVal extends HDict> implements GridStore<DictVal> {
	/**
	 * The internal grid's meta data.
	 */
	#meta: HDict

	/**
	 * The internal grid's columns.
	 */
	#columns: GridColumn[]

	/**
	 * An internal column index cache.
	 *
	 * This is used to increase the performance of column name look ups.
	 */
	#columnNameCache: { [prop: string]: number }

	/**
	 * The internal cached rows.
	 */
	#rows: DictVal[]

	/**
	 * The grid's version number.
	 */
	public version: string

	public constructor(
		arg?: GridObj<DictVal> | HaysonGrid | HVal | (HaysonDict | DictVal)[],
		skipChecks = false
	) {
		this.#columnNameCache = {}

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
			// Don't skip any column checks when we pass in haystack values
			// since we need the columns to be automatically generated for us.
			skipChecks = false

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
		this.#meta = meta
		this.#columns = columns.map(
			(column): GridColumn => new GridColumn(column.name, column.meta)
		)
		this.#rows = skipChecks ? (rows as DictVal[]) : []
		this.rebuildColumnCache()

		// If we're check each row then create the grid and add each dict.
		// Adding in this way enforces error checking on each row.
		if (!skipChecks) {
			for (const dict of rows) {
				this.add(makeValue(dict) as DictVal)
			}
		}
	}

	private add(
		...rows: (DictVal[] | HaysonDict[] | DictVal | HaysonDict)[]
	): this {
		const toAdd = GridObjStore.toDicts(rows)

		if (!toAdd.length) {
			throw new Error('No dicts to add to grid')
		}

		for (let row of toAdd) {
			row = makeValue(row) as DictVal

			if (!valueIsKind<HDict>(row, Kind.Dict)) {
				throw new Error('Row is not a dict')
			}

			const dict = HDict.makeFromStore(
				new GridRowDictStore(this, row)
			) as DictVal

			this.addMissingColumns(dict)

			this.rows.push(dict)
		}

		return this
	}

	/**
	 * Adds any missing columns for the dict.
	 *
	 * @param dict The dict to check.
	 */
	private addMissingColumns(dict: DictVal): void {
		// Add any missing columns.
		for (const key of dict.keys) {
			if (!this.hasColumn(key)) {
				this.addColumn(key, undefined)
			}
		}
	}

	/**
	 * Returns a flattened array of dicts.
	 *
	 * @param rows The rows to flatten into an array of dicts.
	 * @returns An array of dicts.
	 */
	private static toDicts<DictVal extends HDict>(
		rows: (DictVal[] | HaysonDict[] | DictVal | HaysonDict)[]
	): DictVal[] {
		const dicts: DictVal[] = []

		for (const row of rows) {
			if (Array.isArray(row)) {
				for (const innerRow of row) {
					dicts.push(makeValue(innerRow) as DictVal)
				}
			} else {
				dicts.push(makeValue(row) as DictVal)
			}
		}

		return dicts
	}

	public get meta(): HDict {
		return this.#meta
	}

	public hasColumn(name: string): boolean {
		return this.#columnNameCache[name] !== undefined
	}

	public get columns(): GridColumn[] {
		return this.#columns
	}

	public setColumn(index: number, column: GridColumn): void {
		this.#columns[index] = column
		this.#columnNameCache[column.name] = index
	}

	public getColumn(index: number | string): GridColumn | undefined {
		let column: GridColumn | undefined
		if (typeof index === 'number') {
			column = this.#columns[index as number]
		} else if (typeof index === 'string') {
			const i = this.#columnNameCache[index]
			if (i !== undefined) {
				column = this.#columns[i]
			}
		} else {
			throw new Error('Invalid input')
		}
		return column
	}

	public addColumn(name: string, meta: HDict | undefined): GridColumn {
		const index = this.#columnNameCache[name]

		const col = new GridColumn(name, meta || HDict.make())
		// If the column already exists then just update it.
		if (typeof index === 'number') {
			this.setColumn(index, col)
			return col
		} else {
			this.#columns.push(col)
			this.rebuildColumnCache()
			return col
		}
	}

	public reorderColumns(colNames: string[]): void {
		this.#columns = this.#columns.sort((first, second): number => {
			let firstIndex = 0
			let secondIndex = 0
			for (let i = 0; i < colNames.length; ++i) {
				if (colNames[i] === first.name) {
					firstIndex = i
				}
				if (colNames[i] === second.name) {
					secondIndex = i
				}
			}

			return firstIndex - secondIndex
		})

		this.rebuildColumnCache()
	}

	private rebuildColumnCache(): void {
		for (const key of Object.keys(this.#columnNameCache)) {
			delete this.#columnNameCache[key]
		}

		for (let i = 0; i < this.#columns.length; ++i) {
			this.#columnNameCache[this.#columns[i].name] = i
		}
	}

	public get(index: number): DictVal | undefined {
		return this.#rows[index]
	}

	public get rows(): DictVal[] {
		return this.#rows
	}

	public get size(): number {
		return this.#rows ? this.#rows.length : 0
	}
}

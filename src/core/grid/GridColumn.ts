/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HStr } from '../HStr'
import { valueIsKind } from '../HVal'
import { Kind } from '../Kind'

export const GRID_COLUMN_SYMBOL = Symbol.for('haystack-core.gridColumn')

/**
 * A grid column.
 */
export class GridColumn {
	/**
	 * Name of the column.
	 */
	readonly name: string

	/**
	 * Meta data for the column.
	 */
	readonly meta: HDict

	/**
	 * Constructs a new column.
	 *
	 * @param name The name of the column.
	 * @param meta The column's meta data.
	 */
	public constructor(name: string, meta?: HDict) {
		this.name = name
		this.meta = meta ?? HDict.make()
	}

	/**
	 * @returns The display name for the column.
	 */
	public get dis(): string {
		const dis = this.meta.get('dis')
		return (valueIsKind<HStr>(dis, Kind.Str) && dis.value) || this.name
	}

	/**
	 * @returns The display name for the column.
	 */
	public get displayName(): string {
		return this.dis
	}

	/**
	 * Column equality check.
	 *
	 * @param column The column to test.
	 * @returns True if the value is the same.
	 */
	public equals(column: GridColumn): boolean {
		if (!isGridColumn(column)) {
			return false
		}
		if (column.name !== this.name) {
			return false
		}
		if (!column.meta.equals(this.meta)) {
			return false
		}
		return true
	}

	/**
	 * Flag used to identify a grid column.
	 */
	public [GRID_COLUMN_SYMBOL] = GRID_COLUMN_SYMBOL
}

/**
 * Returns true if the value is a grid column.
 *
 * @param value The value.
 * @returns True if the value is a grid column.
 */
export function isGridColumn(value: unknown): value is GridColumn {
	return (value as GridColumn)?.[GRID_COLUMN_SYMBOL] === GRID_COLUMN_SYMBOL
}

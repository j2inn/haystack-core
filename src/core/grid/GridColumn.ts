/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HStr } from '../HStr'
import { CANNOT_CHANGE_READONLY_VALUE, valueIsKind } from '../HVal'
import { Kind } from '../Kind'

/**
 * A grid column.
 */
export class GridColumn {
	/**
	 * Inner name of the column.
	 */
	private $name: string

	/**
	 * Inner meta data for the column.
	 */
	private $meta: HDict

	/**
	 * Constructs a new column.
	 *
	 * @param name The name of the column.
	 * @param meta The column's meta data.
	 */
	public constructor(name: string, meta?: HDict) {
		this.$name = name
		this.$meta = meta || HDict.make()
	}

	/**
	 * @returns The column's name.
	 */
	public get name(): string {
		return this.$name
	}

	public set name(name: string) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The column's meta data.
	 */
	public get meta(): HDict {
		return this.$meta
	}

	public set meta(meta: HDict) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
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
		if (column.name !== this.$name) {
			return false
		}
		if (!column.meta.equals(this.$meta)) {
			return false
		}
		return true
	}

	/**
	 * Flag used to identify a grid column.
	 */
	public readonly _isAGridColumn = true
}

/**
 * Returns true if the value is a grid column.
 *
 * @param value The value.
 * @returns True if the value is a grid column.
 */
export function isGridColumn(value: unknown): value is GridColumn {
	return (value as GridColumn)?._isAGridColumn
}

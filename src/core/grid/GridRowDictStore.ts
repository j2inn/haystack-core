/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { DictStore } from '../dict/DictStore'
import { HDict } from '../dict/HDict'
import { HValObj } from '../dict/HValObj'
import { HaysonDict } from '../hayson'
import { HVal, OptionalHVal } from '../HVal'
import { GridStore } from './GridStore'

/**
 * A dict store for a row in a grid.
 *
 * This is used as the backing store for a dict (row) held in a grid. The dict itself
 * requires a reference to its parent grid. It wraps the inner Dict used to store the actual
 * row data.
 *
 * When a grid is filtered, this inner dict is reused across grids to maximize memory usage.
 */
export class GridRowDictStore<DictVal extends HDict> implements DictStore {
	/**
	 * A reference to the outer grid instance.
	 */
	readonly #gridStore: GridStore<DictVal>

	/**
	 * The inner dict that holds the data.
	 */
	readonly #cells: DictVal

	public constructor(gridStore: GridStore<DictVal>, cells: DictVal) {
		this.#gridStore = gridStore
		this.#cells = cells
	}

	public get(name: string): HVal | undefined | null {
		return this.#cells.get(name)
	}

	public has(name: string): boolean {
		return this.#cells.has(name)
	}

	public set(name: string, value: OptionalHVal): void {
		// The column to the grid if it's missing.
		if (!this.#gridStore.hasColumn(name)) {
			this.#gridStore.addColumn(name, undefined)
		}

		this.#cells.set(name, value)
	}

	public remove(name: string): void {
		this.#cells.remove(name)
	}

	public clear(): void {
		this.#cells.clear()
	}

	public getKeys(): string[] {
		return this.#cells.keys
	}

	public toObj(): HValObj {
		return this.#cells.toObj()
	}

	public toJSON(): HaysonDict {
		return this.#cells.toJSON()
	}
}

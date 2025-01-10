/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonGrid } from '../hayson'
import { TEXT_ENCODER } from '../HVal'
import { GridColumn } from './GridColumn'
import { GridJsonStore } from './GridJsonStore'
import { GRID_STORE_SYMBOL, GridStore } from './GridStore'

/**
 * Implements the storage for an HGrid using a JSON string.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a grid to be lazily decoded from a JSON string.
 */
export class GridJsonStringStore<DictVal extends HDict>
	implements GridStore<DictVal>
{
	#grid: string

	#store?: GridStore<DictVal>;

	readonly [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	constructor(grid: string) {
		this.#grid = grid
	}

	get version(): string {
		return this.getStore().version
	}

	set version(version: string) {
		this.getStore().version = version
	}

	get meta(): HDict {
		return this.getStore().meta
	}

	set meta(meta: HDict) {
		this.getStore().meta = meta
	}

	get columns(): GridColumn[] {
		return this.getStore().columns
	}

	set columns(columns: GridColumn[]) {
		this.getStore().columns = columns
	}

	get rows(): DictVal[] {
		return this.getStore().rows
	}

	set rows(rows: DictVal[]) {
		this.getStore().rows = rows
	}

	toJSON(): HaysonGrid {
		return this.getStore().toJSON()
	}

	toJSONString(): string {
		return this.#store ? this.#store.toJSONString() : this.#grid
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}

	private getStore(): GridStore<DictVal> {
		if (!this.#store) {
			this.#store = new GridJsonStore(JSON.parse(this.#grid))
			this.#grid = ''
		}

		return this.#store
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'
import { HaysonGrid } from '../hayson'
import { TEXT_DECODER } from '../HVal'
import { GridColumn } from './GridColumn'
import { GridJsonStringStore } from './GridJsonStringStore'
import { GRID_STORE_SYMBOL, GridStore } from './GridStore'

/**
 * Implements the storage for an HGrid using a JSON string in a byte buffer.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a grid to be lazily decoded from a JSON string byte buffer.
 */
export class GridJsonUint8ArrayStore<DictVal extends HDict>
	implements GridStore<DictVal>
{
	readonly #grid: Uint8Array

	#store?: GridStore<DictVal>

	public readonly [GRID_STORE_SYMBOL] = GRID_STORE_SYMBOL

	public constructor(grid: Uint8Array) {
		this.#grid = grid
	}

	public get version(): string {
		return this.getStore().version
	}

	public set version(version: string) {
		this.getStore().version = version
	}

	public get meta(): HDict {
		return this.getStore().meta
	}

	public set meta(meta: HDict) {
		this.getStore().meta = meta
	}

	public get columns(): GridColumn[] {
		return this.getStore().columns
	}

	public set columns(columns: GridColumn[]) {
		this.getStore().columns = columns
	}

	public get rows(): DictVal[] {
		return this.getStore().rows
	}

	public set rows(rows: DictVal[]) {
		this.getStore().rows = rows
	}

	public toJSON(): HaysonGrid {
		return this.getStore().toJSON()
	}

	public toJSONString(): string {
		return this.getStore().toJSONString()
	}

	public toJSONUint8Array(): Uint8Array {
		return this.#store ? this.#store.toJSONUint8Array() : this.#grid
	}

	private getStore(): GridStore<DictVal> {
		if (!this.#store) {
			this.#store = new GridJsonStringStore(
				TEXT_DECODER.decode(this.#grid)
			)
		}

		return this.#store
	}
}
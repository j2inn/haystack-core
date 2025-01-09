/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal } from '../HVal'
import { ListJsonStore } from './ListJsonStore'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList using a JSON (Hayson) string.
 */
export class ListJsonStringStore<Value extends OptionalHVal>
	implements ListStore<Value>
{
	/**
	 * The original Hayson list encoded as a string.
	 */
	#list: string

	/**
	 * The inner JSON store that's lazily created.
	 */
	#store?: ListStore<Value>;

	readonly [LIST_STORE_SYMBOL] = LIST_STORE_SYMBOL

	constructor(list: string) {
		this.#list = list
	}

	public get values(): Value[] {
		return this.getStore().values
	}

	public set values(values: Value[]) {
		this.getStore().values = values
	}

	public toJSON(): HaysonList {
		return this.getStore().toJSON()
	}

	public toJSONString(): string {
		return this.#store ? this.#store.toJSONString() : this.#list
	}

	private getStore(): ListStore<Value> {
		if (!this.#store) {
			this.#store = new ListJsonStore(JSON.parse(this.#list))
			this.#list = ''
		}

		return this.#store
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { ListJsonStore } from './ListJsonStore'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList using a JSON (Hayson) string.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a list to be lazily decoded from a JSON string.
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

	get values(): Value[] {
		return this.getStore().values
	}

	set values(values: Value[]) {
		this.getStore().values = values
	}

	toJSON(): HaysonList {
		return this.getStore().toJSON()
	}

	toJSONString(): string {
		return this.#store ? this.#store.toJSONString() : this.#list
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}

	private getStore(): ListStore<Value> {
		if (!this.#store) {
			this.#store = new ListJsonStore(JSON.parse(this.#list))
			this.#list = ''
		}

		return this.#store
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal, TEXT_DECODER } from '../HVal'
import { ListJsonStringStore } from './ListJsonStringStore'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList using a JSON (Hayson) string encoded in a byte buffer.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a list to be lazily decoded from a JSON string in a byte buffer.
 */
export class ListJsonUint8ArrayStore<Value extends OptionalHVal>
	implements ListStore<Value>
{
	/**
	 * The original Hayson list encoded as a string in a byte buffer.
	 */
	#list?: Uint8Array

	/**
	 * The inner JSON store that's lazily created.
	 */
	#store?: ListStore<Value>;

	readonly [LIST_STORE_SYMBOL] = LIST_STORE_SYMBOL

	constructor(list: Uint8Array) {
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
		return this.getStore().toJSONString()
	}

	toJSONUint8Array(): Uint8Array {
		return this.#store
			? this.#store.toJSONUint8Array()
			: this.#list ?? new Uint8Array()
	}

	private getStore(): ListStore<Value> {
		if (!this.#store) {
			this.#store = new ListJsonStringStore(
				TEXT_DECODER.decode(this.#list)
			)
			this.#list = undefined
		}

		return this.#store
	}
}

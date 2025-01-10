/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { makeValue } from '../util'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList using JSON.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a list to be lazily decoded from a JSON object.
 */
export class ListJsonStore<Value extends OptionalHVal>
	implements ListStore<Value>
{
	#list?: HaysonList

	#values?: Value[];

	readonly [LIST_STORE_SYMBOL] = LIST_STORE_SYMBOL

	constructor(list: HaysonList) {
		this.#list = list
	}

	get values(): Value[] {
		if (!this.#values) {
			this.#values =
				this.#list?.map((value) => makeValue(value) as Value) ?? []

			this.#list = undefined
		}

		return this.#values
	}

	set values(values: Value[]) {
		this.#values = values
		this.#list = undefined
	}

	toJSON(): HaysonList {
		return this.#values
			? this.#values.map((value) => value?.toJSON() ?? null)
			: this.#list ?? []
	}

	toJSONString(): string {
		return JSON.stringify(this)
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

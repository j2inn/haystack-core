/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal } from '../HVal'
import { makeValue } from '../util'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList using JSON.
 */
export class ListJsonStore<Value extends OptionalHVal>
	implements ListStore<Value>
{
	readonly #list: HaysonList

	#values?: Value[];

	readonly [LIST_STORE_SYMBOL] = LIST_STORE_SYMBOL

	constructor(list: HaysonList) {
		this.#list = list
	}

	public get values(): Value[] {
		if (!this.#values) {
			this.#values = this.#list.map((value) => makeValue(value) as Value)
		}

		return this.#values
	}

	public set values(values: Value[]) {
		this.#values = values
	}

	public toJSON(): HaysonList {
		return this.#values
			? this.#values.map((value) => value?.toJSON() ?? null)
			: this.#list
	}

	public toJSONString(): string {
		return JSON.stringify(this)
	}
}

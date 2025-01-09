/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonList } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { LIST_STORE_SYMBOL, ListStore } from './ListStore'

/**
 * Implements the storage for an HList.
 */
export class ListObjStore<Value extends OptionalHVal>
	implements ListStore<Value>
{
	values: Value[];

	readonly [LIST_STORE_SYMBOL] = LIST_STORE_SYMBOL

	constructor(values: Value[]) {
		this.values = values
	}

	public toJSON(): HaysonList {
		return this.values.map((value) => (value ? value.toJSON() : null))
	}

	public toJSONString(): string {
		return JSON.stringify(this)
	}

	public toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

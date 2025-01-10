/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonVal, HaysonDict } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { makeValue } from '../util'
import { DICT_STORE_SYMBOL, DictStore } from './DictStore'
import { HValObj, hvalObjToJson } from './HValObj'

/**
 * Returns an object with haystack values.
 *
 * @param values The values.
 * @returns Haystack values.
 */
export function toHValObj(
	values: Record<string, OptionalHVal | HaysonVal>
): HValObj {
	const hvalObj: HValObj = {}

	for (const prop in values) {
		const obj = values[prop]

		if (
			obj !== undefined &&
			typeof obj !== 'function' &&
			typeof obj !== 'symbol'
		) {
			hvalObj[prop] = makeValue(obj)
		}
	}

	return hvalObj
}

/**
 * Implementation of a store with the backing data being held
 * in an object.
 */
export class DictHValObjStore implements DictStore {
	#values: HValObj;

	readonly [DICT_STORE_SYMBOL] = DICT_STORE_SYMBOL

	constructor(values: HValObj) {
		this.#values = values
	}

	get(name: string): OptionalHVal | undefined {
		return this.#values[name]
	}

	has(name: string): boolean {
		return this.#values[name] !== undefined
	}

	set(name: string, value: OptionalHVal): void {
		this.#values[name] = value
	}

	remove(name: string): void {
		delete this.#values[name]
	}

	clear(): void {
		this.#values = {}
	}

	getKeys(): string[] {
		return Object.keys(this.#values)
	}

	toObj(): HValObj {
		return this.#values
	}

	toJSON(): HaysonDict {
		return hvalObjToJson(this.#values)
	}

	toJSONString(): string {
		return JSON.stringify(this.toJSON())
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}
}

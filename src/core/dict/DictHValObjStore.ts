/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonVal, HaysonDict } from '../hayson'
import { OptionalHVal } from '../HVal'
import { makeValue } from '../util'
import { DICT_STORE_SYMBOL, DictStore } from './DictStore'
import { HValObj, hvalObjToJson } from './HValObj'

/**
 * Returns an object with haystack values.
 *
 * @param values The values.
 * @returns Haystack values.
 */
export function toHValObj(values: {
	[prop: string]: OptionalHVal | HaysonVal
}): HValObj {
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
	readonly #values: HValObj

	public constructor(values: HValObj) {
		this.#values = values
	}

	public get(name: string): OptionalHVal | undefined {
		return this.#values[name]
	}

	public has(name: string): boolean {
		return this.#values[name] !== undefined
	}

	public set(name: string, value: OptionalHVal): void {
		this.#values[name] = value
	}

	public remove(name: string): void {
		delete this.#values[name]
	}

	public clear(): void {
		// Don't overwrite this object completely just in case it's had an
		// observable installed on it.
		Object.keys(this.#values).forEach((key: string): void => {
			delete this.#values[key]
		})
	}

	public getKeys(): string[] {
		return Object.keys(this.#values)
	}

	public toObj(): HValObj {
		return this.#values
	}

	public toJSON(): HaysonDict {
		return hvalObjToJson(this.#values)
	}

	public [DICT_STORE_SYMBOL] = DICT_STORE_SYMBOL
}

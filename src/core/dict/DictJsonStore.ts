/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { Kind } from '../Kind'
import { makeValue } from '../util'
import { toHValObj } from './DictHValObjStore'
import { DICT_STORE_SYMBOL, DictStore } from './DictStore'
import { HValObj, hvalObjToJson } from './HValObj'

/**
 * A dict store that uses a pure JSON (Hayson) object to store the values.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * * Values are lazily decoded from the original JSON object.
 * * The first set decodes all values and sets a flag to ensure all decoded values are used from then on.
 * * The design ensures the original JSON object is used for encoding back to JSON as much as possible.
 */
export class DictJsonStore implements DictStore {
	/**
	 * The original Hayson dict.
	 */
	#values: HaysonDict

	/**
	 * Cached hvals.
	 *
	 * This cache is gradually added to if values are read from the JSON object.
	 * If the dict is written too then all values are decoded.
	 */
	#hvals: HValObj = {}

	/**
	 * A flag indicating whether all the values have been decoded.
	 */
	#allDecoded = false

	constructor(values: HaysonDict) {
		this.#values = values
	}

	public get(name: string): OptionalHVal | undefined {
		// Is the value already decoded?
		const hval = this.#hvals[name]

		if (hval !== undefined) {
			return hval
		}

		// If the values are all decoded then there's no point in checking the original
		// JSON values.
		if (!this.#allDecoded) {
			const val = this.#values[name]

			// Lazily decode and cache the value.
			if (val !== undefined) {
				const newHVal = makeValue(val)

				this.#hvals[name] = newHVal

				// If a collection is read then we have no way of knowing if it's been modified (as it's a child).
				// In this case, we decode all the values so we don't end up returning an invalid JSON object.
				if (
					newHVal &&
					(newHVal.getKind() === Kind.Dict ||
						newHVal.getKind() === Kind.List ||
						newHVal.getKind() === Kind.Grid)
				) {
					this.decodeAll()
				}

				return newHVal
			}
		}

		return undefined
	}

	public has(name: string): boolean {
		return this.#allDecoded
			? this.#hvals[name] !== undefined
			: this.#values[name] !== undefined
	}

	public set(name: string, value: OptionalHVal): void {
		this.decodeAll()
		this.#hvals[name] = value
	}

	public remove(name: string): void {
		delete this.#hvals[name]
		delete this.#values[name]
	}

	public clear(): void {
		this.#values = {}
		this.#hvals = {}
		// Just mark as all decoded so all the values have been removed and hence are synchronized.
		this.#allDecoded = true
	}

	public getKeys(): string[] {
		return Object.keys(this.#allDecoded ? this.#hvals : this.#values)
	}

	public toObj(): HValObj {
		this.decodeAll()
		return this.#hvals
	}

	public toJSON(): HaysonDict {
		return this.#allDecoded ? hvalObjToJson(this.#hvals) : this.#values
	}

	public toJSONString(): string {
		return JSON.stringify(this.toJSON())
	}

	public toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}

	public readonly [DICT_STORE_SYMBOL] = DICT_STORE_SYMBOL

	private decodeAll(): void {
		if (!this.#allDecoded) {
			this.#allDecoded = true
			this.#hvals = toHValObj(this.#values)
		}
	}
}

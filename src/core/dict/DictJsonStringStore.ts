/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal, TEXT_ENCODER } from '../HVal'
import { DictJsonStore } from './DictJsonStore'
import { DICT_STORE_SYMBOL, DictStore } from './DictStore'
import { HValObj } from './HValObj'

/**
 * A dict store that uses a JSON (Hayson) string.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a dict to be lazily decoded from a JSON string.
 */
export class DictJsonStringStore implements DictStore {
	/**
	 * The original Hayson dict encoded as a string.
	 */
	#values: string

	/**
	 * The inner JSON store that's lazily created.
	 */
	#store?: DictStore;

	readonly [DICT_STORE_SYMBOL] = DICT_STORE_SYMBOL

	constructor(values: string) {
		this.#values = values
	}

	get(name: string): OptionalHVal | undefined {
		return this.getStore().get(name)
	}

	has(name: string): boolean {
		return this.getStore().has(name)
	}

	set(name: string, value: OptionalHVal): void {
		this.getStore().set(name, value)
	}

	remove(name: string): void {
		this.getStore().remove(name)
	}

	clear(): void {
		this.getStore().clear()
	}

	getKeys(): string[] {
		return this.getStore().getKeys()
	}

	toObj(): HValObj {
		return this.getStore().toObj()
	}

	toJSON(): HaysonDict {
		return this.getStore().toJSON()
	}

	toJSONString(): string {
		return this.#store ? this.#store.toJSONString() : this.#values
	}

	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}

	private getStore(): DictStore {
		if (!this.#store) {
			this.#store = new DictJsonStore(JSON.parse(this.#values))
			this.#values = ''
		}

		return this.#store
	}
}

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal, TEXT_DECODER } from '../HVal'
import { DictJsonStringStore } from './DictJsonStringStore'
import { DICT_STORE_SYMBOL, DictStore } from './DictStore'
import { HValObj } from './HValObj'

/**
 * A dict store that uses a JSON (Hayson) string encoded in a byte buffer.
 *
 * This is designed to work as lazily and efficiently as possible.
 *
 * This enables a dict to be lazily decoded from a JSON string in a byte buffer.
 */
export class DictJsonUint8ArrayStore implements DictStore {
	/**
	 * The original Hayson dict encoded as a string in a byte buffer.
	 */
	#values: Uint8Array

	/**
	 * The inner JSON store that's lazily created.
	 */
	#store?: DictStore

	constructor(values: Uint8Array) {
		this.#values = values
	}

	public get(name: string): OptionalHVal | undefined {
		return this.getStore().get(name)
	}

	public has(name: string): boolean {
		return this.getStore().has(name)
	}

	public set(name: string, value: OptionalHVal): void {
		this.getStore().set(name, value)
	}

	public remove(name: string): void {
		this.getStore().remove(name)
	}

	public clear(): void {
		this.getStore().clear()
	}

	public getKeys(): string[] {
		return this.getStore().getKeys()
	}

	public toObj(): HValObj {
		return this.getStore().toObj()
	}

	public toJSON(): HaysonDict {
		return this.getStore().toJSON()
	}

	public toJSONString(): string {
		return this.getStore().toJSONString()
	}

	public toJSONUint8Array(): Uint8Array {
		return this.#store ? this.#store.toJSONUint8Array() : this.#values
	}

	public readonly [DICT_STORE_SYMBOL] = DICT_STORE_SYMBOL

	private getStore(): DictStore {
		if (!this.#store) {
			this.#store = new DictJsonStringStore(
				TEXT_DECODER.decode(this.#values)
			)
		}

		return this.#store
	}
}

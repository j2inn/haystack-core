/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal } from '../HVal'
import { toHValObj } from './DictObjStore'
import { DictStore } from './DictStore'
import { HValObj, hvalObjToJson } from './HValObj'

/**
 * A dict store that uses a backing JSON (Hayson) object to store the values.
 *
 * This is designed to work as lazily and efficiently as possible.
 */
export class DictJsonStore implements DictStore {
	/**
	 * The original Hayson dict.
	 */
	#values: HaysonDict

	/**
	 * Cached hvals.
	 */
	#hvals?: HValObj

	constructor(values: HaysonDict) {
		this.#values = values
	}

	public get(name: string): OptionalHVal | undefined {
		return this.getHvals()[name]
	}

	public has(name: string): boolean {
		return this.#hvals
			? this.#hvals[name] !== undefined
			: this.#values[name] !== undefined
	}

	public set(name: string, value: OptionalHVal): void {
		this.getHvals()[name] = value
	}

	public remove(name: string): void {
		if (this.#hvals) {
			delete this.#hvals[name]
		} else {
			delete this.#values[name]
		}
	}

	public clear(): void {
		this.#values = {}
		this.#hvals = undefined
	}

	public getKeys(): string[] {
		return Object.keys(this.#hvals ?? this.#values)
	}

	public toObj(): HValObj {
		return this.getHvals()
	}

	public toJSON(): HaysonDict {
		return this.#hvals ? hvalObjToJson(this.#hvals) : this.#values
	}

	private getHvals(): HValObj {
		if (!this.#hvals) {
			this.#hvals = toHValObj(this.#values)
		}

		return this.#hvals
	}
}

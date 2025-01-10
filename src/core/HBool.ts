/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { Kind } from './Kind'
import {
	HVal,
	CANNOT_CHANGE_READONLY_VALUE,
	valueInspect,
	valueIsKind,
	valueMatches,
	TEXT_ENCODER,
} from './HVal'
import { Node } from '../filter/Node'
import { HGrid } from './grid/HGrid'
import { HList } from './list/HList'
import { HDict } from './dict/HDict'
import { EvalContext } from '../filter/EvalContext'

let trueInstance: HBool
let falseInstance: HBool

/**
 * Haystack boolean.
 */
export class HBool implements HVal {
	/**
	 * The boolean value.
	 */
	readonly #value: boolean

	/**
	 * Constructs a new haystack boolean.
	 *
	 * @param value The value.
	 */
	private constructor(value: boolean) {
		this.#value = !!value
	}

	/**
	 * Factory method for a haystack boolean.
	 *
	 * @param value The value.
	 * @returns A haystack boolean value.
	 */
	static make(value: boolean | HBool): HBool {
		if (typeof value === 'boolean') {
			if (value) {
				return (
					trueInstance ??
					Object.freeze((trueInstance = new HBool(true)))
				)
			} else {
				return (
					falseInstance ??
					Object.freeze((falseInstance = new HBool(false)))
				)
			}
		} else {
			return value
		}
	}

	/**
	 * @returns The boolean value.
	 */
	get value(): boolean {
		return this.#value
	}

	set value(value: boolean) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The value's kind.
	 */
	getKind(): Kind {
		return Kind.Bool
	}

	/**
	 * Compares the value's kind.
	 *
	 * @param kind The kind to compare against.
	 * @returns True if the kind matches.
	 */
	isKind(kind: Kind): boolean {
		return valueIsKind<HBool>(this, kind)
	}

	/* Returns true if the haystack filter matches the value.
	 *
	 * @param filter The filter to test.
	 * @param cx Optional haystack filter evaluation context.
	 * @returns True if the filter matches ok.
	 */
	matches(filter: string | Node, cx?: Partial<EvalContext>): boolean {
		return valueMatches(this, filter, cx)
	}

	/**
	 *
	 * @param message An optional message to display before the value.
	 * @returns The value instance.
	 */
	inspect(message?: string): this {
		return valueInspect(this, message)
	}

	/*
	 * @returns The object's value as a boolean string.
	 */
	valueOf(): boolean {
		return this.#value
	}

	/**
	 * Value equality check.
	 *
	 * @param value The value to compare.
	 * @returns True if the value is the same.
	 */
	equals(value: unknown): boolean {
		return (
			valueIsKind<HBool>(value, Kind.Bool) &&
			this.valueOf() === value.valueOf()
		)
	}

	/**
	 * Compares two booleans.
	 *
	 * @param value The value to compare against.
	 * @returns The sort order as negative, 0, or positive
	 */
	compareTo(value: unknown): number {
		if (!valueIsKind<HBool>(value, Kind.Bool)) {
			return -1
		}

		if (this.valueOf() < value.valueOf()) {
			return -1
		}
		if (this.valueOf() === value.valueOf()) {
			return 0
		}
		return 1
	}

	/**
	 * @returns A string representation of the value.
	 */
	toString(): string {
		return String(this.value)
	}

	/**
	 * Encodes to an encoded zinc value that can be used
	 * in a haystack filter string.
	 *
	 * The encoding for a haystack filter is mostly zinc but contains
	 * some exceptions.
	 *
	 * @returns The encoded value that can be used in a haystack filter.
	 */
	toFilter(): string {
		return this.valueOf() ? 'true' : 'false'
	}

	/**
	 * Encode to zinc encoding.
	 *
	 * @returns The encoded zinc string.
	 */
	toZinc(): string {
		return this.valueOf() ? 'T' : 'F'
	}

	/**
	 * @returns A JSON reprentation of the object.
	 */
	toJSON(): boolean {
		return this.valueOf()
	}

	/**
	 * @returns A string containing the JSON representation of the object.
	 */
	toJSONString(): string {
		return JSON.stringify(this)
	}

	/**
	 * @returns A byte buffer that has an encoded JSON string representation of the object.
	 */
	toJSONUint8Array(): Uint8Array {
		return TEXT_ENCODER.encode(this.toJSONString())
	}

	/**
	 * @returns A JSON v3 representation of the object.
	 */
	toJSONv3(): boolean {
		return this.toJSON()
	}

	/**
	 * @returns An Axon encoded string of the value.
	 */
	toAxon(): string {
		return String(this.valueOf())
	}

	/**
	 * @returns Returns the value instance.
	 */
	newCopy(): HBool {
		return this
	}

	/**
	 * @returns The value as a grid.
	 */
	toGrid(): HGrid {
		return HGrid.make(this)
	}

	/**
	 * @returns The value as a list.
	 */
	toList(): HList<HBool> {
		return HList.make([this])
	}

	/**
	 * @returns The value as a dict.
	 */
	toDict(): HDict {
		return HDict.make(this)
	}
}

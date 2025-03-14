/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-unused-vars: "off", @typescript-eslint/no-empty-function: "off" */

import { Kind } from './Kind'
import {
	HVal,
	NOT_SUPPORTED_IN_FILTER_MSG,
	TEXT_ENCODER,
	valueInspect,
	valueIsKind,
	valueMatches,
} from './HVal'
import { HaysonMarker } from './hayson'
import { Node } from '../filter/Node'
import { HGrid } from './grid/HGrid'
import { HList } from './list/HList'
import { HDict } from './dict/HDict'
import { EvalContext } from '../filter/EvalContext'
import { JsonV3Marker } from './jsonv3'

/**
 * An immutable JSON value.
 */
const JSON_MARKER = {
	_kind: Kind.Marker,
}

let marker: HMarker

/**
 * Haystack marker value.
 */
export class HMarker implements HVal {
	/**
	 * Constructs a new haystack marker.
	 */
	private constructor() {}

	/**
	 * Makes a marker.
	 *
	 * @returns A marker instance.
	 */
	static make(): HMarker {
		return marker ?? (marker = Object.freeze(new HMarker()) as HMarker)
	}

	/**
	 * @returns The value's kind.
	 */
	getKind(): Kind {
		return Kind.Marker
	}

	/**
	 * Compares the value's kind.
	 *
	 * @param kind The kind to compare against.
	 * @returns True if the kind matches.
	 */
	isKind(kind: Kind): boolean {
		return valueIsKind<HMarker>(this, kind)
	}

	/**
	 * Returns true if the haystack filter matches the value.
	 *
	 * @param filter The filter to test.
	 * @param cx Optional haystack filter evaluation context.
	 * @returns True if the filter matches ok.
	 */
	matches(filter: string | Node, cx?: Partial<EvalContext>): boolean {
		return valueMatches(this, filter, cx)
	}

	/**
	 * Dump the value to the local console output.
	 *
	 * @param message An optional message to display before the value.
	 * @returns The value instance.
	 */
	inspect(message?: string): this {
		return valueInspect(this, message)
	}

	/**
	 * @returns A string representation of the value.
	 */
	toString(): string {
		return '✔'
	}

	/**
	 * @returns The zinc encoded string.
	 */
	valueOf(): string {
		return this.toZinc()
	}

	/**
	 * Encodes to an encoding zinc value.
	 *
	 * @returns The encoded zinc string.
	 */
	toZinc(): string {
		return 'M'
	}

	/**
	 * Encodes to an encoded zinc value that can be used
	 * in a haystack filter string.
	 *
	 * A dict isn't supported in filter so throw an error.
	 *
	 * @returns The encoded value that can be used in a haystack filter.
	 */
	toFilter(): string {
		throw new Error(NOT_SUPPORTED_IN_FILTER_MSG)
	}

	/**
	 * Value equality check.
	 *
	 * @param value The marker to compare.
	 * @returns True if the value is the same.
	 */
	equals(value: unknown): boolean {
		return valueIsKind<HMarker>(value, Kind.Marker)
	}

	/**
	 * Compares two values.
	 *
	 * @param value The value to compare against.
	 * @returns The sort order as negative, 0, or positive
	 */
	compareTo(value: unknown): number {
		return valueIsKind<HMarker>(value, Kind.Marker) ? 0 : -1
	}

	/**
	 * @returns A JSON reprentation of the object.
	 */
	toJSON(): HaysonMarker {
		return JSON_MARKER
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
	toJSONv3(): JsonV3Marker {
		return 'm:'
	}

	/**
	 * @returns An Axon encoded string of the value.
	 */
	toAxon(): string {
		return 'marker()'
	}

	/**
	 * @returns Returns the value instance.
	 */
	newCopy(): HMarker {
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
	toList(): HList<HMarker> {
		return HList.make([this])
	}

	/**
	 * @returns The value as a dict.
	 */
	toDict(): HDict {
		return HDict.make(this)
	}
}

/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { Kind } from './Kind'
import {
	HVal,
	NOT_SUPPORTED_IN_FILTER_MSG,
	CANNOT_CHANGE_READONLY_VALUE,
	valueInspect,
	valueIsKind,
	valueMatches,
	TEXT_ENCODER,
} from './HVal'
import { HaysonCoord } from './hayson'
import { Node } from '../filter/Node'
import { HGrid } from './grid/HGrid'
import { HList } from './list/HList'
import { HDict } from './dict/HDict'
import { EvalContext } from '../filter/EvalContext'
import { JsonV3Coord } from './jsonv3'

export interface CoordObj {
	latitude: number
	longitude: number
}

/**
 * Haystack coord.
 */
export class HCoord implements HVal {
	/**
	 * Internal latitude.
	 */
	readonly #latitude: number

	/**
	 * Internal longitude.
	 */
	readonly #longitude: number

	/**
	 * Constructs a new haystack coord.
	 *
	 * @param value An object with latitude and longitude or a Hayson coordinate object.
	 * @throws An error if the latitude or longitude are invalid.
	 */
	private constructor(value: CoordObj | HaysonCoord) {
		let latitude = 0
		let longitude = 0

		if (value) {
			if (typeof (value as CoordObj).latitude === 'number') {
				const obj = value as CoordObj

				latitude = obj.latitude
				longitude = obj.longitude
			} else {
				const obj = value as HaysonCoord

				latitude = obj.lat
				longitude = obj.lng
			}
		}

		if (latitude < -90000000 || latitude > 90000000) {
			throw new Error('Invalid lat > +/- 90')
		}

		if (longitude < -180000000 || longitude > 180000000) {
			throw new Error('Invalid lng > +/- 180')
		}

		this.#latitude = latitude
		this.#longitude = longitude
	}

	/**
	 * Factory method for a new haystack coord.
	 *
	 * @param value An object with latitude and longitude or a Hayson coordinate object.
	 * @returns A haystack coordinate.
	 * @throws An error if the latitude or longitude are invalid.
	 */
	static make(value: CoordObj | HaysonCoord | HCoord): HCoord {
		if (valueIsKind<HCoord>(value, Kind.Coord)) {
			return value
		} else {
			return new HCoord(value as CoordObj | HaysonCoord)
		}
	}

	/**
	 * @returns The latitude value.
	 */
	get latitude(): number {
		return this.#latitude
	}

	set latitude(latitude: number) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The longitude value.
	 */
	get longitude(): number {
		return this.#longitude
	}

	set longitude(longitude: number) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The value's kind.
	 */
	getKind(): Kind {
		return Kind.Coord
	}

	/**
	 * Compares the value's kind.
	 *
	 * @param kind The kind to compare against.
	 * @returns True if the kind matches.
	 */
	isKind(kind: Kind): boolean {
		return valueIsKind<HCoord>(this, kind)
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
		return `latitude: ${this.latitude}, longitude: ${this.longitude}`
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
	 * Encodes to an encoding zinc value.
	 *
	 * @returns The encoded zinc string.
	 */
	toZinc(): string {
		return `C(${this.latitude},${this.longitude})`
	}

	/**
	 * Value equality check.
	 *
	 * @param value The value to compare.
	 * @returns True if the value is the same.
	 */
	equals(value: unknown): boolean {
		return (
			valueIsKind<HCoord>(value, Kind.Coord) &&
			value.latitude === this.latitude &&
			value.longitude === this.longitude
		)
	}

	/**
	 * Compares two coords.
	 *
	 * @param value The value to compare against.
	 * @returns The sort order as negative, 0, or positive
	 */
	compareTo(value: unknown): number {
		if (!valueIsKind<HCoord>(value, Kind.Coord)) {
			return -1
		}

		const val0 = `${this.latitude}:${this.longitude}`
		const val1 = `${value.latitude}:${value.longitude}`

		if (val0 < val1) {
			return -1
		}
		if (val0 === val1) {
			return 0
		}
		return 1
	}

	/**
	 * @returns A JSON reprentation of the object.
	 */
	toJSON(): HaysonCoord {
		return {
			_kind: Kind.Coord,
			lat: this.latitude,
			lng: this.longitude,
		}
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
	toJSONv3(): JsonV3Coord {
		return `c:${this.latitude},${this.longitude}`
	}

	/**
	 * @returns An Axon encoded string of the value.
	 */
	toAxon(): string {
		return `coord(${this.latitude},${this.longitude})`
	}

	/**
	 * @returns Returns the value instance.
	 */
	newCopy(): HCoord {
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
	toList(): HList<HCoord> {
		return HList.make([this])
	}

	/**
	 * @returns The value as a dict.
	 */
	toDict(): HDict {
		return HDict.make(this)
	}
}

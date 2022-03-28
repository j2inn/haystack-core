/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HUri } from '../core/HUri'
import { HBool } from '../core/HBool'
import { HRef } from '../core/HRef'
import { HNum } from '../core/HNum'
import { HDate } from '../core/HDate'
import { HTime } from '../core/HTime'
import { HStr } from '../core/HStr'
import { HSymbol } from '../core/HSymbol'
import { makeValue } from '../core/util'
import { HFilter } from './HFilter'
import { Node } from './Node'

type Path = string | string[]

type Value =
	| HBool
	| HRef
	| HStr
	| HUri
	| HNum
	| HDate
	| HTime
	| HSymbol
	| string
	| boolean
	| number
	| Date

/**
 * Used to build Haystack Filter strings.
 *
 * ```typescript
 * const filter = new HFilterBuilder()
 *   .has('site')
 *   .and()
 *   .equals('geoCity', 'Las Vegas')
 *   .build()
 * ```
 */
export class HFilterBuilder {
	/**
	 * The internal string buffer used to build the filter.
	 */
	private buf = ''

	/**
	 * Used for a type guard check.
	 */
	public readonly _isHFilterBuilder = true

	/**
	 * Return true if the value is a haystack filter builder object.
	 *
	 * @param value The value to test.
	 * @returns True if the value is a haystack filter builder.
	 */
	public static isHFilterBuilder(value: unknown): value is HFilterBuilder {
		return !!(value as HFilterBuilder)?._isHFilterBuilder
	}

	/**
	 * Adds a does the tag exist condition.
	 *
	 * @param path The path.
	 * @returns The builder instance.
	 */
	public has(path: Path): this {
		this.add(this.toPath(path))
		return this
	}

	/**
	 * Adds an `and` statement.
	 *
	 * @returns The builder instance.
	 */
	public and(): this {
		this.add('and')
		return this
	}

	/**
	 * Adds an `or` statement.
	 *
	 * @returns The builder instance.
	 */
	public or(): this {
		this.add('or')
		return this
	}

	/**
	 * Adds a `not` statement.
	 *
	 * @param path The path to add.
	 * @returns The builder instance.
	 */
	public not(path: Path): this {
		this.add('not').add(this.toPath(path))
		return this
	}

	/**
	 * Adds an 'is a' statement.
	 *
	 * @param name The symbol name to use in the query.
	 * @returns The builder instance.
	 */
	public is(name: string | HSymbol): this {
		this.add(HSymbol.make(name).toZinc())
		return this
	}

	/**
	 * Add a relationship query.
	 *
	 * @param name The name of the relationship to query.
	 * @param term Optional relationship's term. An empty string
	 * can be used to skip this parameter.
	 * @param ref Optional target reference value.
	 * @returns The builder instance.
	 */
	public relationship(
		name: string | HSymbol,
		term?: string | HSymbol,
		ref?: string | HRef
	): this {
		let rel = HSymbol.make(name).value

		if (term) {
			rel += `-${HSymbol.make(term).value}`
		}

		rel += '?'

		if (ref) {
			rel += ` ${HRef.make(ref).toZinc()}`
		}

		this.add(rel)
		return this
	}

	/**
	 * Adds a starting parenthesis `(`
	 *
	 * @returns The builder instance.
	 */
	public startParens(): this {
		this.add('(')
		return this
	}

	/**
	 * Adds an ending parenthesis `)`
	 *
	 * @returns The builder instance.
	 */
	public endParens(): this {
		this.add(')')
		return this
	}

	/**
	 * Add a value equals comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public equals(path: Path, value: Value): this {
		return this.op('==', path, value)
	}

	/**
	 * Add a value not equals comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public notEquals(path: Path, value: Value): this {
		return this.op('!=', path, value)
	}

	/**
	 * Add a value less than comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public lessThan(path: Path, value: Value): this {
		return this.op('<', path, value)
	}

	/**
	 * Add a value less than or equal to comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public lessThanEquals(path: Path, value: Value): this {
		return this.op('<=', path, value)
	}

	/**
	 * Add a value greater than comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public greaterThan(path: Path, value: Value): this {
		return this.op('>', path, value)
	}

	/**
	 * Add a value greater than or equal to comparison.
	 *
	 * @param path The path to add.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	public greaterThanEquals(path: Path, value: Value): this {
		return this.op('>=', path, value)
	}

	/**
	 * Write the filter into this filter.
	 *
	 * @param filter The filter value to write.
	 * @returns The builder instance.
	 */
	public filter(filter: string | Node | HFilter | HFilterBuilder): this {
		let buf = ''

		if (typeof filter === 'string') {
			buf = filter
		} else if (HFilter.isHFilter(filter)) {
			buf = filter.toFilter()
		} else if (HFilterBuilder.isHFilterBuilder(filter)) {
			buf = filter.build()
		} else {
			buf = new HFilter(filter).toFilter()
		}

		return this.add(buf)
	}

	/**
	 * Return true if nothing has been written to the builder.
	 *
	 * @returns True if the internal buffer is empty.
	 */
	public isEmpty(): boolean {
		return this.buf.length === 0
	}

	/**
	 * Dump the current state of the filter builder to the console output.
	 *
	 * @returns The builder instance.
	 */
	public inspect(): this {
		console.log(this.buf)
		return this
	}

	/**
	 * The internal buffer used to build the haystack filter.
	 *
	 * Please note, this method is only intended for debugging/testing purposes.
	 */
	public get internalBuffer(): string {
		return this.buf
	}

	/**
	 * Add a comparison using an operator.
	 *
	 * @param op The operator.
	 * @param path The path.
	 * @param value The value.
	 * @returns The builder instance.
	 */
	private op(op: string, path: Path, value: Value): this {
		this.add(this.toPath(path)).add(op).add(this.toValue(value))
		return this
	}

	/**
	 * Add to the internal string buffer.
	 *
	 * @param str The string to add.
	 * @returns The builder instance.
	 */
	private add(str: string): this {
		const addSpace =
			this.buf && this.buf[this.buf.length - 1] !== '(' && str !== ')'

		this.buf += `${addSpace ? ' ' : ''}${str}`
		return this
	}

	/**
	 * Converts a path into a string.
	 *
	 * @param path The path to convert.
	 * @returns The converted path.
	 */
	private toPath(path: Path): string {
		return Array.isArray(path) ? path.join('->') : path
	}

	/**
	 * Returns an encoded filter value.
	 *
	 * @param value The value to encode.
	 * @returns The encoded value.
	 */
	private toValue(value: Value): string {
		if (value instanceof Date) {
			value = HDate.make(value)
		}
		return makeValue(value)?.toFilter() ?? ''
	}

	/**
	 * Validate and build the haystack filter.
	 *
	 * @returns The haystack filter.
	 * @throws An error if the haystack filter is invalid.
	 */
	public build(): string {
		// Validate the haystack filter.
		HFilter.parse(this.buf)
		return this.buf
	}
}

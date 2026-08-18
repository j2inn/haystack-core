/*
 * Copyright (c) 2026, J2 Innovations. All Rights Reserved
 */

import { HVal, valueIsKind } from '../core/HVal'
import { Kind } from '../core/Kind'
import { HDict } from '../core/dict/HDict'
import { HRef } from '../core/HRef'
import { HList } from '../core/list/HList'

/**
 * Adapts a `Subject` backing object so a haystack filter can be evaluated
 * against it without requiring it to be a real `HDict`/`HVal`.
 *
 * All methods are stateless (take the value being inspected as an argument)
 * so a single adapter instance can be reused for every dict being evaluated.
 */
export interface FilterAdapter<Subject = HDict> {
	/**
	 * Look up a named property on the subject.
	 *
	 * @param subject The subject to query.
	 * @param name The property name.
	 * @returns The raw property value or undefined/null if not found.
	 */
	get(subject: Subject, name: string): unknown

	/**
	 * Returns true if the raw value is of the specified kind.
	 *
	 * @param value The raw value to test.
	 * @param kind The kind to test for.
	 * @returns True if the value is of the specified kind.
	 */
	isKind(value: unknown, kind: Kind): boolean

	/**
	 * Narrow a raw dict-like value so path traversal can continue into it.
	 *
	 * @param value The raw value to narrow.
	 * @returns The value as a subject or undefined if it isn't dict-like.
	 */
	toDict(value: unknown): Subject | undefined

	/**
	 * Decode a raw ref-like value into a real `HRef` so it can be resolved.
	 *
	 * @param value The raw value to decode.
	 * @returns The decoded ref or undefined if it isn't ref-like.
	 */
	toRef(value: unknown): HRef | undefined

	/**
	 * Iterate the raw items in a list-like value.
	 *
	 * @param value The raw list-like value.
	 * @returns An iterable of the list's raw items.
	 */
	iterate(value: unknown): Iterable<unknown>

	/**
	 * Returns true if the raw value equals the filter literal.
	 *
	 * @param value The raw value.
	 * @param literal The haystack literal parsed from the filter.
	 * @returns True if the values are equal.
	 */
	equals(value: unknown, literal: HVal): boolean

	/**
	 * Compares the raw value against the filter literal.
	 *
	 * @param value The raw value.
	 * @param literal The haystack literal parsed from the filter.
	 * @returns The sort order as negative, 0, or positive.
	 */
	compareTo(value: unknown, literal: HVal): number
}

/**
 * The default filter adapter used when an `EvalContext` doesn't specify one.
 *
 * This replicates the behavior of evaluating a filter directly against real
 * `HDict`/`HVal` instances.
 */
export const DEFAULT_FILTER_ADAPTER: FilterAdapter<HDict> = {
	get(subject: HDict, name: string): unknown {
		return subject.get(name)
	},

	isKind(value: unknown, kind: Kind): boolean {
		return valueIsKind(value, kind)
	},

	toDict(value: unknown): HDict | undefined {
		return valueIsKind<HDict>(value, Kind.Dict) ? value : undefined
	},

	toRef(value: unknown): HRef | undefined {
		return valueIsKind<HRef>(value, Kind.Ref) ? value : undefined
	},

	iterate(value: unknown): Iterable<unknown> {
		return valueIsKind<HList>(value, Kind.List) ? value : []
	},

	equals(value: unknown, literal: HVal): boolean {
		return (value as HVal).equals(literal)
	},

	compareTo(value: unknown, literal: HVal): number {
		return (value as HVal).compareTo(literal)
	},
}

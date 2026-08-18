/*
 * Copyright (c) 2026, J2 Innovations. All Rights Reserved
 */

import { HVal } from '../core/HVal'
import { Kind } from '../core/Kind'
import { HRef } from '../core/HRef'
import { HaysonDict, HaysonRef, HaysonVal } from '../core/hayson'
import { getHaysonValueKind, makeValue } from '../core/util'
import { FilterAdapter } from './FilterAdapter'

/**
 * A reference `FilterAdapter` that evaluates a haystack filter directly
 * against raw Hayson JSON (i.e. the output of `HVal#toJSON()`), without
 * requiring the caller to wrap each dict in an `HDict`/`DictStore` first.
 *
 * Only the properties actually touched by a filter are ever decoded into a
 * real `HVal` (for equality/comparison); traversal itself is allocation free.
 */
export const HAYSON_FILTER_ADAPTER: FilterAdapter<HaysonDict> = {
	get(subject: HaysonDict, name: string): unknown {
		return subject[name]
	},

	isKind(value: unknown, kind: Kind): boolean {
		return getHaysonValueKind(value as HaysonVal) === kind
	},

	toDict(value: unknown): HaysonDict | undefined {
		return getHaysonValueKind(value as HaysonVal) === Kind.Dict
			? (value as HaysonDict)
			: undefined
	},

	toRef(value: unknown): HRef | undefined {
		return getHaysonValueKind(value as HaysonVal) === Kind.Ref
			? HRef.make(value as string | HaysonRef)
			: undefined
	},

	iterate(value: unknown): Iterable<unknown> {
		return Array.isArray(value) ? value : []
	},

	equals(value: unknown, literal: HVal): boolean {
		return !!makeValue(value as HaysonVal)?.equals(literal)
	},

	compareTo(value: unknown, literal: HVal): number {
		return makeValue(value as HaysonVal)?.compareTo(literal) ?? NaN
	},
}

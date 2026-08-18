/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HRef } from '../core/HRef'
import { HDict } from '../core/dict/HDict'
import { HNamespace } from '../core/HNamespace'
import { FilterAdapter } from './FilterAdapter'

export interface EvalContextResolve<Subject = HDict> {
	(ref: HRef): Subject | undefined
}

/**
 * The evaluation context.
 *
 * The context is queried during the evaluation of a node for property values.
 *
 * `Subject` defaults to `HDict` for backwards compatibility. A different
 * backing object can be used by supplying a matching `adapter`.
 */
export interface EvalContext<Subject = HDict> {
	/**
	 * The dict to evaluate the filter on.
	 */
	dict: Subject

	/**
	 * An optional method used to resolve a dict from a ref.
	 *
	 * If not defined, the reference will not be resolved.
	 *
	 * @param ref The ref to resolve.
	 * @returns The dict for the ref or undefined if not found.
	 */
	resolve?: EvalContextResolve<Subject>

	/**
	 * An optional namespace used for resolving def related queries.
	 *
	 * Def related queries (`isa` and relationship filters) require `dict`
	 * to be a real `HDict`. They will not match against any other subject.
	 */
	namespace?: HNamespace

	/**
	 * An optional adapter used to evaluate the filter against `dict` when
	 * it isn't a real `HDict`.
	 *
	 * If not defined, `dict` is assumed to be a real `HDict`.
	 */
	adapter?: FilterAdapter<Subject>
}

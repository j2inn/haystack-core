/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HNamespace } from '../core/HNamespace'
import { HDict } from '../core/dict/HDict'
import { HMarker } from '../core/HMarker'
import { HRef } from '../core/HRef'
import { HStr } from '../core/HStr'
import { HList } from '../core/list/HList'
import { valueIsKind } from '../core/HVal'
import { Kind } from '../core/Kind'
import { HFilterBuilder } from './HFilterBuilder'

/**
 * The tags used for display name relativization.
 */
const DISPLAY_TAGS = ['dis', 'name', 'tag', 'navName']

/**
 * The maximum depth of the containment hierarchy to traverse when relativizing a filter.
 *
 * This is a safeguard to prevent infinite loops in case of circular references.
 */
const CONTAINMENT_DEPTH = 10

/**
 * The display name to expand the display name tags when relativizing a filter.
 */
export const DISPLAY_NAME_RELATIVIZE_ON_ID = '{dis}'

/**
 * The kind of a point to expand when relativizing a filter.
 */
export const POINT_KIND_RELATIVIZE_ON_ID = '{kind}'

/**
 * The markers to expand the marker tags when relativizing a filter.
 */
export const MARKERS_RELATIVIZE_ON_ID = '{markers}'

/**
 * Relativization options.
 */
export interface RelativizeOptions {
	/**
	 * True (or undefined) if the relativization should be looked up on the record.
	 *
	 * A record can define a `relativizeOn` tag that is a list of tags that should
	 * be used for relativization. This is used to provide a hint on how relativation for a
	 * certain record is defined.
	 *
	 * The {dis} id can be used to add the first known display name tag on the record.
	 *
	 * The {kind} id can be used to add the kind tag when the record is a point.
	 *
	 * The {markers} id can be used to expand all marker tags on the record.
	 */
	useRelativizeOn?: boolean

	/**
	 * True (or undefined) if the display name should be used in the relative filter.
	 */
	useDisplayName?: boolean

	/**
	 * True (or undefined) if a point's kind should be used in the relative filter.
	 */
	useKind?: boolean

	/**
	 * True (or undefined) if the relative filter should use markers.
	 */
	useMarkers?: boolean

	/**
	 * The namespace to use for determining excluded tags.
	 */
	namespace?: HNamespace

	/**
	 * Optional function to determine the list of tags that should be excluded from the relative filter.
	 */
	getExcludedTags?: (namespace?: HNamespace) => string[]

	/**
	 * Optional prefix path.
	 */
	prefixPath?: string[]
}

export type RelativizeResolveFunc = (ref: HRef) => Promise<HDict | undefined>

export interface RelativizeForTargetOptions extends RelativizeOptions {
	/**
	 * An optional function used to resolve a dict for a reference.
	 */
	resolve?: RelativizeResolveFunc

	/**
	 * An optional cache used to cache requests for dicts.
	 *
	 * If multiple resolution calls are being made, this cache can be used
	 * between calls to avoid duplicate requests for the same reference.
	 */
	resolveCache?: Map<string, Promise<HDict | undefined>>

	/**
	 * True (or undefined) if intermediate records should be included in the relative filters.
	 */
	includeIntermediateRecords?: boolean

	/**
	 * True (or undefined) if the target record macro reference should be included in the relative filters.
	 */
	includeTargetMacro?: boolean

	/**
	 * True (or undefined) if other references on the target record should be automatically
	 * discovered and used as anchors when relativizing.
	 *
	 * The target's `id` is always tried first. If this is true, any other references on the
	 * target that aren't containment references (i.e. `siteRef`, `equipRef` etc) are then
	 * tried in turn. A record matches one of these anchors if it either...
	 *
	 * - Has the same reference value as the target (i.e. `cooRef == $cooRef`).
	 * - Is contained under the referenced record (i.e. `equipRef == $cooRef`).
	 *
	 * If a namespace is specified, it's used to determine the containment references to exclude.
	 *
	 * This is ignored if `targetRefNames` is specified.
	 */
	includeOtherRefs?: boolean

	/**
	 * An optional explicit priority list of reference names on the target to use as
	 * anchors for relativization (i.e. `['id', 'cooRef']`).
	 *
	 * When specified, this replaces automatic discovery and the names are used exactly
	 * as given. If `id` should be used, it must be included in the list. An empty list
	 * falls back to automatic discovery.
	 */
	targetRefNames?: string | string[]
}

/**
 * Make a relative haystack filter for a target record.
 *
 * The target record doesn't need to be the direct parent of the record. The record
 * must either be contained under the target or be reachable through one of the target's
 * anchor references (see `includeOtherRefs` and `targetRefNames`).
 *
 * @param target The target record to set the relative filter for.
 * @param record The child record to make the relative filter for.
 * @param options The options for relativizing the filter.
 * @returns A promise that resolves to the relative haystack filter.
 * @throws An error if the record can't be relativized to the target.
 */
export async function makeRelativeHaystackFilterForTarget(
	target: HDict,
	record: HDict,
	options?: RelativizeForTargetOptions
): Promise<string> {
	const anchorRefNames = getAnchorRefNames(target, options)

	let targetRefName = ''
	let dictPathInfo: DictPathInfo | undefined

	for (const refName of anchorRefNames) {
		dictPathInfo = await resolvePathForAnchor(
			target,
			refName,
			record,
			options
		)

		if (dictPathInfo) {
			targetRefName = refName
			break
		}
	}

	if (!dictPathInfo) {
		throw new Error(
			`Could not resolve relative path for target record using refs: ${anchorRefNames.join(
				', '
			)}`
		)
	}

	const includeTargetMacro = options?.includeTargetMacro ?? true
	const includeIntermediateRecords =
		options?.includeIntermediateRecords ?? true

	const { dicts, path } = dictPathInfo

	const builder = new HFilterBuilder()

	const prefix = includeTargetMacro
		? dictPathInfo.path.join('->') + ` == $${targetRefName} and `
		: ''

	for (let i = 0; i < dicts.length; ++i) {
		const dict = dicts[i]

		makeRelativeHaystackFilterUsingBuilder(builder, dict, {
			...options,
			prefixPath: path.slice(0, i),
		})

		if (i === 0 && !includeIntermediateRecords) {
			break
		}
	}

	return prefix + builder.build()
}

interface DictPathInfo {
	dicts: HDict[]
	path: string[]
}

/**
 * Return the ordered list of reference names on the target to use as anchors.
 */
function getAnchorRefNames(
	target: HDict,
	options?: RelativizeForTargetOptions
): string[] {
	const targetRefNames = [options?.targetRefNames ?? []]
		.flat()
		.filter((name) => !!name)

	// An explicit list replaces automatic discovery.
	if (targetRefNames.length) {
		return targetRefNames
	}

	// Automatic discovery always gives the target's id precedence.
	const includeOtherRefs = options?.includeOtherRefs ?? true

	return [
		'id',
		...(includeOtherRefs
			? extractRefNamesFromTarget(target, options?.namespace)
			: []),
	]
}

/**
 * Attempt to resolve a path from the record to the anchor reference on the target.
 */
async function resolvePathForAnchor(
	target: HDict,
	refName: string,
	record: HDict,
	options?: RelativizeForTargetOptions
): Promise<DictPathInfo | undefined> {
	const anchorRef = target.get(refName)

	if (!valueIsKind<HRef>(anchorRef, Kind.Ref)) {
		return undefined
	}

	// A record that shares the same reference as the target.
	if (refName !== 'id' && record.get<HRef>(refName)?.equals(anchorRef)) {
		return { dicts: [record], path: [refName] }
	}

	// A record that's contained under the referenced record.
	return resolveContainedPath(anchorRef, record, options)
}

/**
 * Follow the containment refs from the record until the anchor reference is found.
 */
async function resolveContainedPath(
	anchorRef: HRef,
	record: HDict,
	options?: RelativizeForTargetOptions
): Promise<DictPathInfo | undefined> {
	let dictPathInfo: DictPathInfo | undefined = undefined
	let currentRecord: HDict | undefined = record
	let count = 0

	while (currentRecord) {
		if (++count > CONTAINMENT_DEPTH) {
			throw new Error('Exceeded maximum containment depth')
		}

		// Find the parent node for this record.
		const parentRefTag = getParentRefTag(currentRecord)

		if (!parentRefTag) {
			return undefined
		}

		const parentRef = currentRecord.get<HRef>(parentRefTag) as HRef

		dictPathInfo ??= { dicts: [], path: [] }

		dictPathInfo.dicts.push(currentRecord)
		dictPathInfo.path.push(parentRefTag)

		// If we're found the target ref we can stop traversing up the tree.
		if (parentRef.equals(anchorRef)) {
			break
		}

		const parentDict = await resolveParentDict(parentRef, options)

		if (parentDict) {
			currentRecord = parentDict
		} else {
			return undefined
		}
	}

	return dictPathInfo
}

async function resolveParentDict(
	parentRef: HRef,
	options?: RelativizeForTargetOptions
): Promise<HDict | undefined> {
	const promise =
		options?.resolveCache?.get(parentRef.value) ??
		options?.resolve?.(parentRef)

	if (options?.resolveCache && promise !== undefined) {
		options.resolveCache.set(parentRef.value, promise)
	}

	return promise
}

function getParentRefTag(record: HDict): string | undefined {
	if (record.has('equipRef')) {
		return 'equipRef'
	}

	if (record.has('spaceRef')) {
		return 'spaceRef'
	}

	// Note: floorRef is deprecated but we still provide suport
	// for backwards compatibility.
	if (record.has('floorRef')) {
		return 'floorRef'
	}

	if (record.has('siteRef')) {
		return 'siteRef'
	}

	return undefined
}

const IGNORE_REF_NAMES = new Set([
	'id',
	'equipRef',
	'spaceRef',
	'floorRef',
	'siteRef',
])

/**
 * Return the names of the non-containment references on the target record.
 *
 * If a namespace is specified, any containment references it defines are also excluded.
 */
function extractRefNamesFromTarget(
	target: HDict,
	namespace?: HNamespace
): string[] {
	const containmentRefNames = new Set(
		namespace?.getContainmentRefs().map((def) => def.defName) ?? []
	)

	return target.keys.filter(
		(key) =>
			!IGNORE_REF_NAMES.has(key) &&
			!containmentRefNames.has(key) &&
			valueIsKind<HRef>(target.get(key), Kind.Ref)
	)
}

/**
 * Makes a relative haystack filter from a record.
 *
 * @param record The record.
 * @returns A haystack filter.
 */
export function makeRelativeHaystackFilter(
	record: HDict,
	options?: RelativizeOptions
): string {
	const builder = new HFilterBuilder()
	makeRelativeHaystackFilterUsingBuilder(builder, record, options)
	return builder.build()
}

export function makeRelativeHaystackFilterUsingBuilder(
	builder: HFilterBuilder,
	record: HDict,
	options?: RelativizeOptions
): void {
	const getExcludedTags =
		options?.getExcludedTags ?? getDefaultRelativizationExcludedTags

	const excludedTags = new Set(getExcludedTags(options?.namespace))

	const applyRelativizationTags = (tags: string[]) => {
		const expanded = tags.flatMap((tag) => {
			// Expand out selected ids to their corresponding tags.
			if (tag === DISPLAY_NAME_RELATIVIZE_ON_ID) {
				if (!(options?.useDisplayName ?? true)) {
					return []
				}
				for (const disTag of DISPLAY_TAGS) {
					if (record.has(disTag)) {
						return [disTag]
					}
				}
				return []
			} else if (tag === POINT_KIND_RELATIVIZE_ON_ID) {
				if (!(options?.useKind ?? true)) {
					return []
				}
				return record.has('point') && record.has('kind') ? ['kind'] : []
			} else if (tag === MARKERS_RELATIVIZE_ON_ID) {
				if (!(options?.useMarkers ?? true)) {
					return []
				}
				return record.keys.filter((key) =>
					valueIsKind<HMarker>(record.get(key), Kind.Marker)
				)
			}
			return tag
		})

		for (const tag of expanded) {
			addTagToFilter(
				tag,
				record,
				builder,
				excludedTags,
				options?.prefixPath
			)
		}
	}

	const { tags, fromRecord } = getRelativizationOnFromRecord(record, options)
	applyRelativizationTags(tags)

	// If the record provided a custom relativizeOn list but none of its tags
	// produced a filter match, fall back gently to the default behaviour
	// rather than jumping straight to the id.
	if (builder.isEmpty() && fromRecord) {
		applyRelativizationTags(getDefaultRelativizationOnTags(options))
	}

	if (builder.isEmpty() && record.has('id')) {
		addTagToFilter('id', record, builder, excludedTags, options?.prefixPath)
	}
}

function getRelativizationOnFromRecord(
	record: HDict,
	options?: RelativizeOptions
): { tags: string[]; fromRecord: boolean } {
	const useRelativizeOn = options?.useRelativizeOn ?? true

	if (useRelativizeOn) {
		const relativizeOnList = record.get<HList<HStr>>('relativizeOn')

		if (
			valueIsKind<HList<HStr>>(relativizeOnList, Kind.List) &&
			relativizeOnList.length > 0
		) {
			return {
				tags: relativizeOnList.values.map((v) => v.value),
				fromRecord: true,
			}
		}
	}

	return { tags: getDefaultRelativizationOnTags(options), fromRecord: false }
}

function getDefaultRelativizationOnTags(options?: RelativizeOptions): string[] {
	const defaultRelativizeOnTags: string[] = []

	const useDisplayName = options?.useDisplayName ?? true
	const useKind = options?.useKind ?? true
	const useMarkers = options?.useMarkers ?? true

	if (useDisplayName) {
		defaultRelativizeOnTags.push(DISPLAY_NAME_RELATIVIZE_ON_ID)
	}

	if (useKind) {
		defaultRelativizeOnTags.push(POINT_KIND_RELATIVIZE_ON_ID)
	}

	if (useMarkers) {
		defaultRelativizeOnTags.push(MARKERS_RELATIVIZE_ON_ID)
	}

	return defaultRelativizeOnTags
}

export function getDefaultRelativizationExcludedTags(
	namespace?: HNamespace
): string[] {
	const excludedTags = [
		'aux',
		'his',
		'hisCollectCOV',
		'hisCollectNA',
		'hisTotalized',
		'axStatus',
		'axAnnotated',
		'cur',
	]

	if (namespace) {
		const connectorPointTags = namespace
			.allSubTypesOf('connPoint')
			.map((def) => def.defName)

		excludedTags.push(...connectorPointTags)
	}

	return excludedTags
}

function addTagToFilter(
	tagName: string,
	record: HDict,
	builder: HFilterBuilder,
	excludedTags: Set<string>,
	prefixPath?: string[]
): boolean {
	if (excludedTags.has(tagName)) {
		return false
	}

	const addAnd = () => {
		if (!builder.isEmpty()) {
			builder.and()
		}
	}

	// Build the display name match.
	const value = record.get(tagName)
	if (value) {
		switch (value.getKind()) {
			case Kind.Marker:
				addAnd()
				builder.has(addPathPrefix(tagName, prefixPath))
				return true
			case Kind.Bool:
			case Kind.Ref:
			case Kind.Str:
			case Kind.Uri:
			case Kind.Number:
			case Kind.Date:
			case Kind.Time:
			case Kind.Symbol:
				addAnd()
				builder.equals(
					addPathPrefix(tagName, prefixPath),
					value as HRef | HStr
				)
				return true
			default:
				return false
		}
	}
	return false
}

function addPathPrefix(tag: string, prefixPath?: string[]): string | string[] {
	return prefixPath?.length ? [...prefixPath, tag] : tag
}

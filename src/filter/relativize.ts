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
 * Relativization options.
 */
export interface RelativizeOptions {
	/**
	 * True (or undefined) if the display name should be used in the relative filter.
	 */
	useDisplayName?: boolean

	/**
	 * True (or undefined) if a point's kind should be used in the relative filter.
	 */
	useKind?: boolean

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

	/**
	 * True (or undefined) if the relativization should be looked up on the record.
	 *
	 * A record can define a `relativizeOn` tag that is a list of tags that should
	 * be used for relativization. This is used to provide a hint on how relativation for a
	 * certain record is defined.
	 */
	useRelativizeOn?: boolean
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
}

/**
 * Make a relative haystack filter for a target record.
 *
 * The target record doesn't need to be the direct parent of
 * the record, but it must be an ancestor in the containment hierarchy.
 *
 * @param target The target record to set the relative filter for.
 * @param record The child record to make the relative filter for.
 * @param options The options for relativizing the filter.
 * @returns A promise that resolves to the relative haystack filter.
 */
export async function makeRelativeHaystackFilterForTarget(
	target: HDict,
	record: HDict,
	options?: RelativizeForTargetOptions
): Promise<string> {
	const dictPathInfo = await resolveDictPath(target, record, options)

	if (!dictPathInfo) {
		return ''
	}

	const includeTargetMacro = options?.includeTargetMacro ?? true
	const includeIntermediateRecords =
		options?.includeIntermediateRecords ?? true

	const { dicts, path } = dictPathInfo

	const builder = new HFilterBuilder()

	const prefix = includeTargetMacro
		? dictPathInfo.path.join('->') + ' == $id and '
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

async function resolveDictPath(
	target: HDict,
	record: HDict,
	options?: RelativizeForTargetOptions
): Promise<DictPathInfo> {
	// Follow the containment refs to build a tree of records
	// with the target as the root.
	const targetRef = target.get<HRef>('id')

	if (!targetRef) {
		throw new Error('Target record must have an id')
	}

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
			throw new Error(
				`Record ${
					currentRecord.get<HRef>('id')?.value
				} does not have a parent reference`
			)
		}

		const parentRef = currentRecord.get<HRef>(parentRefTag) as HRef

		if (!dictPathInfo) {
			dictPathInfo = { dicts: [], path: [] }
		}

		dictPathInfo.dicts.push(currentRecord)
		dictPathInfo.path.push(parentRefTag)

		// If we're found the target ref we can stop traversing up the tree.
		if (parentRef.equals(targetRef)) {
			break
		}

		const parentDict = await resolveParentDict(parentRef, options)

		if (parentDict) {
			currentRecord = parentDict
		} else {
			throw new Error(
				`Could not resolve parent record for ref ${parentRef.value}`
			)
		}
	}

	if (!dictPathInfo) {
		throw new Error('Could not find a path to the target record')
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
	const useDisplayName = options?.useDisplayName ?? true
	const useKind = options?.useKind ?? true

	const getExcludedTags =
		options?.getExcludedTags ?? getDefaultRelativizationExcludedTags

	const excludedTags = new Set(getExcludedTags(options?.namespace))

	// If the record has a relativizeOn tag, use that to build the filter
	// instead of the default defined here.
	if (addRelativizeOnToFilter(builder, record, excludedTags, options)) {
		return
	}

	for (const { name, value } of record) {
		if (valueIsKind<HMarker>(value, Kind.Marker)) {
			addTagToFilter(
				name,
				record,
				builder,
				excludedTags,
				options?.prefixPath
			)
		}
	}

	if (useDisplayName) {
		for (const tag of DISPLAY_TAGS) {
			if (
				addTagToFilter(
					tag,
					record,
					builder,
					excludedTags,
					options?.prefixPath
				)
			) {
				break
			}
		}
	}

	if (useKind && record.has('point') && record.has('kind')) {
		addTagToFilter(
			'kind',
			record,
			builder,
			excludedTags,
			options?.prefixPath
		)
	}

	if (builder.isEmpty() && record.has('id')) {
		addTagToFilter('id', record, builder, excludedTags, options?.prefixPath)
	}
}

function addRelativizeOnToFilter(
	builder: HFilterBuilder,
	record: HDict,
	excludedTags: Set<string>,
	options?: RelativizeOptions
): boolean {
	let added = false

	const useRelativizeOn = options?.useRelativizeOn ?? true

	if (useRelativizeOn) {
		const relativizeOn = record.get<HList<HStr>>('relativizeOn')

		if (valueIsKind<HList<HStr>>(relativizeOn, Kind.List)) {
			for (const tag of relativizeOn) {
				if (
					addTagToFilter(
						tag.value,
						record,
						builder,
						excludedTags,
						options?.prefixPath
					)
				) {
					added = true
				}
			}
		}
	}

	return added
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
					value as HStr
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

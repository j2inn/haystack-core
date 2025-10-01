/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HNamespace } from '../core/HNamespace'
import { HDict } from '../core/dict/HDict'
import { HMarker } from '../core/HMarker'
import { HRef } from '../core/HRef'
import { HStr } from '../core/HStr'
import { valueIsKind } from '../core/HVal'
import { Kind } from '../core/Kind'
import { HFilterBuilder } from '../filter/HFilterBuilder'

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
	const useDisplayName = options?.useDisplayName ?? true
	const useKind = options?.useKind ?? true
	const getExcludedTags =
		options?.getExcludedTags ?? getDefaultRelativizationExcludedTags
	const excludedTags = new Set(getExcludedTags(options?.namespace))

	const builder = new HFilterBuilder()

	// Build the marker tags.
	for (const { name, value } of record) {
		if (
			valueIsKind<HMarker>(value, Kind.Marker) &&
			!excludedTags.has(name)
		) {
			if (!builder.isEmpty()) {
				builder.and()
			}

			builder.has(name)
		}
	}

	if (useDisplayName) {
		// Build the display name match if one is available.
		if (!addDisplayNameToFilter(record, builder, 'dis')) {
			if (!addDisplayNameToFilter(record, builder, 'name')) {
				if (!addDisplayNameToFilter(record, builder, 'tag')) {
					addDisplayNameToFilter(record, builder, 'navName')
				}
			}
		}
	}

	if (useKind && record.has('point') && record.has('kind')) {
		addPointKindToFilter(record, builder)
	}

	if (builder.isEmpty() && record.has('id')) {
		builder.equals('id', record.get('id') as HRef)
	}

	return builder.build()
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

function addPointKindToFilter(record: HDict, builder: HFilterBuilder): void {
	const kind = record.get<HStr>('kind')?.value
	if (kind) {
		if (!builder.isEmpty()) {
			builder.and()
		}
		builder.equals('kind', kind)
	}
}

function addDisplayNameToFilter(
	record: HDict,
	builder: HFilterBuilder,
	tagName: string
): boolean {
	// Build the display name match.
	const name = record.get<HStr>(tagName)?.value
	if (name) {
		if (!builder.isEmpty()) {
			builder.and()
		}

		builder.equals(tagName, name)
		return true
	}
	return false
}

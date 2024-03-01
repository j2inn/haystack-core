/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/**
 * Haystack core methods
 *
 * @module
 */

import { Kind } from './Kind'
import { HVal, isHVal, OptionalHVal, valueIsKind } from './HVal'
import { HBool } from './HBool'
import { HDate } from './HDate'
import { HNum } from './HNum'
import { HRef } from './HRef'
import { HStr } from './HStr'
import { HTime } from './HTime'
import { HUri } from './HUri'
import { HDict } from './HDict'
import {
	HaysonDict,
	HaysonVal,
	HaysonCoord,
	HaysonXStr,
	HaysonDate,
	HaysonDateTime,
	HaysonNum,
	HaysonSymbol,
	HaysonTime,
	HaysonUri,
	HaysonList,
	HaysonGrid,
	HaysonRef,
} from './hayson'
import { HDateTime } from './HDateTime'
import { HMarker } from './HMarker'
import { HRemove } from './HRemove'
import { HNa } from './HNa'
import { HCoord } from './HCoord'
import { HXStr } from './HXStr'
import { HSymbol } from './HSymbol'
import { HList } from './HList'
import { HGrid } from './HGrid'
import { Scanner } from '../util/Scanner'

/**
 * Make the haystack value based on the supplied data.
 *
 * @param options.value The JS value.
 * @param options.kind The kind of value.
 * @param options.unit Any units.
 * @param options.type Any type information for an xstring.
 * @returns The haystack value or null.
 */
export function makeValue(val: HaysonVal | HVal | undefined): OptionalHVal {
	if (val === null || val === undefined) {
		return null
	}

	if (isHVal(val)) {
		return val as HVal
	}

	switch (typeof val) {
		case 'string':
			return HStr.make(val as string)
		case 'number':
			return HNum.make(val as number)
		case 'boolean':
			return HBool.make(val as boolean)
	}

	if (!val) {
		throw new Error('Invalid value')
	}

	if (Array.isArray(val)) {
		return HList.make(val as HaysonList)
	}

	const obj = val as { _kind?: string }

	// Support new and old Hayson for decoding values.
	switch (toKind(obj._kind ?? '')) {
		case Kind.Marker:
			return HMarker.make()
		case Kind.Remove:
			return HRemove.make()
		case Kind.NA:
			return HNa.make()
		case Kind.Coord:
			return HCoord.make(obj as HaysonCoord)
		case Kind.XStr:
		case Kind.Bin:
			return HXStr.make(obj as HaysonXStr)
		case Kind.Date:
			return HDate.make(obj as HaysonDate)
		case Kind.DateTime:
			return HDateTime.make(obj as HaysonDateTime)
		case Kind.Number:
			return HNum.make(obj as HaysonNum)
		case Kind.Ref:
			return HRef.make(obj as HaysonRef)
		case Kind.Symbol:
			return HSymbol.make(obj as HaysonSymbol)
		case Kind.Time:
			return HTime.make(obj as HaysonTime)
		case Kind.Uri:
			return HUri.make(obj as HaysonUri)
		case Kind.Dict:
		case undefined:
			return HDict.make(obj as HaysonDict)
		case Kind.Grid:
			return HGrid.make(obj as HaysonGrid)
		default:
			throw new Error('Could not resolve value from kind: ' + obj._kind)
	}
}

/**
 * Convert the kind enumeration to a real haystack kind.
 *
 * @param kind The kind string.
 * @returns The kind or undefined if the kind can't be found.
 */
export function toKind(kind: string): Kind | undefined {
	switch (kind) {
		case 'Marker':
		case Kind.Marker:
			return Kind.Marker
		case 'Remove':
		case Kind.Remove:
			return Kind.Remove
		case 'NA':
		case Kind.NA:
			return Kind.NA
		case 'Coord':
		case Kind.Coord:
			return Kind.Coord
		case 'XStr':
		case Kind.XStr:
			return Kind.XStr
		case 'Bin':
		case Kind.Bin:
			return Kind.Bin
		case 'Date':
		case Kind.Date:
			return Kind.Date
		case 'DateTime':
		case Kind.DateTime:
			return Kind.DateTime
		case 'Number':
		case Kind.Number:
			return Kind.Number
		case 'Ref':
		case Kind.Ref:
			return Kind.Ref
		case 'Symbol':
		case Kind.Symbol:
			return Kind.Symbol
		case 'Time':
		case Kind.Time:
			return Kind.Time
		case 'Uri':
		case Kind.Uri:
			return Kind.Uri
		case 'Dict':
		case Kind.Dict:
			return Kind.Dict
		case 'Grid':
		case Kind.Grid:
			return Kind.Grid
		case 'Str':
		case Kind.Str:
			return Kind.Str
		case 'List':
		case Kind.List:
			return Kind.List
		case 'Bool':
		case Kind.Bool:
			return Kind.Bool
		default:
			return undefined
	}
}

/**
 * Returns a default haystack value for the kind.
 *
 * @param kind The haystack data type's kind.
 * @returns The default haystack value or undefined if one cannot be created.
 */
export function makeDefaultValue(kind: Kind): HVal | undefined {
	let value: HVal | undefined

	switch (kind) {
		case Kind.Str:
			value = HStr.make('')
			break
		case Kind.Number:
			value = HNum.make(0)
			break
		case Kind.Date:
			value = HDate.now()
			break
		case Kind.Time:
			value = HTime.now()
			break
		case Kind.Uri:
			value = HUri.make('')
			break
		case Kind.Ref:
			value = HRef.make('')
			break
		case Kind.Bool:
			value = HBool.make(true)
			break
		case Kind.Dict:
			value = HDict.make()
			break
		case Kind.DateTime:
			value = HDateTime.now()
			break
		case Kind.Marker:
			value = HMarker.make()
			break
		case Kind.Remove:
			value = HRemove.make()
			break
		case Kind.NA:
			value = HNa.make()
			break
		case Kind.Coord:
			value = HCoord.make({ latitude: 0, longitude: 0 })
			break
		case Kind.XStr:
		case Kind.Bin:
			value = HXStr.make('')
			break
		case Kind.Symbol:
			value = HSymbol.make('')
			break
		case Kind.List:
			value = HList.make()
			break
		case Kind.Grid:
			value = HGrid.make()
			break
	}

	return value
}

/**
 * Return a valid tag name from the input string.
 *
 * A valid tag name has to match...
 * ```
 * <alphaLo> (<alphaLo> | <alphaHi> | <digit> | '_')*
 * ```
 *
 * For more information regarding grammar please see https://project-haystack.org/doc/Zinc
 *
 * @param name The name to convert.
 * @returns A name to convert into a tag.
 */
export function toTagName(name: string): string {
	name = String(name) || ''

	// If already valid, just return it.
	if (isValidTagName(name)) {
		return name
	}

	// Replace `.`, `-` or `/` with an underscore.
	name = name.replace(/[.\-\/]/gi, (_, i) => {
		// If the tag name is the first letter then just return a v.
		if (!i) {
			return 'v'
		}

		// Return nothing if this is the last character in a string.
		return i !== name.length - 1 ? '_' : ''
	})

	// If the string starts with a number or underscore then add a `v` prefix.
	name = name.replace(/^[0-9_]/, (c) => `v${c}`)

	// Remove any invalid characters from the string.
	name = name.replace(/[^a-z0-9_ ]/gi, '').trim()

	const parts = name.split(' ')

	// Convert a from a sentance into a camel case string.
	// Ensure the first character is a lower case letter.
	return (
		parts
			.filter((part: string): boolean => part.trim().length > 0)
			.map((part: string, index: number): string => {
				const start = part[0]
				if (index === 0) {
					// The start of a tag can only be a lower case letter (a-z).
					if (Scanner.isUpperCase(start)) {
						let newPart = ''

						let capsPrefix = true
						for (const ch of part) {
							if (capsPrefix && Scanner.isUpperCase(ch)) {
								newPart += ch.toLowerCase()
							} else {
								capsPrefix = false
								newPart += ch
							}
						}

						part = newPart
					}
				} else if (
					Scanner.isLetter(start) &&
					Scanner.isLowerCase(start)
				) {
					// Anything after the first space needs to be converted to camel case.
					// Therefore the first letter needs to be upper case.
					part = part.substring(1, part.length)
					part = start.toUpperCase() + part
				}

				return part
			})
			.join('') || 'empty'
	)
}

/**
 * Test to see if the name is a valid tag name.
 *
 * A valid tag name has to match...
 * ```
 * <alphaLo> (<alphaLo> | <alphaHi> | <digit> | '_')*
 * ```
 *
 * For more information regarding grammar please see https://project-haystack.org/doc/Zinc
 *
 * @param name The name to test.
 * @returns True if the tag name is valid.
 */
export function isValidTagName(name: string): boolean {
	return /^[a-z][a-zA-Z0-9_]*$/.test(String(name))
}

/**
 * The implied by tag name.
 */
export const IMPLIED_BY = 'impliedBy'

/**
 * A function used for accessing localized display strings.
 *
 * Return undefined if the translated value can't be found.
 *
 * @param pod The pod/library name.
 * @param key The key.
 * @returns The translated value or undefined if it can't be found.
 */
export interface LocalizedCallback {
	(pod: string, key: string): string | undefined
}

/**
 * Return a display string from the dict (or function)...
 *
 * 1. 'dis' tag.
 * 2. 'disMacro' tag returns macro using dict as scope.
 * 3. 'disKey' maps to qname locale key.
 * 4. 'name' tag.
 * 5. 'tag' tag.
 * 6. 'navName' tag.
 * 6. 'id' tag.
 * 7. default
 *
 * If a short name is specified, resolving `disMacro` is given
 * lower precedence.
 *
 * @see {@link HDict.toDis}
 * @see {@link macro}
 * @see {@link disKey}
 *
 * @param dict The dict to use.
 * @param def Optional default fallback value.
 * @param i18n Optional localization callback.
 * @param short Optional flag to shorten the display name.
 * @return The display string value.
 */
export function dictToDis(
	dict: HDict,
	def?: string,
	i18n?: LocalizedCallback,
	short?: boolean
): string {
	let val = dict.get('dis')
	if (isHVal(val)) {
		return val.toString()
	}

	const runMacro = (val: HVal) =>
		macro(val.toString(), (val) => dict.get(val), i18n)

	// If we're wanting a short display name then try other
	// display names first.
	if (!short) {
		val = dict.get('disMacro')
		if (isHVal(val)) {
			return runMacro(val)
		}
	}

	val = dict.get('disKey')
	if (isHVal(val)) {
		return i18n
			? disKey(val.toString(), i18n) ?? val.toString()
			: val.toString()
	}

	val = dict.get('name')
	if (isHVal(val)) {
		return val.toString()
	}

	val = dict.get('def')
	if (isHVal(val)) {
		return val.toString()
	}

	val = dict.get('tag')
	if (isHVal(val)) {
		return val.toString()
	}

	val = dict.get('navName')
	if (isHVal(val)) {
		return val.toString()
	}

	// If by this point we don't have a short display name
	// then fallback to running the macro as a last resort.
	if (short) {
		val = dict.get('disMacro')
		if (isHVal(val)) {
			return runMacro(val)
		}
	}

	val = dict.get('id')
	if (valueIsKind<HRef>(val, Kind.Ref)) {
		return val.dis
	}

	return def ?? ''
}

/**
 * Process a macro pattern with the given scope of variable name/value pairs.
 * The pattern is a unicode string with embedded expressions:
 * * '$tag': resolve tag name from scope, variable name ends with first non-tag character.
 * * '${tag}': resolve tag name from scope.
 * * '$<pod::key> localization key.
 *
 * Any variables which cannot be resolved in the scope are returned as-is (i.e. $name) in
 * the result string.
 *
 * If a tag resolves to Ref, then we use Ref.dis for the string.
 *
 * @see {@link dictToDis}
 *
 * @param pattern The pattern to process.
 * @param getValue Gets a value based on a name (returns undefined if not found).
 * @param i18n Optional localization callback.
 * @returns The processed output string.
 */
export function macro(
	pattern: string,
	getValue: (key: string) => HVal | undefined,
	i18n?: LocalizedCallback
): string {
	const replacer = (match: string, key: string): string => {
		const val = getValue(key)

		if (valueIsKind<HRef>(val, Kind.Ref)) {
			return val.dis
		}

		return val?.toString() ?? match
	}

	// Replace $tag
	let result = pattern.replace(/\$([a-z][a-zA-Z0-9_]+)/g, replacer)

	// Replace ${tag}
	result = result.replace(/\${([a-z][a-zA-Z0-9_]+)}/g, replacer)

	if (i18n) {
		// Replace $<pod::key>
		result = result.replace(
			/\$<([^>]+)>/g,
			(match: string, key: string): string => disKey(key, i18n) ?? match
		)
	}

	return result.trim()
}

/**
 * Map a display key to a localized string.
 *
 * @see {@link dictToDis}
 *
 * @param key The display key.
 * @param i18n Localization callback.
 * @returns The value or undefined if the value can't be found.
 */
export function disKey(
	key: string,
	i18n: LocalizedCallback
): string | undefined {
	const [, pod, disKey] = /^([^:]+)::([^:]+)$/.exec(key.trim()) ?? []
	return pod && disKey ? i18n(pod, disKey) : undefined
}

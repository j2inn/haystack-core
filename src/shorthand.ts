/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import {
	HaysonCoord,
	HaysonDate,
	HaysonDateTime,
	HaysonDict,
	HaysonGrid,
	HaysonList,
	HaysonNum,
	HaysonRef,
	HaysonSymbol,
	HaysonTime,
	HaysonUri,
	HaysonVal,
	HaysonXStr,
} from './core/hayson'
import { HBool } from './core/HBool'
import { CoordObj, HCoord } from './core/HCoord'
import { DateObj, HDate } from './core/HDate'
import { HDateTime } from './core/HDateTime'
import { HDict } from './core/dict/HDict'
import { DictStore } from './core/dict/DictStore'
import { HGrid } from './core/HGrid'
import { HList } from './core/HList'
import { HMarker } from './core/HMarker'
import { HNa } from './core/HNa'
import { HNamespace } from './core/HNamespace'
import { HNum } from './core/HNum'
import { HRef } from './core/HRef'
import { HRemove } from './core/HRemove'
import { HStr } from './core/HStr'
import { HSymbol } from './core/HSymbol'
import { HTime, TimeObj } from './core/HTime'
import { HUri } from './core/HUri'
import { HVal, OptionalHVal } from './core/HVal'
import { HXStr } from './core/HXStr'
import { TrioReader } from './core/TrioReader'
import { ZincReader } from './core/ZincReader'

import { HUnit } from './core/HUnit'
import { isValidTagName, makeValue, toTagName } from './core/util'

/**
 * Core Haystack utility shorthand functions.
 *
 * These functions are a facade around the underlying APIs
 * in order to provide a easier to use API for creating haystack value types
 * and reading data.
 *
 * @module
 */

export function bool(bool: boolean | HBool): HBool {
	return HBool.make(bool)
}

export const TRUE = HBool.make(true)
export const FALSE = HBool.make(false)

export function coord(value: CoordObj | HaysonCoord | HCoord): HCoord {
	return HCoord.make(value)
}

export function date(
	value: string | Date | DateObj | HaysonDate | HDate
): HDate {
	return HDate.make(value)
}

export function dateTime(
	value: string | Date | HaysonDateTime | HDateTime
): HDateTime {
	return HDateTime.make(value)
}

export function symbol(value: string | HaysonSymbol | HSymbol): HSymbol {
	return HSymbol.make(value)
}

export function dict(
	values?:
		| { [prop: string]: OptionalHVal | HaysonVal }
		| OptionalHVal
		| DictStore
): HDict {
	return HDict.make(values)
}

export function grid(
	values: HaysonGrid | HVal | (HaysonDict | HDict)[]
): HGrid {
	return HGrid.make(values)
}

export function list<Value extends OptionalHVal = OptionalHVal>(
	...values: (Value | HaysonVal | (Value | HaysonVal)[] | HaysonList)[]
): HList<Value> {
	return HList.make(...values)
}

export const MARKER = HMarker.make()

export const NA = HNa.make()

export const REMOVE = HRemove.make()

export function num(value: number | HaysonNum | HNum, unit?: string): HNum {
	return HNum.make(value, unit)
}

export function ref(
	value: string | HaysonRef | HRef | HStr,
	displayName?: string
): HRef {
	return HRef.make(value, displayName)
}

export function str(value: string | HStr): HStr {
	return HStr.make(value)
}

export function time(
	value: string | Date | TimeObj | HaysonTime | HTime
): HTime {
	return HTime.make(value)
}

export function uri(value: string | HaysonUri | HUri): HUri {
	return HUri.make(value)
}

export function xstr(type: string | HaysonXStr | HXStr, value?: string): HXStr {
	return HXStr.make(type, value)
}

export function zinc(input: string): OptionalHVal | undefined {
	return ZincReader.readValue(input)
}

export function trio(input: string): HGrid | undefined {
	return TrioReader.readGrid(input)
}

export function make(value: HaysonVal | HVal | undefined): OptionalHVal {
	return makeValue(value)
}

export function tagName(name: string): string {
	return toTagName(name)
}

export function isTagName(name: string): boolean {
	return isValidTagName(name)
}

export function defs(grid: HGrid): HNamespace {
	return new HNamespace(grid)
}

export function unit(id: string): HUnit | undefined {
	return HUnit.get(id)
}

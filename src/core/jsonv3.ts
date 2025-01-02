/*
 * Copyright (c) 2023, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-empty-interface: "off" */

/**
 * Haystack version 3 JSON format types.
 *
 * As described in https://project-haystack.org/doc/docHaystack/Json
 *
 * Please note, this has been supplanted by the newer `Hayson` JSON format...
 *
 * https://bitbucket.org/finproducts/hayson/src/master/
 *
 * @module
 */

export type JsonV3Num = `n:${string}`
export type JsonV3Marker = 'm:'
export type JsonV3Na = 'z:'
export type JsonV3Remove = '-:'
export type JsonV3Ref = `r:${string}`
export type JsonV3Uri = `u:${string}`
export type JsonV3Symbol = `y:${string}`
export type JsonV3Time = `h:${string}`
export type JsonV3Date = `d:${string}`
export type JsonV3DateTime = `t:${string}`
export type JsonV3Coord = `c:${string}`
export type JsonV3XStr = `x:${string}`

export type JsonV3Val =
	| boolean
	| string
	| JsonV3Num
	| JsonV3Ref
	| JsonV3Time
	| JsonV3Date
	| JsonV3Uri
	| JsonV3DateTime
	| JsonV3Symbol
	| JsonV3Coord
	| JsonV3XStr
	| JsonV3List
	| JsonV3Dict
	| JsonV3Grid
	| JsonV3Marker
	| JsonV3Na
	| JsonV3Remove
	| null

export type JsonV3List = Array<JsonV3Val>

export interface JsonV3Dict {
	[prop: string]: JsonV3Val
}

export interface JsonV3Grid {
	meta?: JsonV3Dict
	cols?: { name: string; [prop: string]: JsonV3Val }[]
	rows?: JsonV3Dict[]
}

/**
 * The MIME type for the older Haystack version 3 JSON.
 */
export const JSON_V3_MIME_TYPE = 'application/vnd.haystack+json;version=3'

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HaysonDict } from '../hayson'
import { OptionalHVal } from '../HVal'

/**
 * An object composed of haystack values.
 */
export type HValObj = Record<string, OptionalHVal>

/**
 * Converts a haystack value object to a JSON object.
 *
 * @param hvals The haystack value object.
 * @returns A hayson dict.
 */
export function hvalObjToJson(hvals: HValObj): HaysonDict {
	const obj: HaysonDict = {}

	for (const name of Object.keys(hvals)) {
		obj[name] = hvals[name]?.toJSON() ?? null
	}

	return obj
}

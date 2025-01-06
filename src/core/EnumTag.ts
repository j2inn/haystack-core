/*
 * Copyright (c) 2024, J2 Innovations. All Rights Reserved
 */

import { HBool } from './HBool'
import { HDict } from './dict/HDict'
import { HGrid } from './HGrid'
import { HNum } from './HNum'
import { HStr } from './HStr'
import { valueIsKind } from './HVal'
import { Kind } from './Kind'
import { ZincReader } from './ZincReader'

function toGrid(value: unknown): HGrid | undefined {
	if (valueIsKind<HGrid>(value, Kind.Grid)) {
		return value
	}

	try {
		const hval = ZincReader.readValue(String(value))
		return valueIsKind<HGrid>(hval, Kind.Grid) ? hval : undefined
	} catch {
		return undefined
	}
}

function toString(value: string | HStr): string {
	return String(value)
}

function toBool(value: boolean | HBool): boolean {
	return typeof value === 'boolean' ? value : value.value
}

function toNum(value: number | HNum): number {
	return typeof value === 'number' ? value : value.value
}

/**
 * Enumerated tag support.
 *
 * Handles `enumMeta` code mappings.
 *
 * Enumerations in haystack don't have a first class mapping. There is no `enum` kind. Instead an enumerated
 * point its kind tag set to `Str` with an additional `enum` tag that defines the enumerations to use.
 * The string is comma separated and each enum should be a valid tag name.
 *
 * The `enumMeta` record is a record that should be considered a singleton. This is used to reference
 * enumerations that could be used on points and other parts of the system.
 */
export class EnumTag {
	readonly trueName?: string
	readonly falseName?: string

	readonly #nameToCodeMap = new Map<string, number>()
	readonly #codeToNameMap = new Map<number, string>()

	/**
	 * Constructs a new enum tag.
	 *
	 * @param data A comma separated string of enumerations, enum grid or enum name to code object.
	 */
	constructor(
		data: string | HStr | HGrid | Record<string, number | number[]>
	) {
		let trueName: string | undefined
		let falseName: string | undefined

		const addEnumEntry = (name: string, code: number): void => {
			if (!trueName && code) {
				trueName = name
			}
			if (!falseName && !code) {
				falseName = name
			}

			if (!this.#nameToCodeMap.has(name)) {
				this.#nameToCodeMap.set(name, code)
			}
			if (!this.#codeToNameMap.has(code)) {
				this.#codeToNameMap.set(code, name)
			}
		}

		if (typeof data === 'string' || valueIsKind<HStr>(data, Kind.Str)) {
			String(data)
				.split(',')
				.forEach((name, code) => {
					if (name) {
						addEnumEntry(name, code)
					}
				})
		} else if (valueIsKind<HGrid>(data, Kind.Grid)) {
			data.getRows().forEach((row, i) => {
				const name = row.get<HStr>('name')?.value

				if (name) {
					addEnumEntry(name, row.get<HNum>('code')?.value ?? i)
				}
			})
		} else {
			Object.keys(data).forEach((name) => {
				const code = data[name]

				if (typeof name === 'string') {
					if (typeof code === 'number') {
						addEnumEntry(name, code)
					} else if (Array.isArray(code)) {
						for (const c of code) {
							if (typeof c === 'number') {
								addEnumEntry(name, c)
							}
						}
					}
				}
			})
		}

		this.trueName = trueName
		this.falseName = falseName
	}

	/**
	 * Convert a name to a code.
	 *
	 * @param name The enumeration name.
	 * @returns The code for the enumeration or undefined if not found.
	 */
	nameToCode(name: string | HStr): number | undefined {
		return this.#nameToCodeMap.get(toString(name))
	}

	/**
	 * Convert a code to a name.
	 *
	 * @param code The enumeration code.
	 * @returns The enumeration name or undefined if not found.
	 */
	codeToName(code: number | HNum): string | undefined {
		return this.#codeToNameMap.get(toNum(code))
	}

	/**
	 * Convert a name to a boolean value.
	 *
	 * @param name The name to convert.
	 * @returns The boolean value or undefined if not found.
	 */
	nameToBool(name: string | HStr): boolean | undefined {
		const code = this.#nameToCodeMap.get(toString(name))
		return code === undefined ? undefined : !!code
	}

	/**
	 * Converts a boolean value to a name.
	 *
	 * @param value The boolean value to convert.
	 * @returns The name or undefined if not found.
	 */
	boolToName(value: boolean | HBool): string | undefined {
		return toBool(value) ? this.trueName : this.falseName
	}

	/**
	 * @returns The number of enumerated entries.
	 */
	get size(): number {
		return this.#nameToCodeMap.size
	}

	/**
	 * @returns The enumerated names.
	 */
	get names(): string[] {
		return [...this.#nameToCodeMap.keys()]
	}

	/**
	 * @returns encode the enumerations to a string.
	 */
	encodeToString(): string {
		const values: string[] = []

		// Please note, this doesn't encode everything. For instance,
		// enumerations that share a common index.
		for (const [name, code] of this.#nameToCodeMap) {
			values[code] = name
		}

		return values.map((v) => v ?? '').join(',')
	}

	/**
	 * @returns encode the enumerations to a grid.
	 */
	encodeToGrid(): HGrid {
		const rows: HDict[] = []

		const obj = this.encodeToObject()

		for (const name of Object.keys(obj)) {
			const codes = obj[name]

			if (codes) {
				for (const code of codes) {
					rows.push(
						new HDict({
							name,
							code,
						})
					)
				}
			}
		}

		return new HGrid(rows)
	}

	/**
	 * @returns encodes the enumerations to an object.
	 */
	encodeToObject(): Record<string, number[]> {
		const obj: Record<string, number[]> = {}

		// Try name to code first.
		for (const name of this.#nameToCodeMap.keys()) {
			const code = this.nameToCode(name)

			if (code !== undefined) {
				obj[name] = [code]
			}
		}

		// Try codes to name so we have everything.
		for (const code of this.#codeToNameMap.keys()) {
			const name = this.codeToName(code)

			if (name !== undefined) {
				let codes = obj[name]

				if (!codes) {
					obj[name] = codes = []
				}

				if (!codes.includes(code)) {
					codes.push(code)
				}
			}
		}

		return obj
	}

	/**
	 * Encodes the enum tags into an enum meta dict.
	 *
	 * @param enumTags The enum tags to encode.
	 * @returns The encoded enum meta record.
	 */
	static encodeToEnumMetaDict(enumTags: Record<string, EnumTag>): HDict {
		const enumMeta = new HDict()

		for (const name of Object.keys(enumTags)) {
			const enumTag = enumTags[name]

			if (enumTag) {
				const grid = enumTag.encodeToGrid()

				if (!grid.isEmpty()) {
					enumMeta.set(name, grid.toZinc())
				}
			}
		}

		return enumMeta
	}

	/**
	 * Decodes the enum meta record into some enum tags.
	 *
	 * @param dict The `enumMeta` dict to decode.
	 * @returns The decoded enum tag information.
	 */
	static decodeFromEnumMetaDict(dict: HDict): Record<string, EnumTag> {
		const enumTags: Record<string, EnumTag> = {}

		for (const { name, value } of dict) {
			const grid = toGrid(value)

			if (grid) {
				enumTags[name] = new EnumTag(grid)
			}
		}

		return enumTags
	}
}

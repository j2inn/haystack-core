/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { Kind } from './Kind'
import {
	HVal,
	CANNOT_CHANGE_READONLY_VALUE,
	valueInspect,
	valueIsKind,
	valueMatches,
} from './HVal'
import { HaysonUri } from './hayson'
import { Node } from '../filter/Node'
import { HGrid } from './grid/HGrid'
import { HList } from './HList'
import { HDict } from './dict/HDict'
import { EvalContext } from '../filter/EvalContext'
import { memoize } from '../util/memoize'
import { JsonV3Uri } from './jsonv3'

const HTTP_SCHEME = 'http'
const HTTP_PORT = 80

const HTTPS_SCHEME = 'https'
const HTTPS_PORT = 443

/**
 * The result of parsing a URI.
 */
interface UriData {
	scheme: string
	hostname: string
	port: number
	pathname: string
	query: string
	hash: string
}

/**
 * Haystack URI.
 */
export class HUri implements HVal {
	/**
	 * The URI value.
	 */
	readonly #value: string

	/**
	 * Constructs a new haystack URI.
	 *
	 * @param value The value.
	 */
	private constructor(value: string) {
		this.#value = value
	}

	/**
	 * Makes a haystack URI.
	 *
	 * @param value The string value for the URI or a Hayson URI object.
	 * @returns A haystack URI.
	 */
	public static make(value: string | HaysonUri | HUri): HUri {
		if (valueIsKind<HUri>(value, Kind.Uri)) {
			return value
		} else {
			let val = ''

			if (typeof value === 'string') {
				val = value as string
			} else {
				const obj = value as HaysonUri
				val = obj.val
			}

			return new HUri(val)
		}
	}

	/**
	 * @returns The URI string value.
	 */
	public get value(): string {
		return this.#value
	}

	public set value(value: string) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The value's kind.
	 */
	public getKind(): Kind {
		return Kind.Uri
	}

	/**
	 * Compares the value's kind.
	 *
	 * @param kind The kind to compare against.
	 * @returns True if the kind matches.
	 */
	public isKind(kind: Kind): boolean {
		return valueIsKind<HUri>(this, kind)
	}

	/**
	 * Returns true if the haystack filter matches the value.
	 *
	 * @param filter The filter to test.
	 * @param cx Optional haystack filter evaluation context.
	 * @returns True if the filter matches ok.
	 */
	public matches(filter: string | Node, cx?: Partial<EvalContext>): boolean {
		return valueMatches(this, filter, cx)
	}

	/**
	 * Dump the value to the local console output.
	 *
	 * @param message An optional message to display before the value.
	 * @returns The value instance.
	 */
	public inspect(message?: string): this {
		return valueInspect(this, message)
	}

	/**
	 * Encodes to an encoded zinc value that can be used
	 * in a haystack filter string.
	 *
	 * The encoding for a haystack filter is mostly zinc but contains
	 * some exceptions.
	 *
	 * @returns The encoded value that can be used in a haystack filter.
	 */
	public toFilter(): string {
		return this.toZinc()
	}

	/**
	 * Value equality check.
	 *
	 * @param value The uri to test.
	 * @returns True if the value is the same.
	 */
	public equals(value: unknown): boolean {
		return valueIsKind<HUri>(value, Kind.Uri) && this.value === value.value
	}

	/**
	 * Compares two values.
	 *
	 * @param value The value to compare against.
	 * @returns The sort order as negative, 0, or positive
	 */
	public compareTo(value: unknown): number {
		if (!valueIsKind<HUri>(value, Kind.Uri)) {
			return -1
		}

		if (this.value < value.value) {
			return -1
		}
		if (this.value === value.value) {
			return 0
		}
		return 1
	}

	/**
	 * @returns A string representation of the value.
	 */
	public toString(): string {
		return this.value
	}

	/**
	 * @returns The encoded URI value.
	 */
	public valueOf(): string {
		return this.value
	}

	/**
	 * Encode to zinc encoding.
	 *
	 * @returns The encoded zinc string.
	 */
	public toZinc(): string {
		let buf = '`'

		for (const c of this.value) {
			const code = c.charCodeAt(0)
			if (c < ' ' || c === '`' || code >= 128) {
				buf += '\\'
				switch (c) {
					case '`':
						buf += '`'
						break
					default:
						let seq = code.toString(16)

						// Make sure we have four characters for the unicode sequence.
						while (seq.length < 4) {
							seq = `0${seq}`
						}

						buf += `u${seq}`
				}
			} else {
				buf += c
			}
		}

		buf += '`'

		return buf
	}

	/**
	 * @returns A JSON reprentation of the object.
	 */
	public toJSON(): HaysonUri {
		return {
			_kind: this.getKind(),
			val: this.value,
		}
	}

	/**
	 * @returns A string containing the JSON representation of the object.
	 */
	public toJSONString(): string {
		return JSON.stringify(this)
	}

	/**
	 * @returns A JSON v3 representation of the object.
	 */
	public toJSONv3(): JsonV3Uri {
		return `u:${this.value}`
	}

	/**
	 * @returns An Axon encoded string of the value.
	 */
	public toAxon(): string {
		return this.toZinc()
	}

	/**
	 * @returns Returns the value instance.
	 */
	public newCopy(): HUri {
		return this
	}

	/**
	 * @returns The value as a grid.
	 */
	public toGrid(): HGrid {
		return HGrid.make(this)
	}

	/**
	 * @returns The value as a list.
	 */
	public toList(): HList<HUri> {
		return HList.make(this)
	}

	/**
	 * @returns The value as a dict.
	 */
	public toDict(): HDict {
		return HDict.make(this)
	}

	/**
	 * Return the scheme being used or an empty string if it can't be found.
	 */
	public get scheme(): string {
		return this.parse().scheme
	}

	/**
	 * @returns The host name or an empty string if it can't be found.
	 */
	public get hostname(): string {
		return this.parse().hostname
	}

	/**
	 * @returns The port number being used or -1 if the port number can't
	 * be parsed for an unknown protocol.
	 */
	public get port(): number {
		return this.parse().port
	}

	/**
	 * @returns The pathname or an empty string if none can be found.
	 */
	public get pathname(): string {
		return this.parse().pathname
	}

	/**
	 * @returns The paths or an empty array if no paths can be found.
	 */
	@memoize()
	public get paths(): string[] {
		return this.parse()
			.pathname.split('/')
			.filter((path) => !!path.length)
	}

	/**
	 * @return the fragment identifier or an empty string if it can't be found.
	 */
	public get hash(): string {
		return this.parse().hash
	}

	/**
	 * @returns The whole query string.
	 */
	public get query(): string {
		return this.parse().query
	}

	/**
	 * @returns The parsed query object.
	 */
	@memoize()
	public get queryParams(): Record<string, string> {
		return this.parse()
			.query.split('&')
			.reduce((obj, value) => {
				const [key, val] = value.split('=')
				if (key) {
					obj[decodeURIComponent(key)] = decodeURIComponent(val ?? '')
				}
				return obj
			}, {} as Record<string, string>)
	}

	/**
	 * @returns parse the URI query and return the result.
	 */
	@memoize()
	private parse(): UriData {
		// https://www.rfc-editor.org/rfc/rfc3986#appendix-B
		const res =
			/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(
				this.value
			)

		const scheme = (res?.[2] ?? '').toLowerCase()
		let hostname = ''
		let port = -1

		if (scheme) {
			// Parse port from host.
			const hostRes = /^([^:]+)(:([0-9]+):?)?/.exec(res?.[4] ?? '')
			hostname = hostRes?.[1] ?? ''

			if (hostRes?.[3]) {
				port = Number(hostRes?.[3])
			} else {
				if (scheme === HTTP_SCHEME) {
					port = HTTP_PORT
				} else if (scheme === HTTPS_SCHEME) {
					port = HTTPS_PORT
				}
			}
		}

		const pathname = res?.[5] ?? ''
		const query = res?.[7] ?? ''
		const hash = res?.[9] ?? ''

		return {
			scheme,
			hostname,
			port,
			pathname,
			query,
			hash,
		}
	}
}

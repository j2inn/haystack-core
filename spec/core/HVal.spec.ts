/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	isHVal,
	valueIsKind,
	valueMatches,
	valueInspect,
	valueEquals,
	valueToZinc,
	valueToAxon,
	HVal,
} from '../../src/core/HVal'
import { HBool } from '../../src/core/HBool'
import { Kind } from '../../src/core/Kind'
import { HDict } from '../../src/core/HDict'

describe('HVal', function (): void {
	describe('.isHVal()', function (): void {
		it('returns true when the object is an haystack value', function (): void {
			expect(isHVal(HBool.make(true))).toBe(true)
		})

		it('returns false when the object is null', function (): void {
			expect(isHVal(null)).toBe(false)
		})

		it('returns false when the object is undefined', function (): void {
			expect(isHVal(undefined)).toBe(false)
		})

		it('returns false when the object is an object', function (): void {
			expect(isHVal({})).toBe(false)
		})
	}) // .isHVal()

	describe('.valueIsKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(valueIsKind(HBool.make(true), Kind.Bool)).toBe(true)
		})

		it('acts as a type guard for a generic HVal type', function (): void {
			const val: HVal = HDict.make({ foo: 'bar' })

			if (valueIsKind<HDict>(val, Kind.Dict)) {
				expect(val.keys).toEqual(['foo'])
			}
		})
	}) // .valueIsKind()

	describe('.valueMatches()', function (): void {
		it('returns true when the value matches for item', function (): void {
			expect(valueMatches(HBool.make(true), 'item == true')).toBe(true)
		})

		it('returns true when the value matches for it', function (): void {
			expect(valueMatches(HBool.make(true), 'it == true')).toBe(true)
		})
	}) // .valueMatches()

	describe('.valueInspect()', function (): void {
		it('returns a value', function (): void {
			expect(valueInspect(HBool.make(true), 'test')).toBe(
				HBool.make(true)
			)
		})
	}) // .valueInspect()

	describe('.valueEquals()', function (): void {
		it('returns true for two nulls', function (): void {
			expect(valueEquals(null, null)).toBe(true)
		})

		it('returns false when one object is null', function (): void {
			expect(valueEquals(HBool.make(true), null)).toBe(false)
		})

		it('returns false when two objects are not the same', function (): void {
			expect(valueEquals(HBool.make(true), HBool.make(false))).toBe(false)
		})

		it('returns true when two objects are the same', function (): void {
			expect(valueEquals(HBool.make(true), HBool.make(true))).toBe(true)
		})
	}) // .valueEquals()

	describe('.valueToZinc()', function (): void {
		it('returns a zinc encoded string from a value', function (): void {
			expect(valueToZinc(HBool.make(true))).toBe('T')
		})

		it('returns a zinc encoded string from null', function (): void {
			expect(valueToZinc(null)).toBe('N')
		})
	}) // .valueToZinc()

	describe('.valueToAxon()', function (): void {
		it('returns an axon encoded string from a value', function (): void {
			expect(valueToAxon(HBool.make(true))).toBe('true')
		})

		it('returns an axon encoded string from null', function (): void {
			expect(valueToAxon(null)).toBe('null')
		})
	}) // .valueToAxon()
})

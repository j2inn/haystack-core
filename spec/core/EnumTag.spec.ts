/*
 * Copyright (c) 2024, J2 Innovations. All Rights Reserved
 */

import { HStr } from '../../src/core/HStr'
import { HGrid } from '../../src/core/HGrid'
import { HDict } from '../../src/core/HDict'
import { HNum } from '../../src/core/HNum'
import { HBool } from '../../src/core/HBool'
import { EnumTag } from '../../src/core/EnumTag'
import { makeValue } from '../../src/core/util'

describe('EnumTag', () => {
	describe('construction', () => {
		it('creates an enum tag from a string', () => {
			expect(new EnumTag('a,b,c').encodeToObject()).toEqual({
				a: 0,
				b: 1,
				c: 2,
			})
		})

		it('creates an enum tag from a haystack string', () => {
			expect(new EnumTag(HStr.make('a,b,c')).encodeToObject()).toEqual({
				a: 0,
				b: 1,
				c: 2,
			})
		})

		it('creates an enum tag from a string with different indexes', () => {
			expect(new EnumTag('a,,,b,,c,,,').encodeToObject()).toEqual({
				a: 0,
				b: 3,
				c: 5,
			})
		})

		it('creates an enum tag from an object', () => {
			const obj = {
				a: 0,
				b: 1,
				c: 2,
			}

			expect(new EnumTag(obj).encodeToObject()).toEqual({
				a: 0,
				b: 1,
				c: 2,
			})
		})

		it('creates an enum tag from a grid', () => {
			const grid = new HGrid([
				new HDict({
					name: 'a',
					code: 1,
				}),
				new HDict({
					name: 'b',
					code: 2,
				}),
				new HDict({
					name: 'c',
					code: 3,
				}),
			])

			expect(new EnumTag(grid).encodeToObject()).toEqual({
				a: 1,
				b: 2,
				c: 3,
			})
		})
	}) // construction

	describe('#nameToCode()', () => {
		it('returns a code for a name for a', () => {
			expect(new EnumTag('a,b,c').nameToCode('a')).toBe(0)
		})

		it('returns a haystack string code for a name for a', () => {
			expect(new EnumTag('a,b,c').nameToCode(HStr.make('a'))).toBe(0)
		})

		it('returns a code for a name for b', () => {
			expect(new EnumTag('a,b,c').nameToCode('b')).toBe(1)
		})

		it('returns undefined when a name cannot be found', () => {
			expect(new EnumTag('a,b,c').nameToCode('notFound')).toBe(undefined)
		})
	}) // #nameToCode()

	describe('#codeToName()', () => {
		it('returns a name from a code for 0', () => {
			expect(new EnumTag('a,b,c').codeToName(0)).toBe('a')
		})

		it('returns a name from a code for a haystack number 0', () => {
			expect(new EnumTag('a,b,c').codeToName(HNum.make(0))).toBe('a')
		})

		it('returns a name from a code for 1', () => {
			expect(new EnumTag('a,b,c').codeToName(1)).toBe('b')
		})

		it('returns undefined for a code that cannot be found', () => {
			expect(new EnumTag('a,b,c').codeToName(99)).toBe(undefined)
		})
	}) // #codeToName()

	describe('#nameToBool()', () => {
		it('returns false for a', () => {
			expect(new EnumTag('a,b,c').nameToBool('a')).toBe(false)
		})

		it('returns false for haystack string a', () => {
			expect(new EnumTag('a,b,c').nameToBool(HStr.make('a'))).toBe(false)
		})

		it('returns true for b', () => {
			expect(new EnumTag('a,b,c').nameToBool('b')).toBe(true)
		})

		it('returns true for c', () => {
			expect(new EnumTag('a,b,c').nameToBool('c')).toBe(true)
		})

		it('returns undefined for notFound for c', () => {
			expect(new EnumTag('a,b,c').nameToBool('notFound')).toBe(undefined)
		})
	}) // #nameToBool()

	describe('#boolToName()', () => {
		it('returns a for false', () => {
			expect(new EnumTag('a,b,c').boolToName(false)).toBe('a')
		})

		it('returns b for true', () => {
			expect(new EnumTag('a,b,c').boolToName(true)).toBe('b')
		})

		it('returns b for haystack boolean true', () => {
			expect(new EnumTag('a,b,c').boolToName(HBool.make(true))).toBe('b')
		})
	}) // #boolToName()

	describe('#size', () => {
		it('returns the number of enumerations', () => {
			expect(new EnumTag('a,b,c').size).toBe(3)
		})
	}) // #size

	describe('#names', () => {
		it('returns the names', () => {
			expect(new EnumTag('a,b,c').names).toEqual(['a', 'b', 'c'])
		})
	}) // #names

	describe('#encodeToString()', () => {
		it('encodes enumerations to a string', () => {
			expect(new EnumTag('a,b,c').encodeToString()).toBe('a,b,c')
		})

		it('encodes enumerations with different indexes to a string', () => {
			expect(new EnumTag(',,a,,,,,b,,,c,,,,,').encodeToString()).toBe(
				',,a,,,,,b,,,c'
			)
		})
	}) // #encodeToString()

	describe('#encodeToGrid()', () => {
		it('encodes enumerations to a grid', () => {
			expect(new EnumTag('a,b,c').encodeToGrid().toJSON()).toEqual(
				new HGrid([
					new HDict({
						name: 'a',
						code: 0,
					}),
					new HDict({
						name: 'b',
						code: 1,
					}),
					new HDict({
						name: 'c',
						code: 2,
					}),
				]).toJSON()
			)
		})
	}) // #encodeToGrid()

	describe('#encodeToObject()', () => {
		it('encode the enumerations to an object', () => {
			expect(new EnumTag('a,b,c').encodeToObject()).toEqual({
				a: 0,
				b: 1,
				c: 2,
			})
		})
	}) // #encodeToObject()

	describe('.encodeToEnumMetaDict()', () => {
		it('encodes to a dict', () => {
			const obj = {
				alpha: new EnumTag('a,b,c'),
				beta: new EnumTag('d,e,f'),
				gamma: new EnumTag('g,h,i'),
			}

			expect(EnumTag.encodeToEnumMetaDict(obj).toJSON()).toEqual({
				alpha: 'ver:"3.0"\nname,code\n"a",0\n"b",1\n"c",2\n',
				beta: 'ver:"3.0"\nname,code\n"d",0\n"e",1\n"f",2\n',
				gamma: 'ver:"3.0"\nname,code\n"g",0\n"h",1\n"i",2\n',
			})
		})
	}) // .encodeToEnumMetaDict()

	describe('.decodeFromEnumMetaDict()', () => {
		it('decodes from a dict', () => {
			const dict = makeValue({
				alpha: 'ver:"3.0"\nname,code\n"a",0\n"b",1\n"c",2\n',
				beta: 'ver:"3.0"\nname,code\n"d",0\n"e",1\n"f",2\n',
				gamma: 'ver:"3.0"\nname,code\n"g",0\n"h",1\n"i",2\n',
			}) as HDict

			expect(EnumTag.decodeFromEnumMetaDict(dict)).toEqual({
				alpha: new EnumTag('a,b,c'),
				beta: new EnumTag('d,e,f'),
				gamma: new EnumTag('g,h,i'),
			})
		})
	}) // .decodeFromEnumMetaDict()
})

/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { ZincReader } from '../../src/core/ZincReader'
import { HStr } from '../../src/core/HStr'
import { HUri } from '../../src/core/HUri'
import { HRef } from '../../src/core/HRef'
import { HNum } from '../../src/core/HNum'
import { HDate } from '../../src/core/HDate'
import { HTime } from '../../src/core/HTime'
import { Scanner } from '../../src/util/Scanner'
import { HDateTime } from '../../src/core/HDateTime'
import { HMarker } from '../../src/core/HMarker'
import { HRemove } from '../../src/core/HRemove'
import { HNa } from '../../src/core/HNa'
import { HCoord } from '../../src/core/HCoord'
import { HBool } from '../../src/core/HBool'
import { HXStr } from '../../src/core/HXStr'
import { HDict } from '../../src/core/dict/HDict'
import { HSymbol } from '../../src/core/HSymbol'
import { HList } from '../../src/core/list/HList'
import { HGrid } from '../../src/core/grid/HGrid'
import { HVal } from '../../src/core/HVal'
import { readFile } from '../file'

describe('ZincReader', function (): void {
	function makeReader(input: string): ZincReader {
		return new ZincReader(new Scanner(input))
	}

	describe('#nextValue()', function (): void {
		describe('string', function (): void {
			it('returns a string value', function (): void {
				expect(makeReader('"some text"').readValue()).toEqual(
					HStr.make('some text')
				)
			})

			it('throws an error when the end of a string cannot be found', function (): void {
				expect((): void => {
					makeReader('"some text').readValue()
				}).toThrow()
			})

			it('parse a string with an escaped double quotation', function (): void {
				expect(makeReader('"some text\\""').readValue()).toEqual(
					HStr.make('some text"')
				)
			})

			it('parse a string with an escaped back slash', function (): void {
				expect(makeReader('"some text\\\\"').readValue()).toEqual(
					HStr.make('some text\\')
				)
			})

			it('parse a unicode character', function (): void {
				expect(makeReader('"Hell\\u00D3"').readValue()).toEqual(
					HStr.make('HellÓ')
				)
			})

			it('parse a line break', function (): void {
				expect(makeReader('"Hell\\b"').readValue()).toEqual(
					HStr.make('Hell\b')
				)
			})

			it('parse a form feed', function (): void {
				expect(makeReader('"Hell\\f"').readValue()).toEqual(
					HStr.make('Hell\f')
				)
			})

			it('parse a tab', function (): void {
				expect(makeReader('"Hell\\t"').readValue()).toEqual(
					HStr.make('Hell\t')
				)
			})

			it('parse a back tick', function (): void {
				expect(makeReader('"Hell`"').readValue()).toEqual(
					HStr.make('Hell`')
				)
			})

			it('parse a new line', function (): void {
				expect(makeReader('"Hell\\no"').readValue()).toEqual(
					HStr.make('Hell\no')
				)
			})

			it('parse a carriage return', function (): void {
				expect(makeReader('"Hell\\r"').readValue()).toEqual(
					HStr.make('Hell\r')
				)
			})

			it('parses an empty string', function (): void {
				expect(makeReader('""').readValue()).toEqual(HStr.make(''))
			})

			it('parse many special characters in a sentence', function (): void {
				expect(
					makeReader(
						'"Hell\\u00D3 there. This\\nis lots of \\t func\\n"'
					).readValue()
				).toEqual(HStr.make('HellÓ there. This\nis lots of \t func\n'))
			})
		}) // string

		describe('uri', function (): void {
			it('parse a uri', function (): void {
				expect(makeReader('`/foo/bag`').readValue()).toEqual(
					HUri.make('/foo/bag')
				)
			})

			it('parse an empty uri', function (): void {
				expect(makeReader('``').readValue()).toEqual(HUri.make(''))
			})

			it('parse a unicode character', function (): void {
				expect(makeReader('`Hell\\u00D3`').readValue()).toEqual(
					HUri.make('HellÓ')
				)
			})

			it('throws an error for a missing tick', function (): void {
				expect((): void => {
					makeReader('`/foo/bag').readValue()
				}).toThrow()
			})

			it('parse a string with an escaped tick', function (): void {
				expect(makeReader('`some text\\``').readValue()).toEqual(
					HUri.make('some text\\`')
				)
			})

			it('parse a string with an escaped back slash', function (): void {
				expect(makeReader('`some text\\\\`').readValue()).toEqual(
					HUri.make('some text\\\\')
				)
			})

			it('parse back slash colon', function (): void {
				expect(makeReader('`\\:`').readValue()).toEqual(
					HUri.make('\\:')
				)
			})

			it('parse back slash forward slash', function (): void {
				expect(makeReader('`\\/`').readValue()).toEqual(
					HUri.make('\\/')
				)
			})

			it('parse back slash question mark', function (): void {
				expect(makeReader('`\\?`').readValue()).toEqual(
					HUri.make('\\?')
				)
			})

			it('parse back slash hash', function (): void {
				expect(makeReader('`\\#`').readValue()).toEqual(
					HUri.make('\\#')
				)
			})

			it('parse back slash left square bracket', function (): void {
				expect(makeReader('`\\[`').readValue()).toEqual(
					HUri.make('\\[')
				)
			})

			it('parse back slash right square bracket', function (): void {
				expect(makeReader('`\\]`').readValue()).toEqual(
					HUri.make('\\]')
				)
			})

			it('parse back slash at', function (): void {
				expect(makeReader('`\\@`').readValue()).toEqual(
					HUri.make('\\@')
				)
			})

			it('parse back slash ampersand', function (): void {
				expect(makeReader('`\\&`').readValue()).toEqual(
					HUri.make('\\&')
				)
			})

			it('parse back slash equals', function (): void {
				expect(makeReader('`\\=`').readValue()).toEqual(
					HUri.make('\\=')
				)
			})

			it('parse back slash semi-colon', function (): void {
				expect(makeReader('`\\;`').readValue()).toEqual(
					HUri.make('\\;')
				)
			})
		}) // uri

		describe('ref', function (): void {
			it('parse ref', function (): void {
				expect(makeReader('@test').readValue()).toEqual(
					HRef.make('test')
				)
			})

			it('parse ref with all characters', function (): void {
				expect(
					makeReader(
						'@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:-.~'
					).readValue()
				).toEqual(
					HRef.make(
						'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:-.~'
					)
				)
			})

			it('throws an error for an empty ref', function (): void {
				expect((): void => {
					makeReader('@(').readValue()
				}).toThrow()
			})

			it('parse ref with display string', function (): void {
				const ref = makeReader('@test "Test"').readValue() as HRef

				expect(ref.value).toBe('test')
				expect(ref.dis).toBe('Test')
			})

			it('parse ref with display string that uses a tab', function (): void {
				const ref = makeReader('@test	"Test"').readValue() as HRef

				expect(ref.value).toBe('test')
				expect(ref.dis).toBe('Test')
			})

			it('parse ref hello "world"', function (): void {
				expect(makeReader('@hello "world"').readValue()).toEqual(
					HRef.make('hello', 'world')
				)
			})

			it('parse ref hello_world', function (): void {
				expect(makeReader('@hello_world').readValue()).toEqual(
					HRef.make('hello_world')
				)
			})

			it('parse ref hello "world\\""', function (): void {
				expect(makeReader('@hello "world\\""').readValue()).toEqual(
					HRef.make('hello', 'world\\"')
				)
			})

			it('parse ref hello "world\n"', function (): void {
				expect(makeReader('@hello "world\n"').readValue()).toEqual(
					HRef.make('hello', 'world\n')
				)
			})

			it('parse ref hello "world\n again"', function (): void {
				expect(
					makeReader('@hello "world\n again"').readValue()
				).toEqual(HRef.make('hello', 'world\n again'))
			})

			it('parse ref hello ""', function (): void {
				expect(makeReader('@hello ""').readValue()).toEqual(
					HRef.make('hello', '')
				)
			})
		}) // ref

		describe('number', function (): void {
			function toNum(numStr: string): HNum {
				return makeReader(numStr).readValue() as HNum
			}

			it('returns 1', function (): void {
				expect(toNum('1').valueOf()).toBe(1)
			})

			it('returns 11', function (): void {
				expect(toNum('11').valueOf()).toBe(11)
			})

			it('returns -11', function (): void {
				expect(toNum('-11').valueOf()).toBe(-11)
			})

			it('returns -45.78', function (): void {
				expect(toNum('-45.78').valueOf()).toBe(-45.78)
			})

			it('returns 10.34E10', function (): void {
				expect(toNum('10.34E10').valueOf()).toBe(10.34e10)
			})

			it('returns 10.34e10', function (): void {
				expect(toNum('10.34e10').valueOf()).toBe(10.34e10)
			})

			it('returns 10.34e-10', function (): void {
				expect(toNum('10.34e-10').valueOf()).toBe(10.34e-10)
			})

			it('returns 10.34e+10', function (): void {
				expect(toNum('10.34e+10').valueOf()).toBe(10.34e10)
			})

			it('returns a 10000 for 10_000', function (): void {
				expect(toNum('10_000').valueOf()).toBe(10000)
			})

			it('throws an error for an invalid number', function (): void {
				expect((): void => {
					makeReader('-E23.34').readValue()
				}).toThrow()
			})

			describe('parse units', function (): void {
				it('into token meta data', function (): void {
					expect(toNum('30cm').unit?.symbol).toBe('cm')
				})

				it('and value from number with units', function (): void {
					expect(toNum('30cm').valueOf()).toBe(30)
				})

				it('into token meta data with all characters', function (): void {
					const num = toNum(
						'30abcdefghijklmnopqrstuvwxyzABSDEFGHIJKLMNOPQRSTUVWXYZ_$%/'
					)
					expect(num.unit?.symbol).toBe(
						'abcdefghijklmnopqrstuvwxyzABSDEFGHIJKLMNOPQRSTUVWXYZ_$%/'
					)
				})
			}) // parse units

			it('parse not a number', function (): void {
				expect(toNum('NaN')).toEqual(HNum.make(Number.NaN))
			})

			it('parse positive infinity', function (): void {
				expect(toNum('INF')).toEqual(
					HNum.make(Number.POSITIVE_INFINITY)
				)
			})

			it('parse negative infinity', function (): void {
				expect(toNum('-INF')).toEqual(
					HNum.make(Number.NEGATIVE_INFINITY)
				)
			})
		}) // number

		describe('date', function (): void {
			it('parse a date', function (): void {
				expect(makeReader('2008-12-05').readValue()).toEqual(
					HDate.make('2008-12-05')
				)
			})
		}) // date

		describe('time', function (): void {
			it('parses a time with milliseconds', function (): void {
				expect(makeReader('09:23:45.123').readValue()).toEqual(
					HTime.make('09:23:45.123')
				)
			})

			it('parses a time with seconds', function (): void {
				expect(makeReader('09:23:45').readValue()).toEqual(
					HTime.make('09:23:45')
				)
			})

			it('adds missing seconds', function (): void {
				expect(makeReader('09:23').readValue()).toEqual(
					HTime.make('09:23:00')
				)
			})

			it('adds extra zero if missing', function (): void {
				expect(makeReader('9:23:45').readValue()).toEqual(
					HTime.make('09:23:45')
				)
			})
		}) // time

		describe('date time', function (): void {
			it('parses a date time with no milliseconds and zulu time', function (): void {
				expect(makeReader('2009-11-09T15:39:00Z').readValue()).toEqual(
					HDateTime.make('2009-11-09T15:39:00Z UTC')
				)
			})

			it('parses a date time with UTC', function (): void {
				expect(
					makeReader('2010-01-08T05:00:00Z UTC').readValue()
				).toEqual(HDateTime.make('2010-01-08T05:00:00Z UTC'))
			})

			it('parses a date time with GMT+', function (): void {
				expect(
					makeReader('2010-11-28T12:22:27-03:00 GMT+3').readValue()
				).toEqual(HDateTime.make('2010-11-28T12:22:27-03:00 GMT+3'))
			})

			it('parses a date time with GMT-', function (): void {
				expect(
					makeReader('2010-11-28T12:22:27-03:00 GMT-3').readValue()
				).toEqual(HDateTime.make('2010-11-28T12:22:27-03:00 GMT-3'))
			})

			it('parses a date time with positive offset and timezone', function (): void {
				expect(
					makeReader(
						'2010-11-28T23:19:29.741+08:00 Taipei'
					).readValue()
				).toEqual(
					HDateTime.make('2010-11-28T23:19:29.741+08:00 Taipei')
				)
			})

			it('parses a date time with negative offset and timezone', function (): void {
				expect(
					makeReader(
						'2010-11-28T07:23:02.773-08:00 Los_Angeles'
					).readValue()
				).toEqual(
					HDateTime.make('2010-11-28T07:23:02.773-08:00 Los_Angeles')
				)
			})

			it('parses a date time with timezone containing -', function (): void {
				expect(
					makeReader(
						'2010-11-28T07:23:02.773-04:00 Port-au-Prince'
					).readValue()
				).toEqual(
					HDateTime.make(
						'2010-11-28T07:23:02.773-04:00 Port-au-Prince'
					)
				)
			})

			it('parses a date time with GMT-n timezone', function (): void {
				expect(
					makeReader(
						'2025-06-12T15:22:11.518+02:00 GMT-2'
					).readValue()
				).toEqual(HDateTime.make('2025-06-12T15:22:11.518+02:00 GMT-2'))
			})

			it('parses a date time with GMT+n timezone', function (): void {
				expect(
					makeReader(
						'2025-06-12T11:23:32.488-02:00 GMT+2'
					).readValue()
				).toEqual(HDateTime.make('2025-06-12T11:23:32.488-02:00 GMT+2'))
			})
		}) // date time

		describe('null', function (): void {
			it('parses a null value', function (): void {
				expect(makeReader('N').readValue()).toBeNull()
			})
		}) // null

		describe('marker', function (): void {
			it('parses a marker value', function (): void {
				expect(makeReader('M').readValue()).toEqual(HMarker.make())
			})
		}) // marker

		describe('remove', function (): void {
			it('parses a remove value', function (): void {
				expect(makeReader('R').readValue()).toEqual(HRemove.make())
			})
		}) // remove

		describe('NA', function (): void {
			it('parses an NA value', function (): void {
				expect(makeReader('NA').readValue()).toEqual(HNa.make())
			})
		}) // NA

		describe('coord', function (): void {
			it('parses coordinate', function (): void {
				expect(makeReader('C(-2.34,-46.54)').readValue()).toEqual(
					HCoord.make({ latitude: -2.34, longitude: -46.54 })
				)
			})

			it('throws an error for an invalid coordinate', function (): void {
				expect((): void => {
					makeReader('C(a,-46.54)').readValue()
				}).toThrow()
			})
		}) // coord

		describe('boolean', function (): void {
			it('parses boolean true', function (): void {
				expect(makeReader('T').readValue()).toBe(HBool.make(true))
			})

			it('parses boolean false', function (): void {
				expect(makeReader('F').readValue()).toBe(HBool.make(false))
			})
		}) // boolean

		describe('xstring', function (): void {
			it('parses an xstring', function (): void {
				expect(makeReader('Type("value")').readValue()).toEqual(
					HXStr.make('Type', 'value')
				)
			})
		}) // xstring

		describe('bin', function (): void {
			it('parses a bin as an xstring', function (): void {
				expect(
					makeReader('Bin("application/json")').readValue()
				).toEqual(HXStr.make('Bin', 'application/json'))
			})
		}) // bin

		describe('dict', function (): void {
			it('parses an empty dict', function (): void {
				expect(makeReader('{}').readValue()).toEqual(HDict.make({}))
			})

			it('parses a dict with a marker tag', function (): void {
				expect(makeReader('{foo}').readValue()).toEqual(
					HDict.make({ foo: HMarker.make() })
				)
			})

			it('parses a dict with a string tag', function (): void {
				expect(makeReader('{foo:"foobar"}').readValue()).toEqual(
					HDict.make({ foo: HStr.make('foobar') })
				)
			})

			it('parses a dict with a string and marker tag', function (): void {
				expect(makeReader('{foo:"foobar" boo}').readValue()).toEqual(
					HDict.make({
						foo: HStr.make('foobar'),
						boo: HMarker.make(),
					})
				)
			})

			it('parses a dict with a string and marker tag using comma separators', function (): void {
				expect(makeReader('{foo:"foobar", boo}').readValue()).toEqual(
					HDict.make({
						foo: HStr.make('foobar'),
						boo: HMarker.make(),
					})
				)
			})

			it('parses a dict with a string and marker tag and a trailing comma', function (): void {
				expect(makeReader('{foo:"foobar", boo,}').readValue()).toEqual(
					HDict.make({
						foo: HStr.make('foobar'),
						boo: HMarker.make(),
					})
				)
			})

			it('parses a dict within a dict', function (): void {
				expect(makeReader('{dict:{foo:"foobar"}}').readValue()).toEqual(
					HDict.make({
						dict: HDict.make({ foo: HStr.make('foobar') }),
					})
				)
			})

			it('parses a dict with extra white space', function (): void {
				expect(
					makeReader(
						'{   foo   :   "foobar"   ,   boo   }'
					).readValue()
				).toEqual(
					HDict.make({
						foo: HStr.make('foobar'),
						boo: HMarker.make(),
					})
				)
			})

			it('parses a dict with all different types of value', function (): void {
				expect(
					makeReader(
						'{foo:"foobar" boo num:123 bin:Bin("application/json") bool:T coord:C(1,1) date:2010-03-13 ' +
							'dateTime:2010-03-11T23:55:00-05:00 New_York def:^def dict:{foo:F} na:NA ref:@ref ' +
							'remove:R time:08:12:05 uri:`/foo` xstr:XStr("data") list:["foo"]}'
					).readValue()
				).toEqual(
					HDict.make({
						foo: HStr.make('foobar'),
						boo: HMarker.make(),
						num: HNum.make(123),
						bin: HXStr.make('Bin', 'application/json'),
						bool: HBool.make(true),
						coord: HCoord.make({ latitude: 1, longitude: 1 }),
						date: HDate.make('2010-03-13'),
						dateTime: HDateTime.make(
							'2010-03-11T23:55:00-05:00 New_York'
						),
						def: HSymbol.make('def'),
						dict: HDict.make({ foo: HBool.make(false) }),
						na: HNa.make(),
						ref: HRef.make('ref'),
						remove: HRemove.make(),
						time: HTime.make('08:12:05'),
						uri: HUri.make('/foo'),
						xstr: HXStr.make('XStr', 'data'),
						list: HList.make(HStr.make('foo')),
					})
				)
			})

			it('decodes null values', function (): void {
				expect(makeReader('{foo:N}').readValue()).toEqual(
					HDict.make({ foo: null })
				)
			})
		}) // dict

		describe('def', function (): void {
			it('parses a def', function (): void {
				expect(makeReader('^foo').readValue()).toEqual(
					HSymbol.make('foo')
				)
			})

			it('parses a def with a colon', function (): void {
				expect(makeReader('^lib:phIoT').readValue()).toEqual(
					HSymbol.make('lib:phIoT')
				)
			})

			it('throws an error for an empty def', function (): void {
				expect((): void => {
					makeReader('^(').readValue()
				}).toThrow()
			})
		}) // def

		describe('list', function (): void {
			it('parses a list', function (): void {
				expect(makeReader('[12,"foo"]').readValue()).toEqual(
					HList.make<HVal>(HNum.make(12), HStr.make('foo'))
				)
			})

			it('parses a list with extra spaces', function (): void {
				expect(makeReader('[ 12 , "foo" ]').readValue()).toEqual(
					HList.make<HVal>(HNum.make(12), HStr.make('foo'))
				)
			})

			it('parses a list with a trailing comma', function (): void {
				expect(makeReader('[12,"foo",]').readValue()).toEqual(
					HList.make<HVal>(HNum.make(12), HStr.make('foo'))
				)
			})

			it('parses an empty list', function (): void {
				expect(makeReader('[]').readValue()).toEqual(HList.make())
			})

			it('parses a list within a list', function (): void {
				expect(makeReader('[["foo"]]').readValue()).toEqual(
					HList.make([HList.make(HStr.make('foo'))])
				)
			})

			it('parses every single type of value in a list', function (): void {
				expect(
					makeReader(
						'["foobar",M,123,Bin("application/json"),T,C(1,1),2010-03-13,' +
							'2010-03-11T23:55:00-05:00 New_York,^def,{foo:F},NA,@ref,' +
							'R,08:12:05,`/foo`,XStr("data"),["foo"]]'
					).readValue()
				).toEqual(
					HList.make<HVal>([
						HStr.make('foobar'),
						HMarker.make(),
						HNum.make(123),
						HXStr.make('Bin', 'application/json'),
						HBool.make(true),
						HCoord.make({ latitude: 1, longitude: 1 }),
						HDate.make('2010-03-13'),
						HDateTime.make('2010-03-11T23:55:00-05:00 New_York'),
						HSymbol.make('def'),
						HDict.make({ foo: HBool.make(false) }),
						HNa.make(),
						HRef.make('ref'),
						HRemove.make(),
						HTime.make('08:12:05'),
						HUri.make('/foo'),
						HXStr.make('XStr', 'data'),
						HList.make(HStr.make('foo')),
					])
				)
			})

			it('decodes null values', function (): void {
				expect(makeReader('[N]').readValue()).toEqual(
					HList.make([null])
				)
			})
		}) // list

		describe('grid', function (): void {
			it('parse a simple grid', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver:"3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a simple grid with a space after the version colon', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver: "3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a simple grid with new line after chevrons', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<\nver:"3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a simple grid with carriage return line feeds', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver:"3.0"\r\n' +
					'firstName,bday\r\n' +
					'"Jack",1973-07-23\r\n' +
					'"Jill",1975-11-15\r\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a simple grid with no less or greater than', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'ver:"3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a simple grid with no less or greater than followed by a new line', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'ver:"3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15\n'

				const grid = HGrid.make({
					columns: [
						{
							name: 'firstName',
						},
						{
							name: 'bday',
						},
					],
					rows: [
						HDict.make({
							firstName: HStr.make('Jack'),
							bday: HDate.make('1973-07-23'),
						}),
						HDict.make({
							firstName: HStr.make('Jill'),
							bday: HDate.make('1975-11-15'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()

				expect(value && value.equals(grid)).toBe(true)
			})

			it('do not add empty rows when parsing', function (): void {
				// First example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'ver:"3.0"\n' +
					'firstName,bday\n' +
					'"Jack",1973-07-23\n' +
					'"Jill",1975-11-15\n\n'

				const value = makeReader(zinc).readValue() as HGrid
				expect(value && value.length).toBe(2)
			})

			it('parse a grid with meta data', function (): void {
				// Second example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					'"Site 1", 356.214kW\n' +
					'"Site 2", 463.028kW\n' +
					'>>'

				const grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a grid with meta data and extra spaces in meta', function (): void {
				// Second example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver   :  "3.0"    database   :    "test"     dis  :   "Site Energy Summary"   \n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					'"Site 1", 356.214kW\n' +
					'"Site 2", 463.028kW\n' +
					'>>'

				const grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a grid with meta data and extra spaces in columns', function (): void {
				// Second example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName     dis   :   "Sites"   ,    val    dis  :   "Value" unit  :  "kW"  \n' +
					'"Site 1", 356.214kW\n' +
					'"Site 2", 463.028kW\n' +
					'>>'

				const grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a grid with meta data and extra spaces in data rows', function (): void {
				// Second example from syntax https://project-haystack.org/doc/Zinc
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					'   "Site 1"  , 356.214kW  \n' +
					'"Site 2", 463.028kW\n' +
					'>>'

				const grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse grid with two columns with one missing null value and one string', function (): void {
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					',"Site 1"\n' +
					',"Site 2"\n' +
					'>>'

				const grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({ val: HStr.make('Site 1') }),
						HDict.make({ val: HStr.make('Site 2') }),
					],
				})

				const value = makeReader(zinc).readValue()

				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse a grid with inner grids in meta', function (): void {
				const zinc =
					'ver:"3.0" usageByProj:<<\n' +
					'ver:"3.0" dis:"Usage by Project"\n' +
					'projName,points\n' +
					'"demo",1194\n' +
					'>> dir:<<\n' +
					'ver:"3.0" dis:"Effective License"\n' +
					'name,value\n' +
					'"licensee","J2 SkySpark Internal Use Only"\n' +
					'>>\n' +
					'empty\n' +
					'\n'

				const grid = HGrid.make({
					meta: HDict.make({
						usageByProj: HGrid.make({
							meta: HDict.make({
								dis: HStr.make('Usage by Project'),
							}),
							rows: [
								HDict.make({
									projName: HStr.make('demo'),
									points: HNum.make(1194),
								}),
							],
						}),
						dir: HGrid.make({
							meta: HDict.make({
								dis: HStr.make('Effective License'),
							}),
							rows: [
								HDict.make({
									name: HStr.make('licensee'),
									value: HStr.make(
										'J2 SkySpark Internal Use Only'
									),
								}),
							],
						}),
					}),
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse an inner grid', function (): void {
				// Taken from https://project-haystack.org/doc/Zinc
				const zinc =
					'ver:"3.0"\n' +
					'type,val\n' +
					'"list",[1,2,3]\n' +
					'"dict",{dis:"Dict!" foo}\n' +
					'"grid",<<\n' +
					'  ver:"3.0"\n' +
					'  a,b\n' +
					'  1,2\n' +
					'  3,4\n' +
					'  >>\n' +
					'"scalar","simple string"\n\n'

				const grid = HGrid.make({
					rows: [
						HDict.make({
							type: HStr.make('list'),
							val: HList.make([1, 2, 3]),
						}),
						HDict.make({
							type: HStr.make('dict'),
							val: HDict.make({
								dis: HStr.make('Dict!'),
								foo: HMarker.make(),
							}),
						}),
						HDict.make({
							type: HStr.make('grid'),
							val: HGrid.make({
								rows: [
									HDict.make({
										a: HNum.make(1),
										b: HNum.make(2),
									}),
									HDict.make({
										a: HNum.make(3),
										b: HNum.make(4),
									}),
								],
							}),
						}),
						HDict.make({
							type: HStr.make('scalar'),
							val: HStr.make('simple string'),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parse an empty inner grid', function (): void {
				const zinc =
					'ver:"3.0"\n' +
					'type,val\n' +
					'"grid",<<ver:"3.0"\n' +
					'a,b\n' +
					'>>\n' +
					'"scalar","simple string"\n\n'

				expect((): void => {
					makeReader(zinc).readValue()
				}).not.toThrow()
			})

			it("throws an error when two rows don't have a separator", function (): void {
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					'"Site 1"1m\n' +
					'"Site 2"2m\n' +
					'>>'

				expect((): void => {
					makeReader(zinc).readValue()
				}).toThrow()
			})

			it('throws an error when there are more rows than columns', function (): void {
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites", val dis:"Value" unit:"kW"\n' +
					'"Site 1",1m,T\n' +
					'"Site 2",2m,T\n' +
					'>>'

				expect((): void => {
					makeReader(zinc).readValue()
				}).toThrow()
			})

			it('throws an error when grid has no columns', function (): void {
				const zinc =
					'<<ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'\n' +
					'\n' +
					'>>'

				expect((): void => {
					makeReader(zinc).readValue()
				}).toThrow()
			})

			it('parses empty grid', function (): void {
				const zinc = 'ver:"3.0" watchId:"w-25d422d1-c99c7abd"\nempty\n'

				const grid = HGrid.make({
					meta: HDict.make({
						watchId: HStr.make('w-25d422d1-c99c7abd'),
					}),
					columns: [],
					rows: [],
				})

				const value = ZincReader.readValue(zinc)
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parses empty grid with columns', function (): void {
				const zinc = 'ver:"3.0"\na,b\n'

				const grid = HGrid.make({
					columns: [{ name: 'a' }, { name: 'b' }],
					rows: [],
				})

				const value = ZincReader.readValue(zinc)
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parses empty grid with columns with chevrons', function (): void {
				const zinc = '<<ver:"3.0"\na,b\n>>'

				const grid = HGrid.make({
					columns: [{ name: 'a' }, { name: 'b' }],
					rows: [],
				})

				const value = ZincReader.readValue(zinc)
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parses a grid with a datetime and timezone containing -', function (): void {
				const zinc =
					'<<ver:"3.0"\n' +
					'val\n' +
					'2025-06-12T08:24:25.631-04:00 Port-au-Prince\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'val',
						},
					],
					rows: [
						HDict.make({
							val: HDateTime.make(
								'2025-06-12T08:24:25.631-04:00 Port-au-Prince'
							),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parses a grid with a datetime and GMT-n timezone val', function (): void {
				const zinc =
					'<<ver:"3.0"\n' +
					'val\n' +
					'2025-06-12T14:54:00.88+02:00 GMT-2\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'val',
						},
					],
					rows: [
						HDict.make({
							val: HDateTime.make(
								'2025-06-12T14:54:00.88+02:00 GMT-2'
							),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})

			it('parses a grid with a datetime and GMT+n timezone val', function (): void {
				const zinc =
					'<<ver:"3.0"\n' +
					'val\n' +
					'2025-06-12T14:54:00.88-02:00 GMT+2\n' +
					'>>'

				const grid = HGrid.make({
					columns: [
						{
							name: 'val',
						},
					],
					rows: [
						HDict.make({
							val: HDateTime.make(
								'2025-06-12T14:54:00.88-02:00 GMT+2'
							),
						}),
					],
				})

				const value = makeReader(zinc).readValue()
				expect(value && value.equals(grid)).toBe(true)
			})
		}) // grid
	}) // #nextValue()

	describe('.make()', function (): void {
		it('returns a haystack value', function (): void {
			expect(ZincReader.readValue('T')).toBe(HBool.make(true))
		})
	}) // .make()

	describe('read from zinc files', function (): void {
		function readTest(name: string): void {
			const start = process.hrtime()

			const file = readFile(name)
			let grid: HGrid

			if (name.endsWith('.zinc')) {
				grid = ZincReader.readValue(file) as HGrid
			} else if (name.endsWith('.json')) {
				grid = HGrid.make(JSON.parse(file))
			} else {
				throw new Error('Unsupported file')
			}

			const end = process.hrtime(start)
			console.log(
				`*** Profile test read of ${name}: ${end[1] / 1000000}ms ***`
			)

			expect(grid instanceof HGrid).toBe(true)
		}

		it('read sites', function (): void {
			console.log()
			readTest('sites.zinc')
			readTest('sites.json')
		})

		it('read points', function (): void {
			console.log()
			readTest('points.zinc')
			readTest('points.json')
		})

		it('read licenses', function (): void {
			console.log()
			readTest('lics.zinc')
		})
	}) // read from zinc files
}) // ZincReader

/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	makeValue,
	toTagName,
	isValidTagName,
	dictToDis,
	LocalizedCallback,
	macro,
	disKey,
	makeDefaultValue,
} from '../../src/core/util'
import { Kind } from '../../src/core/Kind'
import { HBool } from '../../src/core/HBool'
import { HStr } from '../../src/core/HStr'
import { HNum } from '../../src/core/HNum'
import { HDate } from '../../src/core/HDate'
import { HRef } from '../../src/core/HRef'
import { HUri } from '../../src/core/HUri'
import { HTime } from '../../src/core/HTime'
import { HDateTime } from '../../src/core/HDateTime'
import { HMarker } from '../../src/core/HMarker'
import { HRemove } from '../../src/core/HRemove'
import { HCoord } from '../../src/core/HCoord'
import { HXStr } from '../../src/core/HXStr'
import { HSymbol } from '../../src/core/HSymbol'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import { HVal } from '../../src/core/HVal'
import { HNa } from '../../src/core/HNa'
import { HGrid } from '../../src/core/HGrid'

describe('util', function (): void {
	describe('makeValue()', function (): void {
		it('returns an HBool.TRUE for a true boolean', function (): void {
			expect(makeValue(true)).toBe(HBool.make(true))
		})

		it('returns an HBool.FALSE for a true boolean', function (): void {
			expect(makeValue(false)).toBe(HBool.make(false))
		})

		it('returns an HDate for a string value', function (): void {
			expect(
				makeValue({ _kind: Kind.Date, val: '2020-12-01' })?.equals(
					HDate.make('2020-12-01')
				)
			).toBe(true)
		})

		it('returns an HDate for a string value using old Hayson encoding', function (): void {
			expect(
				makeValue({ _kind: 'date', val: '2020-12-01' })?.equals(
					HDate.make('2020-12-01')
				)
			).toBe(true)
		})

		it('returns an HNum for a numeric value', function (): void {
			expect(makeValue(12.3)).toEqual(HNum.make(12.3))
		})

		it('returns an HNum with a unit for a numeric value', function (): void {
			expect(
				makeValue({ _kind: Kind.Number, val: 12.3, unit: 'm' })
			).toEqual(HNum.make(12.3, 'm'))
		})

		it('returns an HNum with a unit for a numeric value using old Hayson encoding', function (): void {
			expect(
				makeValue({ _kind: 'Number', val: 12.3, unit: 'm' })
			).toEqual(HNum.make(12.3, 'm'))
		})

		it('returns an HRef for a string value', function (): void {
			expect(makeValue({ _kind: Kind.Ref, val: 'demo' })).toEqual(
				HRef.make('demo')
			)
		})

		it('returns an HRef for a string value using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Ref', val: 'demo' })).toEqual(
				HRef.make('demo')
			)
		})

		it('returns an HStr for a string value', function (): void {
			expect(makeValue('test')).toEqual(HStr.make('test'))
		})

		it('returns an HTime for a string value', function (): void {
			expect(makeValue({ _kind: Kind.Time, val: '12:00:00' })).toEqual(
				HTime.make('12:00:00')
			)
		})

		it('returns an HTime for a string value using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Time', val: '12:00:00' })).toEqual(
				HTime.make('12:00:00')
			)
		})

		it('returns an HUri for a string value', function (): void {
			expect(
				makeValue({
					_kind: Kind.Uri,
					val: 'https://news.bbc.co.uk',
				})?.equals(HUri.make('https://news.bbc.co.uk'))
			).toBe(true)
		})

		it('returns an HUri for a string value using old hayson encoding', function (): void {
			expect(
				makeValue({
					_kind: 'Uri',
					val: 'https://news.bbc.co.uk',
				})?.equals(HUri.make('https://news.bbc.co.uk'))
			).toBe(true)
		})

		it('returns an HDateTime for a string value', function (): void {
			expect(
				makeValue({
					_kind: Kind.DateTime,
					val: '2009-11-09T15:39:00Z',
				})?.equals(HDateTime.make('2009-11-09T15:39:00Z'))
			).toBe(true)
		})

		it('returns an HDateTime for a string value', function (): void {
			expect(
				makeValue({
					_kind: 'DateTime',
					val: '2009-11-09T15:39:00Z',
				})?.equals(HDateTime.make('2009-11-09T15:39:00Z'))
			).toBe(true)
		})

		it('returns an HMarker for a marker kind', function (): void {
			expect(makeValue({ _kind: Kind.Marker })).toBe(HMarker.make())
		})

		it('returns an HMarker for a marker kind using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Marker' })).toBe(HMarker.make())
		})

		it('returns an HRemove for a remove kind', function (): void {
			expect(makeValue({ _kind: Kind.Remove })).toBe(HRemove.make())
		})

		it('returns an HRemove for a remove kind using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Remove' })).toBe(HRemove.make())
		})

		it('returns an HCoord for a coord kind', function (): void {
			expect(makeValue({ _kind: Kind.Coord, lat: 2, lng: 3 })).toEqual(
				HCoord.make({ latitude: 2, longitude: 3 })
			)
		})

		it('returns an HCoord for a coord kind using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Coord', lat: 2, lng: 3 })).toEqual(
				HCoord.make({ latitude: 2, longitude: 3 })
			)
		})

		it('returns an HXStr for a xstring kind', function (): void {
			expect(
				makeValue({ _kind: Kind.XStr, val: 'value', type: 'type' })
			).toEqual(HXStr.make('type', 'value'))
		})

		it('returns an HXStr for a xstring kind using old Hayson encoding', function (): void {
			expect(
				makeValue({ _kind: 'XStr', val: 'value', type: 'type' })
			).toEqual(HXStr.make('type', 'value'))
		})

		it('returns an HBin for a xstring kind', function (): void {
			expect(
				makeValue({
					_kind: Kind.Bin,
					type: 'Bin',
					val: 'application/json',
				})
			).toEqual(HXStr.make('Bin', 'application/json'))
		})

		it('returns an HBin for a xstring kind using old Hayson encoding', function (): void {
			expect(
				makeValue({
					_kind: 'Bin',
					type: 'Bin',
					val: 'application/json',
				})
			).toEqual(HXStr.make('Bin', 'application/json'))
		})

		it('returns an HSymbol for a def kind', function (): void {
			expect(makeValue({ _kind: Kind.Symbol, val: 'foo' })).toEqual(
				HSymbol.make('foo')
			)
		})

		it('returns an HSymbol for a def kind using old Hayson encoding', function (): void {
			expect(makeValue({ _kind: 'Symbol', val: 'foo' })).toEqual(
				HSymbol.make('foo')
			)
		})

		it('returns a list from an array of haystack values', function (): void {
			expect(makeValue(['foo'])).toEqual(HList.make(HStr.make('foo')))
		})

		it('returns null for a null value', function (): void {
			expect(makeValue(null)).toBeNull()
		})
	}) // makeValue

	describe('toTagName()', function (): void {
		it('converts an empty string to empty', function (): void {
			expect(toTagName('')).toBe('empty')
		})

		it('converts a string with all illegal characters to empty', function (): void {
			expect(toTagName('!"??$%^')).toBe('empty')
		})

		it('converts a sentance into a camel case string', function (): void {
			expect(toTagName('oh what a time to be alive')).toBe(
				'ohWhatATimeToBeAlive'
			)
		})

		it('does not convert any snake case strings with underscores', function (): void {
			expect(toTagName('oh_what_a_time_to_be_alive')).toBe(
				'oh_what_a_time_to_be_alive'
			)
		})

		it('removes illegal characters', function (): void {
			expect(toTagName('??$%test&*( this!')).toBe('testThis')
		})

		describe('ensure first character', function (): void {
			it('is lowercase', function (): void {
				expect(toTagName('Hello')).toBe('hello')
			})

			it('converts 1 to one', function (): void {
				expect(toTagName('1test')).toBe('onetest')
			})

			it('converts 2 to two', function (): void {
				expect(toTagName('2test')).toBe('twotest')
			})

			it('converts 3 to three', function (): void {
				expect(toTagName('3test')).toBe('threetest')
			})

			it('converts 4 to four', function (): void {
				expect(toTagName('4test')).toBe('fourtest')
			})

			it('converts 5 to five', function (): void {
				expect(toTagName('5test')).toBe('fivetest')
			})

			it('converts 6 to six', function (): void {
				expect(toTagName('6test')).toBe('sixtest')
			})

			it('converts 7 to seven', function (): void {
				expect(toTagName('7test')).toBe('seventest')
			})

			it('converts 8 to eight', function (): void {
				expect(toTagName('8test')).toBe('eighttest')
			})

			it('converts 9 to nine', function (): void {
				expect(toTagName('9test')).toBe('ninetest')
			})

			it('converts one big number to a usable name', function (): void {
				expect(toTagName('0123456789')).toBe('zero123456789')
			})

			it('converts underscore to us', function (): void {
				expect(toTagName('_foo')).toBe('usfoo')
			})
		})
	}) // toTagName()

	describe('makeDefaultValue()', function (): void {
		it('returns a string', function (): void {
			expect(makeDefaultValue(Kind.Str)?.equals(HStr.make(''))).toBe(true)
		})

		it('returns a number zero with no units', function (): void {
			expect(makeDefaultValue(Kind.Number)?.equals(HNum.make(0))).toBe(
				true
			)
		})

		it('returns a date', function (): void {
			expect(makeDefaultValue(Kind.Date)?.getKind()).toBe(Kind.Date)
		})

		it('returns a time object', function (): void {
			expect(makeDefaultValue(Kind.Time)?.getKind()).toBe(Kind.Time)
		})

		it('returns an empty URI', function (): void {
			expect(makeDefaultValue(Kind.Uri)?.equals(HUri.make(''))).toBe(true)
		})

		it('returns an empty ref', function (): void {
			expect(makeDefaultValue(Kind.Ref)?.equals(HRef.make(''))).toBe(true)
		})

		it('returns a true boolean', function (): void {
			expect(makeDefaultValue(Kind.Bool)?.equals(HBool.make(true))).toBe(
				true
			)
		})

		it('returns an empty dict', function (): void {
			expect(makeDefaultValue(Kind.Dict)?.equals(HDict.make())).toBe(true)
		})

		it('returns a date time object', function (): void {
			expect(makeDefaultValue(Kind.DateTime)?.getKind()).toBe(
				Kind.DateTime
			)
		})

		it('returns a marker', function (): void {
			expect(makeDefaultValue(Kind.Marker)?.equals(HMarker.make())).toBe(
				true
			)
		})

		it('returns a remove', function (): void {
			expect(makeDefaultValue(Kind.Remove)?.equals(HRemove.make())).toBe(
				true
			)
		})

		it('returns an NA', function (): void {
			expect(makeDefaultValue(Kind.NA)?.equals(HNa.make())).toBe(true)
		})

		it('returns an empty co-ordinate', function (): void {
			expect(
				makeDefaultValue(Kind.Coord)?.equals(
					HCoord.make({ latitude: 0, longitude: 0 })
				)
			).toBe(true)
		})

		it('returns an XStr value from a XStr', function (): void {
			expect(makeDefaultValue(Kind.XStr)?.equals(HXStr.make(''))).toBe(
				true
			)
		})

		it('returns an XStr value from a Bin', function (): void {
			expect(makeDefaultValue(Kind.Bin)?.equals(HXStr.make(''))).toBe(
				true
			)
		})

		it('returns an empty symbol', function (): void {
			expect(
				makeDefaultValue(Kind.Symbol)?.equals(HSymbol.make(''))
			).toBe(true)
		})

		it('returns an empty list', function (): void {
			expect(makeDefaultValue(Kind.List)?.equals(HList.make())).toBe(true)
		})

		it('returns an empty grid', function (): void {
			expect(makeDefaultValue(Kind.Grid)?.equals(HGrid.make())).toBe(true)
		})

		it('returns undefined for an unknown kind', function (): void {
			expect(
				makeDefaultValue('foobar' as unknown as Kind)
			).toBeUndefined()
		})
	}) // makeDefaultValue()

	describe('isValidTagName()', function (): void {
		it('returns false for an empty string', function (): void {
			expect(isValidTagName('')).toBe(false)
		})

		it('returns true a single character tag name', function (): void {
			expect(isValidTagName('a')).toBe(true)
		})

		it('returns true for a valid tag', function (): void {
			expect(isValidTagName('aValidTag123')).toBe(true)
		})

		it('returns false for string with spaces', function (): void {
			expect(isValidTagName('what a wonderful world')).toBe(false)
		})

		it('returns false when the first letter is upper case', function (): void {
			expect(isValidTagName('AValidTag')).toBe(false)
		})

		it('returns false when the first letter is a number', function (): void {
			expect(isValidTagName('1ValidTag')).toBe(false)
		})

		it('returns false when the name has illegal characters', function (): void {
			expect(isValidTagName('aTa??$%g')).toBe(false)
		})
	}) // isValidTagName()

	describe('dictToDis()', function (): void {
		it('returns dis', function (): void {
			expect(dictToDis(new HDict({ dis: 'dis' }))).toBe('dis')
		})

		it('returns name', function (): void {
			expect(dictToDis(new HDict({ name: 'name' }))).toBe('name')
		})

		it('returns disMacro', function (): void {
			expect(dictToDis(new HDict({ disMacro: '$tag', tag: 'tag' }))).toBe(
				'tag'
			)
		})

		it('returns disKey', function (): void {
			expect(dictToDis(new HDict({ disKey: 'disKey' }))).toBe('disKey')
		})

		it('returns disKey from i18n', function (): void {
			const i18n = () => 'test'
			expect(
				dictToDis(new HDict({ disKey: 'pod::key' }), undefined, i18n)
			).toBe('test')
		})

		it('returns def', function (): void {
			expect(dictToDis(new HDict({ def: 'def' }))).toBe('def')
		})

		it('returns tag', function (): void {
			expect(dictToDis(new HDict({ tag: 'tag' }))).toBe('tag')
		})

		it('returns id display name', function (): void {
			expect(dictToDis(new HDict({ id: HRef.make('ref', 'dis') }))).toBe(
				'dis'
			)
		})
	}) // dictToDis()

	describe('macro()', function (): void {
		function makeGetValue(dict: HDict): (key: string) => HVal | undefined {
			return (key: string) => dict.get(key)
		}

		it('replaces tags', function (): void {
			const scope = new HDict({ tag: 'tag' })
			expect(macro('$tag$tag $tag something', makeGetValue(scope))).toBe(
				'tagtag tag something'
			)
		})

		it('does not replace tags when not found', function (): void {
			const scope = new HDict({ tag: 'tag' })
			expect(macro('$foo$foo $foo something', makeGetValue(scope))).toBe(
				'$foo$foo $foo something'
			)
		})

		it('skips non-tag names', function (): void {
			const scope = new HDict({ Tag: 'foo' })
			expect(macro('$Tag', makeGetValue(scope))).toBe('$Tag')
		})

		it('replaces tags in braces', function (): void {
			const scope = new HDict({ tag: 'tag' })
			expect(
				macro('${tag}${tag} ${tag} something', makeGetValue(scope))
			).toBe('tagtag tag something')
		})

		it('does not replace tags in braces when not found', function (): void {
			const scope = new HDict({ tag: 'tag' })
			expect(
				macro('${foo}${foo} ${foo} something', makeGetValue(scope))
			).toBe('${foo}${foo} ${foo} something')
		})

		it('replaces with localized values', function (): void {
			const i18n = jest.fn().mockReturnValue('tag')

			expect(
				macro(
					'$<pod::key>$<pod::key> $<pod::key> something',
					makeGetValue(new HDict()),
					i18n
				)
			).toBe('tagtag tag something')

			expect(i18n).toHaveBeenCalledWith('pod', 'key')
		})

		it('does not replace localized values when not found', function (): void {
			const i18n = jest.fn().mockReturnValue(undefined)

			expect(
				macro(
					'$<pod::key>$<pod::key> $<pod::key> something',
					makeGetValue(new HDict()),
					i18n
				)
			).toBe('$<pod::key>$<pod::key> $<pod::key> something')
		})

		it('replaces ref with ref dis', function (): void {
			const scope = new HDict({ ref: HRef.make('id', 'Id') })
			expect(macro('$ref$ref $ref something', makeGetValue(scope))).toBe(
				'IdId Id something'
			)
		})
	}) // macro()

	describe('disKey()', function (): void {
		let i18n: LocalizedCallback

		beforeEach(function (): void {
			i18n = jest.fn().mockReturnValue('test')
		})

		it('returns a localized string', function (): void {
			expect(disKey('pod::key', i18n)).toBe('test')
		})

		it('calls the internal localization function', function (): void {
			disKey('pod::key', i18n)
			expect(i18n).toHaveBeenCalledWith('pod', 'key')
		})

		it('returns undefiend if not formatted properly', function (): void {
			expect(disKey('pod:key', i18n)).toBeUndefined()
		})
	}) // disKey()
})

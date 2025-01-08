/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HDateTime } from '../../src/core/HDateTime'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'
import { DateTime } from 'luxon'

describe('HDateTime', function (): void {
	describe('.make()', function (): void {
		it('create a new date time object from a string', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').value).toEqual(
				'2009-11-09T15:39:00Z'
			)
		})

		it('create a new date time object from an invalid string', function (): void {
			expect((): void => {
				HDateTime.make('2009-11-09T15(39:00Z')
			}).toThrow()
		})

		it('create a new date time object from a date object', function (): void {
			expect(
				HDateTime.make(new Date('2009-11-09T15:39:00Z')).value
			).toEqual('2009-11-09T15:39:00.000Z')
		})

		it('create a date time object from a Hayson object with timezone', function (): void {
			expect(
				HDateTime.make({
					_kind: Kind.DateTime,
					val: '2010-11-28T07:23:02.773-08:00',
					tz: 'Los_Angeles',
				}).equals(
					HDateTime.make('2010-11-28T07:23:02.773-08:00 Los_Angeles')
				)
			).toBe(true)
		})

		it('create a date time object from a Hayson object without', function (): void {
			expect(
				HDateTime.make({
					_kind: Kind.DateTime,
					val: '2010-11-28T07:23:02.773-08:00',
				}).equals(HDateTime.make('2010-11-28T07:23:02.773-08:00'))
			).toBe(true)
		})

		it('create a haystack date from a haystack date', function (): void {
			const dateTime = HDateTime.make('2009-11-09T15:39:00Z')
			expect(HDateTime.make(dateTime)).toBe(dateTime)
		})

		it('throws an error for a date time without an offset', function (): void {
			expect(() => HDateTime.make('2009-11-09T15:39:00')).toThrow()
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting change the date value', function (): void {
			const dateTime = HDateTime.make('2009-11-09T15:39:00Z')

			expect((): void => {
				dateTime.value = '2010-11-09T15:39:00Z'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the date time as a string', function (): void {
			const dateTime = HDateTime.make('2009-11-09T15:39:00Z')
			expect(dateTime.valueOf()).toBe('2009-11-09T15:39:00Z')
		})
	})

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(
				typeof HDateTime.make('2009-11-09T15:39:00Z').toString()
			).toBe('string')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').equals(
					null as unknown as HDateTime
				)
			).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').equals(
					undefined as unknown as HDateTime
				)
			).toBe(false)
		})

		it('string returns false', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').equals(
					'2009-11-09T15:39:00Z' as unknown as HDateTime
				)
			).toBe(false)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').compareTo(
					HDateTime.make('2009-11-10T15:39:00Z')
				)
			).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(
				HDateTime.make('2009-11-10T15:39:00Z').compareTo(
					HDateTime.make('2009-11-09T15:39:00Z')
				)
			).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').compareTo(
					HDateTime.make('2009-11-09T15:39:00Z')
				)
			).toBe(0)
		})

		it('returns -1 for different timezone offsets for 10am compared to 11am', function (): void {
			expect(
				HDateTime.make('2022-02-01T12:00:00+02:00').compareTo(
					HDateTime.make('2022-02-01T12:00:00+01:00')
				)
			).toBe(-1)
		})

		it('returns 1 for different timezone offsets for 10am compared to 4am', function (): void {
			expect(
				HDateTime.make('2022-02-01T12:00:00+02:00').compareTo(
					HDateTime.make('2022-02-01T12:01:00+08:00')
				)
			).toBe(1)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error when encoded as a filter value', function (): void {
			expect((): void => {
				HDateTime.make('2009-11-09T15:39:00Z').toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').toZinc()).toBe(
				'2009-11-09T15:39:00Z'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').toJSON()).toEqual({
				_kind: Kind.DateTime,
				val: '2009-11-09T15:39:00Z',
			})
		})

		it('returns JSON with timezone', function (): void {
			expect(
				HDateTime.make(
					'2010-11-28T07:23:02.773-08:00 Los_Angeles'
				).toJSON()
			).toEqual({
				_kind: Kind.DateTime,
				val: '2010-11-28T07:23:02.773-08:00',
				tz: 'Los_Angeles',
			})
		})

		it('returns JSON with no timezone when empty', function (): void {
			expect(
				HDateTime.make({
					_kind: Kind.DateTime,
					val: '2010-11-28T07:23:02.773Z',
					tz: '',
				}).toJSON()
			).toEqual({
				_kind: Kind.DateTime,
				val: '2010-11-28T07:23:02.773Z',
			})
		})
	}) // #toJSON()

	describe('#toJSONString()', function (): void {
		it('returns a JSON string', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').toJSONString()).toBe(
				JSON.stringify({
					_kind: Kind.DateTime,
					val: '2009-11-09T15:39:00Z',
				})
			)
		})
	}) // #toJSONString()

	describe('#toJSONv3()', () => {
		it('returns a string', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').toJSONv3()).toBe(
				't:2009-11-09T15:39:00Z'
			)
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HDateTime.make('2009-11-09T15:39:00Z').toAxon()).toBe(
				'dateTime(2009-11-09,15:39:00,"UTC")'
			)
		})

		it('returns an Axon string with the timezone set to UTC', function (): void {
			expect(
				HDateTime.make({
					_kind: Kind.DateTime,
					val: '2009-11-09T15:39:00Z',
					tz: 'London',
				}).toAxon()
			).toBe('dateTime(2009-11-09,15:39:00,"UTC")')
		})

		it('returns an Axon string with an offset and the timezone set to UTC', function () {
			expect(
				HDateTime.make(
					'2021-04-14T07:42:46.275-05:00 New_York'
				).toAxon()
			).toBe('dateTime(2021-04-14,12:42:46.275,"UTC")')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').isKind(Kind.DateTime)
			).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(
				HDateTime.make('2009-11-09T15:39:00Z').isKind(Kind.Dict)
			).toBe(false)
		})
	}) // #isKind()

	describe('#iso', function (): void {
		it('returns ISO 8601 date formatted date time string from date time with timezone', function (): void {
			expect(
				HDateTime.make('2010-11-28T07:23:02.773-08:00 Los_Angeles').iso
			).toBe('2010-11-28T07:23:02.773-08:00')
		})

		it('returns ISO 8601 date formatted date time string from date time with no timezone', function (): void {
			expect(HDateTime.make('2010-11-28T07:23:02.773-08:00').iso).toBe(
				'2010-11-28T07:23:02.773-08:00'
			)
		})

		it('returns ISO 8601 date formatted date time string from UTC date time', function (): void {
			expect(HDateTime.make('2010-01-08T05:00:00Z').iso).toBe(
				'2010-01-08T05:00:00Z'
			)
		})
	}) // #iso

	describe('#timezone', function (): void {
		it('returns timezone from date time with timezone', function (): void {
			expect(
				HDateTime.make('2010-11-28T07:23:02.773-08:00 Los_Angeles')
					.timezone
			).toBe('Los_Angeles')
		})

		it('returns GMT offset timezone from date time with no timezone', function (): void {
			expect(
				HDateTime.make('2010-11-28T07:23:02.773-08:00').timezone
			).toBe('GMT+8')
		})

		it('returns timezone from UTC date time', function (): void {
			expect(HDateTime.make('2010-01-08T05:00:00Z').timezone).toBe('UTC')
		})
	}) // #timezone

	describe('#date', function (): void {
		it('returns a JS Date object from date time with timezone', function (): void {
			expect(
				HDateTime.make('2010-11-28T07:23:02.773-08:00 Los_Angeles').date
			).toEqual(new Date('2010-11-28T07:23:02.773-08:00'))
		})

		it('returns a JS Date object from date time with no timezone', function (): void {
			expect(HDateTime.make('2010-11-28T07:23:02.773Z').date).toEqual(
				new Date('2010-11-28T07:23:02.773Z')
			)
		})
	}) // #date

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(
				HDateTime.make(
					'2010-11-28T07:23:02.773-08:00 Los_Angeles'
				).matches('item')
			).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(
				HDateTime.make(
					'2010-11-28T07:23:02.773-08:00 Los_Angeles'
				).matches('itemm')
			).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const dateTime = HDateTime.make('2010-11-28T07:23:02.773Z')
			expect(dateTime.newCopy()).toBe(dateTime)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const dateTime = HDateTime.make('2010-11-28T07:23:02.773Z')
			expect(dateTime.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: dateTime })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const dateTime = HDateTime.make('2010-11-28T07:23:02.773Z')
			expect(dateTime.toList()).toValEqual(HList.make([dateTime]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const dateTime = HDateTime.make('2010-11-28T07:23:02.773Z')
			expect(dateTime.toDict()).toValEqual(HDict.make({ val: dateTime }))
		})
	}) // #toDict()

	describe('.getIANATimeZone()', function (): void {
		describe('luxon', function (): void {
			const isValidTimeZone = (timezone: string): boolean =>
				!!DateTime.now().setZone(timezone).isValid

			const getTimeZone = (timezone: string): string =>
				HDateTime.getIANATimeZone(timezone, isValidTimeZone)

			it('returns a valid timezone', function (): void {
				expect(getTimeZone('America/New_York')).toBe('America/New_York')
			})

			it('returns a valid timezone from an alias', function (): void {
				expect(getTimeZone('New_York')).toBe('America/New_York')
			})

			it('returns an empty string for an invalid timezone', function (): void {
				expect(getTimeZone('FooBar')).toBe('')
			})
		}) // luxon

		describe('Intl', function (): void {
			it('returns a valid timezone', function (): void {
				expect(HDateTime.getIANATimeZone('America/New_York')).toBe(
					'America/New_York'
				)
			})

			it('returns a valid timezone from an alias', function (): void {
				expect(HDateTime.getIANATimeZone('New_York')).toBe(
					'America/New_York'
				)
			})

			it('returns an empty string for an invalid timezone', function (): void {
				expect(HDateTime.getIANATimeZone('FooBar')).toBe('')
			})
		}) // Intl
	}) // .getIANATimeZone()

	describe('#getIANATimeZone()', function (): void {
		it('returns a valid timezone', function (): void {
			expect(
				HDateTime.make(
					'2021-04-14T07:42:46.275-05:00 New_York'
				).getIANATimeZone()
			).toBe('America/New_York')
		})
	}) // #getIANATimeZone()

	describe('.getTimezoneDb()', function (): void {
		it('returns the timezone for London', function (): void {
			const result = HDateTime.getTimezoneDb().filter('name == "London"')

			expect(result.first?.toJSON()).toEqual({
				name: 'London',
				fullName: 'Europe/London',
			})
		})
	}) // .getTimezoneDb()
})

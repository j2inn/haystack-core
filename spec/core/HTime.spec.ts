/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HTime } from '../../src/core/HTime'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import '../matchers'
import '../customMatchers'

describe('HTime', function (): void {
	describe('.make()', function (): void {
		it('make a haystack time', function (): void {
			expect(HTime.make('12:00:00') instanceof HTime).toBe(true)
		})
	}) // .make()

	describe('.make()', function (): void {
		it('create a new time object from a JS date object', function (): void {
			expect(HTime.make(new Date('2009-11-09T15:39:00Z')).value).toEqual(
				'15:39:00'
			)
		})

		it('create a new time object from a JS date object with a timezone offset', function (): void {
			expect(
				HTime.make(new Date('2009-11-09T09:45:00-08:00')).value
			).toEqual('17:45:00')
		})

		it('create a new time object from a string', function (): void {
			expect(HTime.make('12:00:00').value).toBe('12:00:00')
		})

		it('create a new time object from an invalid string', function (): void {
			expect((): void => {
				HTime.make('12-00:00')
			}).toThrow()
		})

		it('create a new time object from an object literal', function (): void {
			expect(
				HTime.make({
					hours: 12,
					minutes: 1,
					seconds: 2,
				}).equals(HTime.make('12:01:02'))
			)
		})

		it('create a new time object from a hayson object', function (): void {
			expect(
				HTime.make({
					_kind: Kind.Time,
					val: '12:01:02',
				}).equals(HTime.make('12:01:02'))
			)
		})

		it('create a haystack time object from a haystack time object', function (): void {
			const time = HTime.make('12:00:00')
			expect(HTime.make(time)).toBe(time)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the value', function (): void {
			const time = HTime.make('12:00:00')

			expect((): void => {
				time.value = '12:00:01'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the instance', function (): void {
			const time = HTime.make('12:00:00')
			expect(time.valueOf()).toBe('12:00:00')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(HTime.make('12:00:00').toString()).toBe('12:00:00')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(
				HTime.make('12:00:00').equals((null as unknown) as HTime)
			).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(
				HTime.make('12:00:00').equals((undefined as unknown) as HTime)
			).toBe(false)
		})

		it('string returns false', function (): void {
			expect(
				HTime.make('12:00:00').equals(('12:00:00' as unknown) as HTime)
			).toBe(false)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(
				HTime.make('12:00:00').compareTo(HTime.make('12:00:01'))
			).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(
				HTime.make('12:00:01').compareTo(HTime.make('12:00:00'))
			).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(
				HTime.make('12:00:00').compareTo(HTime.make('12:00:00'))
			).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a string', function (): void {
			expect(HTime.make('12:00:00').toFilter()).toBe('12:00:00')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HTime.make('12:00:00').toZinc()).toBe('12:00:00')
		})

		it('returns a string from a time originally created with an object with single digit hours', function (): void {
			expect(HTime.make({ hours: 0, minutes: 0 }).toZinc()).toBe(
				'00:00:00'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HTime.make('12:00:00').toJSON()).toEqual({
				_kind: Kind.Time,
				val: '12:00:00',
			})
		})
	}) // #toJSON()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HTime.make('12:00:00').toAxon()).toEqual('12:00:00')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HTime.make('12:00:00').isKind(Kind.Time)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HTime.make('12:00:00').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#hours', function (): void {
		it('returns the hours', function (): void {
			expect(HTime.make('12:00:00').hours).toBe(12)
		})
	}) // #hours

	describe('#minutes', function (): void {
		it('returns the minutes', function (): void {
			expect(HTime.make('12:34:00').minutes).toBe(34)
		})
	}) // #minutes

	describe('#seconds', function (): void {
		it('returns the seconds', function (): void {
			expect(HTime.make('12:34:56').seconds).toBe(56)
		})
	}) // #seconds

	describe('#milliseconds', function (): void {
		it('returns the milliseconds', function (): void {
			expect(HTime.make('12:34:56.123').milliseconds).toBe(123)
		})

		it('returns zero when not specified', function (): void {
			expect(HTime.make('12:34:56').milliseconds).toBe(0)
		})
	}) // #milliseconds

	describe('#matches()', function (): void {
		it('returns true when the time matches', function (): void {
			expect(HTime.make('12:34:56').matches('item == 12:34:56')).toBe(
				true
			)
		})

		it('returns false when the time does not match', function (): void {
			expect(HTime.make('12:34:55').matches('item == 12:34:56')).toBe(
				false
			)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const time = HTime.make('12:34:56')
			expect(time.newCopy()).toBe(time)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const time = HTime.make('12:34:56')
			expect(time.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: time })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const time = HTime.make('12:34:56')
			expect(time.toList()).toValEqual(HList.make([time]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const time = HTime.make('12:34:56')
			expect(time.toDict()).toValEqual(HDict.make({ val: time }))
		})
	}) // #toDict()
})

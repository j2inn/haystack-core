/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HDate } from '../../src/core/HDate'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/list/HList'
import { HDict } from '../../src/core/dict/HDict'
import { TEXT_ENCODER } from '../../src/core/HVal'

import '../matchers'
import '../customMatchers'

describe('HDate', function (): void {
	describe('#make()', function (): void {
		it('create a new date object from a JS date object', function (): void {
			expect(HDate.make(new Date('2009-11-09T15:39:00Z')).value).toEqual(
				'2009-11-09'
			)
		})

		it('create a new date object from a string', function (): void {
			expect(HDate.make('2020-01-01').value).toBe('2020-01-01')
		})

		it('create a new date object from an invalid string', function (): void {
			expect((): void => {
				HDate.make('2020-01:01')
			}).toThrow()
		})

		it('create a new date object from a hayson object', function (): void {
			expect(
				HDate.make({ _kind: Kind.Date, val: '2020-01-01' }).value
			).toBe('2020-01-01')
		})

		it('creates a haystack date from a haystack date', function (): void {
			const date = HDate.make('2020-01-01')
			expect(HDate.make(date)).toBe(date)
		})

		describe('object literal', function (): void {
			it('create a new date object', function (): void {
				expect(HDate.make({ year: 2020, month: 1, day: 2 }).value).toBe(
					'2020-01-02'
				)
			})

			it('throws an error for an invalid year', function (): void {
				expect((): void => {
					HDate.make({ year: -1, month: 1, day: 2 })
				}).toThrow()
			})

			it('throws an error for an invalid month that is too high', function (): void {
				expect((): void => {
					HDate.make({ year: 2020, month: 13, day: 2 })
				}).toThrow()
			})

			it('throws an error for an invalid month that is too low', function (): void {
				expect((): void => {
					HDate.make({ year: 2020, month: 0, day: 2 })
				}).toThrow()
			})

			it('throws an error for an invalid day that is too low', function (): void {
				expect((): void => {
					HDate.make({ year: 2020, month: 0, day: 0 })
				}).toThrow()
			})

			it('throws an error for an invalid day that is too high', function (): void {
				expect((): void => {
					HDate.make({ year: 2020, month: 0, day: 32 })
				}).toThrow()
			})
		})
	}) // #make()

	describe('.make()', function (): void {
		it('makes a haystack date', function (): void {
			expect(HDate.make('2020-01-01') instanceof HDate).toBe(true)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the date value', function (): void {
			const date = HDate.make('2020-01-01')

			expect((): void => {
				date.value = '2020-01-02'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the date encoded as a string', function (): void {
			const date = HDate.make('2020-01-01')
			expect(date.valueOf()).toBe('2020-01-01')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(typeof HDate.make('2020-01-01').toString()).toBe('string')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(
				HDate.make('2020-01-01').equals(null as unknown as HDate)
			).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(
				HDate.make('2020-01-01').equals(undefined as unknown as HDate)
			).toBe(false)
		})

		it('string returns false', function (): void {
			expect(
				HDate.make('2020-01-01').equals(
					'2020-01-01' as unknown as HDate
				)
			).toBe(false)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(
				HDate.make('2020-01-01').compareTo(HDate.make('2020-01-02'))
			).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(
				HDate.make('2020-01-02').compareTo(HDate.make('2020-01-01'))
			).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(
				HDate.make('2020-01-01').compareTo(HDate.make('2020-01-01'))
			).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a string', function (): void {
			expect(HDate.make('2020-01-01').toFilter()).toBe('2020-01-01')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HDate.make('2020-01-01').toZinc()).toBe('2020-01-01')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HDate.make('2020-01-01').toJSON()).toEqual({
				_kind: Kind.Date,
				val: '2020-01-01',
			})
		})
	}) // #toJSON()

	describe('#toJSONString()', function (): void {
		it('returns a JSON string', function (): void {
			expect(HDate.make('2020-01-01').toJSONString()).toBe(
				JSON.stringify({
					_kind: Kind.Date,
					val: '2020-01-01',
				})
			)
		})
	}) // #toJSONString()

	describe('#toJSONUint8Array()', function (): void {
		it('returns a JSON byte buffer', function (): void {
			expect(HDate.make('2020-01-01').toJSONUint8Array()).toEqual(
				TEXT_ENCODER.encode(
					JSON.stringify({
						_kind: Kind.Date,
						val: '2020-01-01',
					})
				)
			)
		})
	}) // #toJSONUint8Array()

	describe('#toJSONv3()', function (): void {
		it('returns a string', function (): void {
			expect(HDate.make('2020-01-01').toJSONv3()).toBe('d:2020-01-01')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HDate.make('2020-01-01').toAxon()).toBe('2020-01-01')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HDate.make('2020-01-01').isKind(Kind.Date)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HDate.make('2020-01-01').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#year', function (): void {
		it('returns the year', function (): void {
			expect(HDate.make('2020-01-01').year).toBe(2020)

			expect(HDate.make({ year: 2022, month: 10, day: 10 }).year).toBe(
				2022
			)
		})
	}) // #year

	describe('#month', function (): void {
		it('returns the year', function (): void {
			expect(HDate.make('2020-02-01').month).toBe(2)

			expect(HDate.make({ year: 2022, month: 10, day: 10 }).month).toBe(
				10
			)
		})
	}) // #month

	describe('#day', function (): void {
		it('returns the day', function (): void {
			expect(HDate.make('2020-01-15').day).toBe(15)

			expect(HDate.make({ year: 2022, month: 10, day: 10 }).day).toBe(10)
		})
	}) // #day

	describe('#matches()', function (): void {
		it('returns true when the date matches', function (): void {
			expect(HDate.make('2020-02-01').matches('item == 2020-02-01')).toBe(
				true
			)
		})

		it('returns false when the date does not match', function (): void {
			expect(HDate.make('2020-02-02').matches('item == 2020-02-01')).toBe(
				false
			)
		})

		it('returns false when the item does not match', function (): void {
			expect(
				HDate.make('2020-02-02').matches('itemm == 2020-02-01')
			).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const date = HDate.make('2020-02-02')
			expect(date.newCopy()).toBe(date)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const date = HDate.make('2020-02-02')
			expect(date.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: date })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const date = HDate.make('2020-02-02')
			expect(date.toList()).toValEqual(HList.make([date]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const date = HDate.make('2020-02-02')
			expect(date.toDict()).toValEqual(HDict.make({ val: date }))
		})
	}) // #toDict()
})

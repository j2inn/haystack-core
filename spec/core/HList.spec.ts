/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

import { HList } from '../../src/core/HList'
import { HNum } from '../../src/core/HNum'
import { HMarker } from '../../src/core/HMarker'
import { HStr } from '../../src/core/HStr'
import { HVal, valueIsKind } from '../../src/core/HVal'
import { Kind } from '../../src/core/Kind'
import { HRemove } from '../../src/core/HRemove'
import { HFilter } from '../../src/filter/HFilter'
import '../matchers'
import '../customMatchers'
import { HDict } from '../../src/core/dict/HDict'
import { HGrid } from '../../src/core/HGrid'
import { HaysonList } from '../../src/core/hayson'

describe('HList', function (): void {
	let list: HList
	let values: HVal[]

	beforeEach(function (): void {
		values = [HStr.make('foovalue'), HNum.make(99), HMarker.make()]
		list = HList.make(values)
	})

	describe('#constructor()', function (): void {
		it('creates a list from an array of values', function (): void {
			expect(new HList(values).values).toEqual(values)
		})

		it('creates an empty list from no arguments', function (): void {
			expect(new HList()).toEqual(HList.make([]))
		})

		it('creates with null arguments', function (): void {
			expect(new HList([null])).toEqual(new HList([null]))
		})

		it('filters out undefined arguments', function (): void {
			const array = [
				HStr.make('foovalue'),
				HNum.make(99),
				HMarker.make(),
				undefined,
			] as unknown as HaysonList

			expect(new HList(array)).toEqual(list)
		})

		it('creates a list from multiple arguments', function (): void {
			expect(
				new HList<HVal>(
					HStr.make('foovalue'),
					HNum.make(99),
					HMarker.make()
				)
			).toEqual(list)
		})

		it('creates a list from multiple mixed type arguments', function (): void {
			expect(
				new HList<HVal>(HStr.make('foovalue'), 99, HMarker.make())
			).toEqual(list)
		})

		it('creates a list from multiple array arguments', function (): void {
			expect(
				new HList<HVal>(
					[HStr.make('foovalue'), HNum.make(99)],
					[HMarker.make()]
				)
			).toEqual(list)
		})

		it('creates a list from a hayson list', function (): void {
			expect(new HList('foovalue', 99, { _kind: Kind.Marker })).toEqual(
				list
			)
		})
	}) // #constructor()

	describe('.make()', function (): void {
		it('makes a list from an array of values', function (): void {
			expect(HList.make(values).values).toEqual(values)
		})

		it('makes a list from a list', function (): void {
			expect(HList.make(list)).toBe(list)
		})
	}) // .make()

	describe('#getKind()', function (): void {
		it("returns the list's kind", function (): void {
			expect(list.getKind()).toBe(Kind.List)
		})
	}) // .#getKind()

	describe('#length', function (): void {
		it('returns the length of the list', function (): void {
			expect(list.length).toBe(3)
		})
	}) // #length

	describe('#get()', function (): void {
		it('returns a valid value', function (): void {
			expect(list.get(0)).toEqual(HStr.make('foovalue'))
		})

		it("returns haystack null when the value can't be found", function (): void {
			expect(list.get(6)).toBeUndefined()
		})

		it('returns a null value', function (): void {
			expect(HList.make([null]).get(0)).toBeNull()
		})
	}) // #get()

	describe('#set()', function (): void {
		it('sets a value', function (): void {
			const newVal = HStr.make('A new value')
			list.set(0, newVal)
			expect(list.values[0]).toEqual(newVal)
		})

		it('sets a value from some hayson', function (): void {
			list.set(0, 'A new value')
			expect(list.values[0]).toEqual(HStr.make('A new value'))
		})

		it('is chainable', function (): void {
			expect(list.set(0, 'A new value')).toBe(list)
		})

		it('sets a null value', function (): void {
			list.set(0, null)
			expect(list.get(0)).toBeNull()
		})
	}) // #set

	describe('#remove()', function (): void {
		it('removes a value from the list', function (): void {
			list.remove(0)
			expect(list.values[0]).toEqual(HNum.make(99))
		})
	}) // #remove()

	describe('#clear()', function (): void {
		it('removes all values from the list', function (): void {
			list.clear()
			expect(list.values).toEqual([])
		})
	}) // #clear()

	describe('#concat()', function (): void {
		it('concatenates two lists together', function (): void {
			expect(HList.make(1, 2, 3).concat(HList.make(4, 5, 6))).toValEqual(
				HList.make(1, 2, 3, 4, 5, 6)
			)
		})
	}) // #concat()

	describe('#add()', function (): void {
		it('adds a value onto the list', function (): void {
			list.add(HRemove.make())
			expect(list.values[3]).toEqual(HRemove.make())
		})

		describe('adds multiple values', function (): void {
			let val1: HStr
			let val2: HStr

			beforeEach(function (): void {
				list = HList.make()
				val1 = HStr.make('added1')
				val2 = HStr.make('added2')
			})

			function afterTest(): void {
				expect(list.length).toBe(2)
				expect(list.get(0)).toBe(val1)
				expect(list.get(1)).toBe(val2)
			}

			it('from multiple arguments', function (): void {
				list.add(val1, val2)
				afterTest()
			})

			it('from multiple arguments in an array', function (): void {
				list.add([val1, val2])
				afterTest()
			})

			it('from multiple arguments from multiple arrays', function (): void {
				list.add([val1], [val2])
				afterTest()
			})
		})

		it('is chainable', function (): void {
			expect(list.add([1])).toBe(list)
		})
	}) // #add()

	describe('#insert()', function (): void {
		const val1Str = 'val1'
		const val2Str = 'val2'

		const first = HStr.make('first')
		const val1 = HStr.make(val1Str)
		const val2 = HStr.make(val2Str)
		const last = HStr.make('last')
		let newList: HList<HStr>

		beforeEach(function (): void {
			list = HList.make(first, last)

			newList = HList.make(first, val1, val2, last)
		})

		it('inserts a argument into the list', function (): void {
			list.insert(1, val1)
			expect(list).toValEqual(HList.make(first, val1, last))
		})

		it('inserts a hayson argument into the list', function (): void {
			list.insert(1, val1Str)
			expect(list).toValEqual(HList.make(first, val1, last))
		})

		describe('inserts multiple values', function (): void {
			function afterTest(): void {
				expect(newList.length).toBe(4)
				expect(newList.get(0)).toValEqual(first)
				expect(newList.get(1)).toValEqual(val1)
				expect(newList.get(2)).toValEqual(val2)
				expect(newList.get(3)).toValEqual(last)
			}

			it('as arguments', function (): void {
				list.insert(1, val1, val2)
				afterTest()
			})

			it('as arguments in an array', function (): void {
				list.insert(1, [val1, val2])
				afterTest()
			})

			it('as arguments as individual arrays', function (): void {
				list.insert(1, [val1], [val2])
				afterTest()
			})

			it('as hayson arguments', function (): void {
				list.insert(1, val1Str, val2Str)
				afterTest()
			})

			it('as hayson arguments in an array', function (): void {
				list.insert(1, [val1Str, val2Str])
				afterTest()
			})

			it('as hayson arguments as individual arrays', function (): void {
				list.insert(1, [val1Str], [val2Str])
				afterTest()
			})
		})

		it('throws an error when no arguments are inserted', function (): void {
			expect((): void => {
				list.insert(1, [])
			}).toThrow()
		})

		it('throws an error when the index is less than zero', function (): void {
			expect((): void => {
				list.insert(-1, val1)
			}).toThrow()
		})

		it('throws an error when the index is to high', function (): void {
			expect((): void => {
				list.insert(3, val1)
			}).toThrow()
		})

		it('is chainable', function (): void {
			expect(list.insert(1, [1])).toBe(list)
		})
	}) // #insert()

	describe('#push()', function (): void {
		it('pushs a value onto the list', function (): void {
			list.push(HRemove.make())
			expect(list.values[3]).toEqual(HRemove.make())
		})
		it('is chainable', function (): void {
			expect(list.push(HNum.make(4))).toBe(list)
		})
	}) // #push()

	describe('#pop()', function (): void {
		it('removes the last element and returns it', function (): void {
			expect(list.pop()).toEqual(HMarker.make())
			expect(list.length).toEqual(2)
		})

		it('returns undefined when the list is empty', function (): void {
			expect(HList.make().pop()).toBeUndefined()
		})
	}) // #pop()

	describe('#sort()', function (): void {
		it('sorts the list in ascending order', function (): void {
			list = HList.make('b', null, 'a', 'c')
			list.sort()
			expect(list).toValEqual(HList.make(null, 'a', 'b', 'c'))
		})

		it('is chainable', function (): void {
			expect(list.sort()).toBe(list)
		})
	}) // #sort()

	describe('#reverse()', function (): void {
		it('reverses the order of a list', function (): void {
			list.reverse()

			expect(list).toValEqual(
				HList.make([
					HMarker.make(),
					HNum.make(99),
					HStr.make('foovalue'),
				])
			)
		})

		it('is chainable', function (): void {
			expect(list.reverse()).toBe(list)
		})
	}) // #reverse()

	describe('#isEmpty()', function (): void {
		it('returns true if the list is empty', function (): void {
			expect(HList.make([]).isEmpty()).toBe(true)
		})

		it('returns false if the list is not empty', function (): void {
			expect(list.isEmpty()).toBe(false)
		})
	}) // #isEmpty()

	describe('#any()', function (): void {
		it('returns true if the list has the value', function (): void {
			expect(list.any(HStr.make('foovalue'))).toBe(true)
		})

		it("returns false if the list doesn't have the value", function (): void {
			expect(list.any(HStr.make('othervalue'))).toBe(false)
		})

		it('returns true when a filter matches for `it`', function (): void {
			expect(list.any('it == "foovalue"')).toBe(true)
		})

		it('returns true when a filter matches for `item`', function (): void {
			expect(list.any('item == "foovalue"')).toBe(true)
		})

		it('returns false when a filter does not match for `it`', function (): void {
			expect(list.any('it == "somethingelse"')).toBe(false)
		})

		it('returns true when a filter matches for `item` via a node', function (): void {
			const node = HFilter.parse('item == "foovalue"')
			expect(list.any(node)).toBe(true)
		})

		it('returns false when a filter does not match for `item`', function (): void {
			expect(list.any('item == "somethingelse"')).toBe(false)
		})

		it('returns true if the list has a null value', function (): void {
			list.push(null)
			expect(list.any(null)).toBe(true)
		})

		it('returns false if the list does not have a null value', function (): void {
			expect(list.any(null)).toBe(false)
		})
	}) // #any()

	describe('#matches()', function (): void {
		it('returns true when a filter matches for `it`', function (): void {
			expect(list.matches('it == "foovalue"')).toBe(true)
		})

		it('returns true when a filter matches for `item`', function (): void {
			expect(list.matches('item == "foovalue"')).toBe(true)
		})

		it('returns false when a filter does not match for `it`', function (): void {
			expect(list.matches('it == "somethingelse"')).toBe(false)
		})

		it('returns true when a filter matches for `item` via a node', function (): void {
			const node = HFilter.parse('item == "foovalue"')
			expect(list.matches(node)).toBe(true)
		})

		it('returns false when a filter does not match for `item`', function (): void {
			expect(list.matches('item == "somethingelse"')).toBe(false)
		})
	}) // #matches()

	describe('#all()', function (): void {
		beforeEach(function (): void {
			list = HList.make(1, 1, 1, 1)
		})

		it('returns true when the value matches everything in the list', function (): void {
			expect(list.all(HNum.make(1))).toBe(true)
		})

		it('returns false when the value does not anything in the list', function (): void {
			expect(list.all(HNum.make(2))).toBe(false)
		})

		it('returns false when the value does not match one thing in the list', function (): void {
			expect(HList.make(1, 2, 1, 1).all(HNum.make(1))).toBe(false)
		})

		it('returns true when the filter matches everything in the list', function (): void {
			expect(list.all('item == 1')).toBe(true)
		})

		it('returns false when the filter does not anything in the list', function (): void {
			expect(list.all('item == 2')).toBe(false)
		})

		it('returns false when there is null in the list and the filter does not match', function (): void {
			list.push(null)
			expect(list.all('item == 1')).toBe(false)
		})

		it('returns false when the filter does not match one thing in the list', function (): void {
			expect(HList.make(1, 2, 1, 1).all('item == 1')).toBe(false)
		})

		it('returns true when the node matches everything in the list', function (): void {
			expect(list.all(HFilter.parse('item == 1'))).toBe(true)
		})

		it('returns false when the node does not anything in the list', function (): void {
			expect(list.all(HFilter.parse('item == 2'))).toBe(false)
		})

		it('returns false when the node does not match one thing in the list', function (): void {
			expect(HList.make(1, 2, 1, 1).all(HFilter.parse('item == 1'))).toBe(
				false
			)
		})

		it('returns false for an empty list', function (): void {
			expect(HList.make().all('item == 1')).toBe(false)
		})

		it('returns true when all items are null', function (): void {
			expect(HList.make([null, null, null]).all(null)).toBe(true)
		})

		it('returns false when one item is not null', function (): void {
			expect(
				HList.make<HNum | null>([null, HNum.make(1), null]).all(null)
			).toBe(false)
		})
	}) // #all()

	describe('#filter()', function (): void {
		it('filters the list using a haystack filter for `it`', function (): void {
			expect(list.filter('it == "foovalue"')).toEqual(
				HList.make([HStr.make('foovalue')])
			)
		})

		it('filters the list using a haystack filter for `it` via a node', function (): void {
			const node = HFilter.parse('it == "foovalue"')

			expect(list.filter(node)).toEqual(
				HList.make([HStr.make('foovalue')])
			)
		})

		it('filters the list using a haystack filter for `item`', function (): void {
			expect(list.filter('item == "foovalue"')).toEqual(
				HList.make([HStr.make('foovalue')])
			)
		})

		it('filters all values', function (): void {
			expect(list.filter('item')).toEqual(list)
		})

		it('filters to an empty list', function (): void {
			expect(list.filter('itemm')).toEqual(HList.make([]))
		})

		it('filters using a function callback', function (): void {
			const newList = list.filter(
				(val): boolean => !!val?.isKind(Kind.Str)
			)

			expect(newList).toEqual(HList.make('foovalue'))
		})
	}) // #filter()

	describe('#map()', function (): void {
		it('maps all the values to string values', function (): void {
			const newList = list.map((val): HStr => HStr.make(String(val)))

			expect(newList).toEqual([
				HStr.make('foovalue'),
				HStr.make('99.0'),
				HStr.make('✔'),
			])
		})
	}) // #map()

	describe('#reduce()', function (): void {
		it('reduce all numbers down to a total with an initial value', function (): void {
			const numList = HList.make<HNum>([1, 2, 3])

			const val = numList.reduce(
				(prev, cur): HNum =>
					HNum.make(prev.value + (cur as HNum).value),
				HNum.make(1)
			)

			expect(val.value).toBe(7)
		})

		it('reduce all numbers down to a total without an initial value', function (): void {
			const numList = HList.make<HNum>([1, 2, 3])

			const val = numList.reduce(
				(prev, cur): HNum => HNum.make(prev.value + (cur as HNum).value)
			)

			expect(val.value).toBe(6)
		})

		it('collect all numbers into an array', function (): void {
			const numList = HList.make<HNum>([1, 2, 3])

			const val = numList.reduce(
				(prev, cur): number[] => prev.concat((cur as HNum).value),
				[] as number[]
			)

			expect(val).toEqual([1, 2, 3])
		})
	}) // #reduce()

	describe('#toString()', function (): void {
		it('returns a human readable string', function (): void {
			list.push(null)
			expect(list.toString()).toBe('[foovalue, 99, ✔, null]')
		})
	}) // #toString()

	describe('#toJSON()', function (): void {
		it('returns the list as JSON', function (): void {
			list.push(null)
			expect(list.toJSON()).toEqual([
				'foovalue',
				99,
				{ _kind: Kind.Marker },
				null,
			])
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns the list as JSON', function (): void {
			list.push(null)
			expect(list.toJSONv3()).toEqual(['foovalue', 'n:99', 'm:', null])
		})
	}) // #toJSONv3()

	describe('#toFilter()', function (): void {
		it('throws an error', function (): void {
			expect((): void => {
				list.toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns the list as a zinc encoded value', function (): void {
			list.push(null)
			expect(list.toZinc()).toBe('["foovalue",99,M,N]')
		})

		it('returns the list with an embedded grid', function (): void {
			const grid = HGrid.make([{ foo: 'foo' }])
			list = HList.make(grid)

			expect(list.toZinc()).toBe('[<<\nver:"3.0"\nfoo\n"foo"\n>>]')
		})
	}) // #toZinc()

	describe('#toAxon()', function (): void {
		it('returns the list encoded in Axon', function (): void {
			list.push(null)
			expect(list.toAxon()).toBe('["foovalue",99,marker(),null]')
		})
	}) // #toAxon()

	describe('#equals()', function (): void {
		it('returns true when the lists are equal', function (): void {
			const newList = HList.make([values[0], values[1], values[2]])
			expect(list.equals(newList)).toBe(true)
		})

		it('returns true when the lists are equal and have null values', function (): void {
			list.push(null)
			const newList = HList.make([values[0], values[1], values[2], null])
			expect(list.equals(newList)).toBe(true)
		})

		it('returns false when the lists are not equal and one of the lists is empty', function (): void {
			expect(list.equals(HList.make([]))).toBe(false)
		})

		it('returns false when the lists differ in size', function (): void {
			const newList = HList.make([values[0], values[1]])
			expect(list.equals(newList)).toBe(false)
		})

		it('returns false when the lists contain a different value', function (): void {
			const newList = HList.make([
				HStr.make('foovalue2'),
				values[1],
				values[2],
			])
			expect(list.equals(newList)).toBe(false)
		})

		it('returns false when the other list is null', function (): void {
			expect(list.equals(null as unknown as HList<HVal>)).toBe(false)
		})
	}) //#equals()

	describe('#compareTo()', function (): void {
		let list0: HList<HVal>

		beforeEach(function (): void {
			list0 = HList.make([
				HStr.make('foovalue'),
				HNum.make(98),
				HMarker.make(),
			])
		})

		it('returns -1 when first is less than second', function (): void {
			expect(list0.compareTo(list)).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(list.compareTo(list0)).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(list.compareTo(list)).toBe(0)
		})
	}) // #compareTo()

	describe('iterator', function (): void {
		it('iterates around a list', function (): void {
			let i = 0
			for (const value of list) {
				if (i === 0) {
					expect(value).toEqual(values[0])
				} else if (i === 1) {
					expect(value).toEqual(values[1])
				} else if (i === 2) {
					expect(value).toEqual(values[2])
				} else {
					throw new Error('Invalid iterator')
				}

				++i
			}
			expect(i).toBe(3)
		})
	}) // iterator

	describe('proxy', function (): void {
		it('gets a string value from a list', function (): void {
			expect(list[0]).toEqual(HStr.make('foovalue'))
		})

		it('gets a numeric value from a list', function (): void {
			expect(list[1]).toEqual(HNum.make(99))
		})

		it("gets an undefined value when it can't be found", function (): void {
			expect(list[99]).toBeUndefined()
		})

		it('sets a string value in a list', function (): void {
			list[0] = HStr.make('otherValue')
			expect(list.values[0]).toEqual(HStr.make('otherValue'))
		})

		it('gets a numeric value in a list', function (): void {
			list[1] = HNum.make(98)
			expect(list.values[1]).toEqual(HNum.make(98))
		})

		it('gets a null value in a list', function (): void {
			list[1] = null
			expect(list.values[1]).toEqual(null)
		})
	}) // proxy

	describe('#sum', function (): void {
		it('sums a list of numbers', function (): void {
			expect(
				HList.make(HNum.make(1), HNum.make(2), HNum.make(3)).sum
			).toBe(6)
		})

		it('returns zero for an empty list', function (): void {
			expect(HList.make().sum).toBe(0)
		})
	}) // #sum

	describe('#max', function (): void {
		it('returns the maximum number in a list', function (): void {
			expect(
				HList.make(HNum.make(1), HNum.make(2), HNum.make(3)).max
			).toBe(3)
		})

		it('returns Number.MIN_SAFE_INTEGER for an empty list', function (): void {
			expect(HList.make().max).toBe(Number.MIN_SAFE_INTEGER)
		})
	}) // #max

	describe('#min', function (): void {
		it('returns the minimum number in a list', function (): void {
			expect(
				HList.make(HNum.make(1), HNum.make(2), HNum.make(3)).min
			).toBe(1)
		})

		it('returns Number.MAX_SAFE_INTEGER for an empty list', function (): void {
			expect(HList.make().min).toBe(Number.MAX_SAFE_INTEGER)
		})
	}) // #min

	describe('#avg', function (): void {
		it('returns the minimum number in a list', function (): void {
			expect(
				HList.make(HNum.make(1), HNum.make(2), HNum.make(3)).avg
			).toBe(2)
		})

		it('returns Number.NaN for an empty list', function (): void {
			expect(Number.isNaN(HList.make().avg)).toBe(true)
		})
	}) // #avg

	describe('#toDict()', function (): void {
		it('returns the list as a dict', function (): void {
			const dict = HDict.make({ val: list })
			expect(list.toDict()).toValEqual(dict)
		})
	}) // #toDict()

	describe('#toGrid()', function (): void {
		it('returns the list as a grid', function (): void {
			const grid = HGrid.make({
				rows: [HDict.make({ val: list })],
			})
			expect(list.toGrid()).toValEqual(grid)
		})
	}) // #toGrid()

	describe('#toArray()', function (): void {
		it('returns the underlying array', function (): void {
			const copy = list.toArray()
			expect(copy).toEqual(list.values)
			expect(copy).toBe(list.values)
		})
	}) // #toArray()

	describe('#flat()', function (): void {
		it('flattens a list', function (): void {
			list = HList.make([[1, 2, 3], [4, 5], 6])
			expect(list.flat()).toValEqual(HList.make(1, 2, 3, 4, 5, 6))
		})

		it('flattens a list of a list of numbers', function (): void {
			list = HList.make<HList<HNum>>([1, 2, 3], [4, 5], [6])
			expect(list.flat<HNum>()).toValEqual(HList.make(1, 2, 3, 4, 5, 6))
		})
	}) // #flat()

	describe('#unique()', function (): void {
		it('filters out duplicate values', function (): void {
			expect(
				HList.make(3, 1, 2, null, 3, 2, null, 1, 1).unique()
			).toValEqual(HList.make(3, 1, 2, null))
		})
	}) // #unique()

	describe('#includes()', function (): void {
		it('returns true when the list includes a value', function (): void {
			expect(list.includes(HNum.make(99))).toBe(true)
		})

		it('returns true when the list includes a value from a starting index', function (): void {
			expect(list.includes(HNum.make(99), 0)).toBe(true)
		})

		it('returns false when the list does not include a value from the starting index', function (): void {
			expect(list.includes(HNum.make(99), 2)).toBe(false)
		})

		it('returns false when the list does not include a value', function (): void {
			expect(list.includes(HNum.make(98))).toBe(false)
		})

		it('returns true when the list includes a hayson value', function (): void {
			expect(list.includes(99)).toBe(true)
		})

		it('returns false when the list does not include a hayson value', function (): void {
			expect(list.includes(98)).toBe(false)
		})
	}) // #includes()

	describe('#forEach()', function (): void {
		it('iterates through a list of values', function (): void {
			let counter = 0

			list.forEach(
				(
					val: HVal | null,
					index: number,
					values: (HVal | null)[]
				): void => {
					switch (counter) {
						case 0:
							expect(val).toEqual(HStr.make('foovalue'))
							break
						case 1:
							expect(val).toEqual(HNum.make(99))
							break
						case 2:
							expect(val).toEqual(HMarker.make())
							break
						default:
							throw new Error()
					}

					expect(index).toBe(counter)
					expect(values).toBe(list.values)

					counter++
				}
			)

			expect(counter).toBe(3)
		})
	}) // #forEach()

	describe('#find()', function (): void {
		it('returns an item found in the list', function (): void {
			const value = list.find(
				(val) =>
					valueIsKind<HStr>(val, Kind.Str) && val.value === 'foovalue'
			)

			expect(value).toBe(list[0])
		})

		it('returns undefined when a value cannot be found in the list', function (): void {
			const value = list.find(
				(val) =>
					valueIsKind<HStr>(val, Kind.Str) &&
					val.value === 'doesNotExist'
			)

			expect(value).toBeUndefined()
		})
	}) // #find()

	describe('#newCopy()', function (): void {
		it('returns a new instance', function (): void {
			list.push(null)
			const listCopy = list.newCopy()
			expect(list).toEqual(listCopy)
			expect(list).not.toBe(listCopy)
		})
	}) // #newCopy()

	describe('#validate()', function (): void {
		it('makes sure the internal array items are real haystack values', function (): void {
			const numList = HList.make<HNum>(1, 2, 3)

			const numArray = numList.values as unknown as number[]

			numArray[2] = 4

			numList.validate()

			expect(numList.values).toEqual([
				HNum.make(1),
				HNum.make(2),
				HNum.make(4),
			])
		})
	}) // #validate()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			expect(list.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: list })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns itself', function (): void {
			expect(list.toList()).toBe(list)
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			expect(list.toDict()).toValEqual(HDict.make({ val: list }))
		})
	}) // #toDict()
})

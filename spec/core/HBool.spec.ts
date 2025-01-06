/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HBool } from '../../src/core/HBool'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import { Kind } from '../../src/core/Kind'
import '../matchers'
import '../customMatchers'

describe('HBool', function (): void {
	describe('.make()', function (): void {
		it('returns haystack true for true', function (): void {
			expect(HBool.make(true)).toBe(HBool.make(true))
		})

		it('returns haystack false for false', function (): void {
			expect(HBool.make(false)).toBe(HBool.make(false))
		})

		it('returns haystack boolean from haystack boolean', function (): void {
			const bool = HBool.make(true)
			expect(HBool.make(bool)).toBe(bool)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change TRUE to false', function (): void {
			expect((): void => {
				HBool.make(true).value = false
			}).toThrow()
		})

		it('throws error when attempting to change FALSE to true', function (): void {
			expect((): void => {
				HBool.make(false).value = true
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns true', function (): void {
			expect(HBool.make(true).valueOf()).toBe(true)
		})

		it('returns false', function (): void {
			expect(HBool.make(false).valueOf()).toBe(false)
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns true as a string', function (): void {
			expect(HBool.make(true).toString()).toBe('true')
		})

		it('returns false as a string', function (): void {
			expect(HBool.make(false).toString()).toBe('false')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HBool.make(true).equals(null as unknown as HBool)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(HBool.make(true).equals(undefined as unknown as HBool)).toBe(
				false
			)
		})

		it('returns false when booleans do not match', function (): void {
			expect(HBool.make(false).equals(HBool.make(true))).toBe(false)
		})

		it('returns true when booleans match', function (): void {
			expect(HBool.make(true).equals(HBool.make(true))).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HBool.make(false).compareTo(HBool.make(true))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HBool.make(true).compareTo(HBool.make(false))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HBool.make(true).compareTo(HBool.make(true))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns true for a boolean', function (): void {
			expect(HBool.make(true).toFilter()).toBe('true')
		})

		it('returns false for a boolean', function (): void {
			expect(HBool.make(false).toFilter()).toBe('false')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns T for a boolean', function (): void {
			expect(HBool.make(true).toZinc()).toBe('T')
		})

		it('returns F for a boolean', function (): void {
			expect(HBool.make(false).toZinc()).toBe('F')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns a JSON for true', function (): void {
			expect(HBool.make(true).toJSON()).toEqual(true)
		})

		it('returns a JSON for false', function (): void {
			expect(HBool.make(false).toJSON()).toEqual(false)
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns JSON for false', function (): void {
			expect(HBool.make(false).toJSONv3()).toBe(false)
		})

		it('returns JSON for true', function (): void {
			expect(HBool.make(true).toJSONv3()).toBe(true)
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon true value', function (): void {
			expect(HBool.make(true).toAxon()).toBe('true')
		})

		it('returns an Axon false value', function (): void {
			expect(HBool.make(false).toAxon()).toBe('false')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HBool.make(true).isKind(Kind.Bool)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HBool.make(true).isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when boolean matches true', function (): void {
			expect(HBool.make(true).matches('item == true')).toBe(true)
		})

		it('returns false when boolean is false', function (): void {
			expect(HBool.make(false).matches('item == true')).toBe(false)
		})

		it('returns false when the item does not match', function (): void {
			expect(HBool.make(true).matches('itemm == true')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			expect(HBool.make(true).newCopy()).toBe(HBool.make(true))
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			expect(HBool.make(true).toGrid()).toValEqual(
				HGrid.make([{ val: true }])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			expect(HBool.make(true).toList()).toValEqual(HList.make([true]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			expect(HBool.make(true).toDict()).toValEqual(
				HDict.make({ val: true })
			)
		})
	}) // #toDict()
})

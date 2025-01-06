/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HNa } from '../../src/core/HNa'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'

describe('HNa', function (): void {
	describe('.make()', function (): void {
		it('makes a default instance', function (): void {
			expect(HNa.make()).toBe(HNa.make())
		})
	}) // .make()

	describe('#valueOf()', function (): void {
		it('returns the zinc encoded string', function (): void {
			expect(HNa.make().valueOf()).toBe('NA')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string encoded version', function (): void {
			expect(HNa.make().toString()).toBe('NA')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HNa.make().equals(null as unknown as HNa)).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(HNa.make().equals(undefined as unknown as HNa)).toBe(false)
		})

		it('returns true for haystack NA value', function (): void {
			expect(HNa.make().equals(HNa.make())).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns 0 for matching null', function (): void {
			expect(HNa.make().compareTo(HNa.make())).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error when converted to a filter value', function (): void {
			expect((): void => {
				HNa.make().toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a zinc encoded string', function (): void {
			expect(HNa.make().toZinc()).toBe('NA')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HNa.make().toJSON()).toEqual({
				_kind: Kind.NA,
			})
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns JSON', function (): void {
			expect(HNa.make().toJSONv3()).toEqual('z:')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HNa.make().toAxon()).toBe('na()')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HNa.make().isKind(Kind.NA)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HNa.make().isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(HNa.make().matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(HNa.make().matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const na = HNa.make()
			expect(na.newCopy()).toBe(na)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			expect(HNa.make().toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: HNa.make() })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			expect(HNa.make().toList()).toValEqual(HList.make([HNa.make()]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			expect(HNa.make().toDict()).toValEqual(
				HDict.make({ val: HNa.make() })
			)
		})
	}) // #toDict()
})

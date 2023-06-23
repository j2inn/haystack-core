/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HRemove } from '../../src/core/HRemove'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import '../matchers'
import '../customMatchers'

describe('HRemove', function (): void {
	describe('.make()', function (): void {
		it('makes a default instance', function (): void {
			expect(HRemove.make()).toBe(HRemove.make())
		})
	}) // .make()

	describe('#valueOf()', function (): void {
		it('returns the instance', function (): void {
			expect(HRemove.make().valueOf()).toBe('R')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string encoded version', function (): void {
			expect(HRemove.make().toString()).toBe('REMOVE')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HRemove.make().equals(null as unknown as HRemove)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(HRemove.make().equals(undefined as unknown as HRemove)).toBe(
				false
			)
		})

		it('returns true for haystack remove value', function (): void {
			expect(HRemove.make().equals(HRemove.make())).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns 0 for matching null', function (): void {
			expect(HRemove.make().compareTo(HRemove.make())).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error when converted to a filter value', function (): void {
			expect((): void => {
				HRemove.make().toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a zinc encoded string', function (): void {
			expect(HRemove.make().toZinc()).toBe('R')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HRemove.make().toJSON()).toEqual({
				_kind: Kind.Remove,
			})
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns a zinc encoded string', function (): void {
			expect(HRemove.make().toJSONv3()).toBe('-:')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HRemove.make().toAxon()).toBe('removeMarker()')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HRemove.make().isKind(Kind.Remove)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HRemove.make().isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(HRemove.make().matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(HRemove.make().matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const remove = HRemove.make()
			expect(remove.newCopy()).toBe(remove)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			expect(HRemove.make().toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: HRemove.make() })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			expect(HRemove.make().toList()).toValEqual(
				HList.make([HRemove.make()])
			)
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			expect(HRemove.make().toDict()).toValEqual(
				HDict.make({ val: HRemove.make() })
			)
		})
	}) // #toDict()
})

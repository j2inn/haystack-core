/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HMarker } from '../../src/core/HMarker'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import { TEXT_ENCODER } from '../../src/core/HVal'

import '../matchers'
import '../customMatchers'

describe('HMarker', function (): void {
	describe('.make()', function (): void {
		it('makes a default instance', function (): void {
			expect(HMarker.make()).toBe(HMarker.make())
		})
	}) // .make()

	describe('#valueOf()', function (): void {
		it('returns the zinc encoded string', function (): void {
			expect(HMarker.make().valueOf()).toBe('M')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string encoded version', function (): void {
			expect(HMarker.make().toString()).toBe('✔')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HMarker.make().equals(null as unknown as HMarker)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(HMarker.make().equals(undefined as unknown as HMarker)).toBe(
				false
			)
		})

		it('returns true for haystack marker value', function (): void {
			expect(HMarker.make().equals(HMarker.make())).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns 0 for matching null', function (): void {
			expect(HMarker.make().compareTo(HMarker.make())).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error when converted to a filter value', function (): void {
			expect((): void => {
				HMarker.make().toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a zinc encoded string', function (): void {
			expect(HMarker.make().toZinc()).toBe('M')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HMarker.make().toJSON()).toEqual({
				_kind: Kind.Marker,
			})
		})
	}) // #toJSON()

	describe('#toJSONString()', function (): void {
		it('returns a JSON string', function (): void {
			expect(HMarker.make().toJSONString()).toBe(
				JSON.stringify({
					_kind: Kind.Marker,
				})
			)
		})
	}) // #toJSONString()

	describe('#toJSONUint8Array()', function (): void {
		it('returns a JSON byte buffer', function (): void {
			expect(HMarker.make().toJSONUint8Array()).toEqual(
				TEXT_ENCODER.encode(
					JSON.stringify({
						_kind: Kind.Marker,
					})
				)
			)
		})
	}) // #toJSONUint8Array()

	describe('#toJSONv3()', function (): void {
		it('returns JSON', function (): void {
			expect(HMarker.make().toJSONv3()).toEqual('m:')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HMarker.make().toAxon()).toBe('marker()')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HMarker.make().isKind(Kind.Marker)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HMarker.make().isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(HMarker.make().matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(HMarker.make().matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const marker = HMarker.make()
			expect(marker.newCopy()).toBe(marker)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			expect(HMarker.make().toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: HMarker.make() })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			expect(HMarker.make().toList()).toValEqual(
				HList.make([HMarker.make()])
			)
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			expect(HMarker.make().toDict()).toValEqual(
				HDict.make({ val: HMarker.make() })
			)
		})
	}) // #toDict()
})

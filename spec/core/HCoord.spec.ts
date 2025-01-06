/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HCoord } from '../../src/core/HCoord'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'

describe('HCoord', function (): void {
	function makeCoord(latitude: number, longitude: number): HCoord {
		return HCoord.make({ latitude, longitude })
	}

	describe('.make()', function (): void {
		it('create a new coord object', function (): void {
			expect(makeCoord(2, 4)).toEqual(makeCoord(2, 4))
		})

		it('create a new coord object from a hayson object', function (): void {
			expect(HCoord.make({ _kind: Kind.Coord, lat: 2, lng: 4 })).toEqual(
				makeCoord(2, 4)
			)
		})

		it('create a haystack coord from a haystack coord', function (): void {
			const coord = makeCoord(2, 4)
			expect(HCoord.make(coord)).toBe(coord)
		})

		it("throws an error for an invalid latitude that's too small", function (): void {
			expect((): void => {
				makeCoord(-90000001, 4)
			}).toThrow()
		})

		it("throws an error for an invalid latitude that's too big", function (): void {
			expect((): void => {
				makeCoord(90000001, 4)
			}).toThrow()
		})

		it("throws an error for an invalid longitude that's too small", function (): void {
			expect((): void => {
				makeCoord(2, -180000001)
			}).toThrow()
		})

		it("throws an error for an invalid longitude that's too big", function (): void {
			expect((): void => {
				makeCoord(2, 180000001)
			}).toThrow()
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the latitude', function (): void {
			const coord = makeCoord(2, 4)

			expect((): void => {
				coord.latitude = 3
			}).toThrow()
		})

		it('throws error when attempting to change the longitude', function (): void {
			const coord = makeCoord(2, 4)

			expect((): void => {
				coord.longitude = 5
			}).toThrow()
		})
	}) // immutability

	describe('.make()', function (): void {
		it('Creates a haystack coord', function (): void {
			expect(makeCoord(2, 4) instanceof HCoord).toBe(true)
		})
	}) // .make()

	describe('#valueOf()', function (): void {
		it('returns the instance', function (): void {
			const coord = makeCoord(2, 4)
			expect(coord.valueOf()).toBe(coord)
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(makeCoord(2, 4).toString()).toBe('latitude: 2, longitude: 4')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(makeCoord(2, 4).equals(null as unknown as HCoord)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(makeCoord(2, 4).equals(undefined as unknown as HCoord)).toBe(
				false
			)
		})

		it('string returns false', function (): void {
			expect(
				makeCoord(2, 4).equals('2020-01-01' as unknown as HCoord)
			).toBe(false)
		})

		it('different latitude returns false', function (): void {
			expect(makeCoord(2, 4).equals(makeCoord(3, 4))).toBe(false)
		})

		it('different longitude returns false', function (): void {
			expect(makeCoord(2, 4).equals(makeCoord(2, 5))).toBe(false)
		})

		it('different longitude and longitude returns false', function (): void {
			expect(makeCoord(2, 4).equals(makeCoord(2, 5))).toBe(false)
		})

		it('same coord returns true', function (): void {
			expect(makeCoord(2, 4).equals(makeCoord(2, 4))).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(makeCoord(2, 4).compareTo(makeCoord(3, 4))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(makeCoord(3, 4).compareTo(makeCoord(2, 4))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(makeCoord(2, 4).compareTo(makeCoord(2, 4))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error', function (): void {
			expect((): void => {
				makeCoord(2, 4).toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a zinc string', function (): void {
			expect(makeCoord(2, 4).toZinc()).toBe('C(2,4)')
		})

		it('returns a zinc string with negative numbers', function (): void {
			expect(makeCoord(-6, -4).toZinc()).toBe('C(-6,-4)')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(makeCoord(2, 4).toJSON()).toEqual({
				_kind: Kind.Coord,
				lat: 2,
				lng: 4,
			})
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns a JSON string', function (): void {
			expect(makeCoord(2, 4).toJSONv3()).toBe('c:2,4')
		})

		it('returns a JSON string with negative numbers', function (): void {
			expect(makeCoord(-6, -4).toJSONv3()).toBe('c:-6,-4')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(makeCoord(2, 4).toAxon()).toBe(`coord(2,4)`)
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(makeCoord(2, 4).isKind(Kind.Coord)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(makeCoord(2, 4).isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(makeCoord(2, 4).matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(makeCoord(2, 4).matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const coord = makeCoord(2, 4)
			expect(coord.newCopy()).toBe(coord)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const coord = makeCoord(2, 4)
			expect(coord.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: coord })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const coord = makeCoord(2, 4)
			expect(coord.toList()).toValEqual(HList.make([coord]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const coord = makeCoord(2, 4)
			expect(coord.toDict()).toValEqual(HDict.make({ val: coord }))
		})
	}) // #toDict()
})

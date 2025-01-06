/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HSymbol } from '../../src/core/HSymbol'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'

describe('HSymbol', function (): void {
	describe('.make()', function (): void {
		it('makes a haystack symbol', function (): void {
			expect(HSymbol.make('test') instanceof HSymbol).toBe(true)
		})

		it('makes a haystack symbol from a haystack symbol', function (): void {
			const symbol = HSymbol.make('test')
			expect(HSymbol.make(symbol)).toBe(symbol)
		})

		it('makes a haystack symbol from string that starts with ^', function (): void {
			expect(HSymbol.make('^test').value).toBe('test')
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting change the def value', function (): void {
			const def = HSymbol.make('test')

			expect((): void => {
				def.value = 'foo'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it("returns the def's value", function (): void {
			const def = HSymbol.make('foo')
			expect(def.valueOf()).toBe('foo')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(HSymbol.make('foo').toString()).toBe('foo')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HSymbol.make('foo').equals(null as unknown as HSymbol)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(
				HSymbol.make('foo').equals(undefined as unknown as HSymbol)
			).toBe(false)
		})

		it('string returns false', function (): void {
			expect(
				HSymbol.make('foo').equals('foo' as unknown as HSymbol)
			).toBe(false)
		})

		it('same def returns true', function (): void {
			const def = HSymbol.make('foo')
			expect(def.equals(def)).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HSymbol.make('a').compareTo(HSymbol.make('b'))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HSymbol.make('b').compareTo(HSymbol.make('a'))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HSymbol.make('a').compareTo(HSymbol.make('a'))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a zinc encoded def', function (): void {
			expect(HSymbol.make('foo').toZinc()).toBe('^foo')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a zinc encoded def', function (): void {
			expect(HSymbol.make('foo').toZinc()).toBe('^foo')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HSymbol.make('foo').toJSON()).toEqual({
				_kind: Kind.Symbol,
				val: 'foo',
			})
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns an encoded symbol', function (): void {
			expect(HSymbol.make('foo').toJSONv3()).toBe('y:foo')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HSymbol.make('foo').toAxon()).toBe('^foo')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HSymbol.make('foo').isKind(Kind.Symbol)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HSymbol.make('foo').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when def matches', function (): void {
			expect(HSymbol.make('foo').matches('item == ^foo')).toBe(true)
		})

		it('returns false when def does not match', function (): void {
			expect(HSymbol.make('foo').matches('item == ^food')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const symbol = HSymbol.make('foo')
			expect(symbol.newCopy()).toBe(symbol)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const symbol = HSymbol.make('foo')
			expect(symbol.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: symbol })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const symbol = HSymbol.make('foo')
			expect(symbol.toList()).toValEqual(HList.make([symbol]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const symbol = HSymbol.make('foo')
			expect(symbol.toDict()).toValEqual(HDict.make({ val: symbol }))
		})
	}) // #toDict()
})

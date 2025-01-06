/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HStr } from '../../src/core/HStr'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'

describe('HStr', function (): void {
	describe('.make()', function (): void {
		it('makes a string', function (): void {
			expect(HStr.make('test') instanceof HStr).toBe(true)
		})

		it('makes an empty string', function (): void {
			expect(HStr.make('').value).toBe('')
		})

		it('makes a haystack string from a haystack string', function (): void {
			const str = HStr.make('test')
			expect(HStr.make(str)).toBe(str)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the value', function (): void {
			const str = HStr.make('foo')

			expect((): void => {
				str.value = 'boo'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it("returns the string's value", function (): void {
			expect(HStr.make('foo').valueOf()).toBe('foo')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(HStr.make('foo').toString()).toBe('foo')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HStr.make('foo').equals(null as unknown as HStr)).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(HStr.make('foo').equals(undefined as unknown as HStr)).toBe(
				false
			)
		})

		it('string returns false', function (): void {
			expect(HStr.make('foo').equals('foo' as unknown as HStr)).toBe(
				false
			)
		})

		it('returns true for the same string', function (): void {
			const str = HStr.make('foo')
			expect(str.equals(str)).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HStr.make('a').compareTo(HStr.make('b'))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HStr.make('b').compareTo(HStr.make('a'))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HStr.make('a').compareTo(HStr.make('a'))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a string', function (): void {
			expect(HStr.make('foo').toFilter()).toBe('"foo"')
		})

		it('Encodes unicode characters', function (): void {
			expect(HStr.make('fῶo').toFilter()).toBe('"f\\u1ff6o"')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HStr.make('foo').toZinc()).toBe('"foo"')
		})

		it('encodes unicode characters', function (): void {
			expect(HStr.make('fῶo').toZinc()).toBe('"f\\u1ff6o"')
		})

		it('escapes breaks', function (): void {
			expect(HStr.make('test\btest\btest').toZinc()).toBe(
				'"test\\btest\\btest"'
			)
		})

		it('escapes form feeds', function (): void {
			expect(HStr.make('test\ftest\ftest').toZinc()).toBe(
				'"test\\ftest\\ftest"'
			)
		})

		it('escapes new lines', function (): void {
			expect(HStr.make('test\ntest\ntest').toZinc()).toBe(
				'"test\\ntest\\ntest"'
			)
		})

		it('escapes carriage returns', function (): void {
			expect(HStr.make('test\rtest\rtest').toZinc()).toBe(
				'"test\\rtest\\rtest"'
			)
		})

		it('escapes tabs', function (): void {
			expect(HStr.make('test\ttest\ttest').toZinc()).toBe(
				'"test\\ttest\\ttest"'
			)
		})

		it('escapes double quotes', function (): void {
			expect(HStr.make('test"test"test').toZinc()).toBe(
				'"test\\"test\\"test"'
			)
		})

		it('escapes back slashes', function (): void {
			expect(HStr.make('test\\test\\test').toZinc()).toBe(
				'"test\\\\test\\\\test"'
			)
		})

		it('escapes dollar signs', function (): void {
			expect(HStr.make('test$test$test').toZinc()).toBe(
				'"test\\$test\\$test"'
			)
		})

		it('does not encode ascii characters', function (): void {
			const str =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
			expect(HStr.make(str).toZinc()).toBe('"' + str + '"')
		})

		it('encodes non-ascii characters to unicode', function (): void {
			expect(HStr.make('ݧݩᴆᴁaḀCD').toZinc()).toBe(
				'"\\u0767\\u0769\\u1d06\\u1d01a\\u1e00CD"'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns a string', function (): void {
			expect(HStr.make('foo').toJSON()).toEqual('foo')
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns a string', function (): void {
			expect(HStr.make('foo').toJSONv3()).toEqual('foo')
		})

		it('returns a string with a colon', function (): void {
			expect(HStr.make('foo:goo').toJSONv3()).toEqual('s:foo:goo')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon encoded string', function (): void {
			expect(HStr.make('foo').toAxon()).toEqual('"foo"')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HStr.make('foo').isKind(Kind.Str)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HStr.make('foo').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the string matches', function (): void {
			expect(HStr.make('foo').matches('item == "foo"')).toBe(true)
		})

		it('returns false when the string does not match', function (): void {
			expect(HStr.make('food').matches('item == "foo"')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const str = HStr.make('foo')
			expect(str.newCopy()).toBe(str)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const str = HStr.make('foo')
			expect(str.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: str })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const str = HStr.make('foo')
			expect(str.toList()).toValEqual(HList.make([str]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const str = HStr.make('foo')
			expect(str.toDict()).toValEqual(HDict.make({ val: str }))
		})
	}) // #toDict()

	describe('caching', function (): void {
		it('An empty string creates the same object', function (): void {
			expect(HStr.make('')).toBe(HStr.make(''))
		})

		it('A non-empty string is not the same object', function (): void {
			expect(HStr.make('')).not.toBe(HStr.make('foo'))
		})
	}) // caching
})

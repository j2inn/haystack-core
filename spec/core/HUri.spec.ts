/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HUri } from '../../src/core/HUri'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import '../matchers'
import '../customMatchers'

describe('HUri', function (): void {
	describe('.make()', function (): void {
		it('makes a haystack uri', function (): void {
			expect(HUri.make('/foo') instanceof HUri).toBe(true)
		})

		it('makes an empty URI', function (): void {
			expect(HUri.make('').value).toBe('')
		})

		it('makes a haystack uri from a haystack uri', function (): void {
			const uri = HUri.make('/foo')
			expect(HUri.make(uri)).toBe(uri)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the value', function (): void {
			const uri = HUri.make('/foo')

			expect((): void => {
				uri.value = '/boo'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the instance', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.valueOf()).toBe('/foo')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(HUri.make('/foo').toString()).toBe('/foo')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HUri.make('/foo').equals(null as unknown as HUri)).toBe(
				false
			)
		})

		it('undefined returns false', function (): void {
			expect(HUri.make('/foo').equals(undefined as unknown as HUri)).toBe(
				false
			)
		})

		it('string returns false', function (): void {
			expect(HUri.make('/foo').equals('/foo' as unknown as HUri)).toBe(
				false
			)
		})

		it('returns true for the same URI', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.equals(uri)).toBe(true)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HUri.make('/a').compareTo(HUri.make('/b'))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HUri.make('/b').compareTo(HUri.make('/a'))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HUri.make('/a').compareTo(HUri.make('/a'))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a string', function (): void {
			expect(HUri.make('/foo').toFilter()).toBe('`/foo`')
		})

		it('Encodes unicode characters', function (): void {
			expect(HUri.make('/fῶo').toFilter()).toBe('`/f\\u1ff6o`')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HUri.make('/foo').toZinc()).toBe('`/foo`')
		})

		it('encodes unicode characters', function (): void {
			expect(HUri.make('/fῶo').toZinc()).toBe('`/f\\u1ff6o`')
		})

		it('encodes back ticks', function (): void {
			expect(HUri.make('test`test`test').toZinc()).toBe(
				'`test\\`test\\`test`'
			)
		})

		it('does not encode ascii characters', function (): void {
			const str =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
			expect(HUri.make(str).toZinc()).toBe('`' + str + '`')
		})

		it('encodes non-ascii characters to unicode', function (): void {
			expect(HUri.make('ݧݩᴆᴁaḀCD').toZinc()).toBe(
				'`\\u0767\\u0769\\u1d06\\u1d01a\\u1e00CD`'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HUri.make('/foo').toJSON()).toEqual({
				_kind: Kind.Uri,
				val: '/foo',
			})
		})
	}) // #toJSON()

	describe('#toAxon()', function (): void {
		it('returns a string', function (): void {
			expect(HUri.make('/foo').toAxon()).toBe('`/foo`')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HUri.make('/foo').isKind(Kind.Uri)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HUri.make('/foo').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the URI matches', function (): void {
			expect(HUri.make('/foo').matches('item == `/foo`')).toBe(true)
		})

		it('returns false when the URI does not match', function (): void {
			expect(HUri.make('/food').matches('item == `/foo`')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.newCopy()).toBe(uri)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: uri })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.toList()).toValEqual(HList.make([uri]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const uri = HUri.make('/foo')
			expect(uri.toDict()).toValEqual(HDict.make({ val: uri }))
		})
	}) // #toDict()
})

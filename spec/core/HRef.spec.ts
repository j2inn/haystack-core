/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HRef } from '../../src/core/HRef'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import '../matchers'
import '../customMatchers'

describe('HRef', function (): void {
	describe('.make()', function (): void {
		it('makes a haystack ref', function (): void {
			expect(HRef.make('foo') instanceof HRef).toBe(true)
		})

		it('makes a haystack ref from a haystack ref', function (): void {
			const ref = HRef.make('foo')
			expect(HRef.make(ref)).toBe(ref)
		})

		it('makes a haystack ref from a value that start with @', function (): void {
			expect(HRef.make('@foo').value).toBe('foo')
		})

		it('makes a haystack ref from a hayson ref without a display name', function (): void {
			const obj = { _kind: Kind.Ref, val: 'foo' }

			expect(HRef.make(obj).value).toBe('foo')
			expect(HRef.make(obj).dis).toBe('foo')
		})

		it('makes a haystack ref from a hayson ref including a display name', function (): void {
			const obj = { _kind: Kind.Ref, val: 'foo', dis: 'Foo' }

			expect(HRef.make(obj).value).toBe('foo')
			expect(HRef.make(obj).dis).toBe('Foo')
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the value', function (): void {
			const ref = HRef.make('foo')

			expect((): void => {
				ref.value = 'boo'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the ref value', function (): void {
			const ref = HRef.make('foo')
			expect(ref.valueOf()).toBe('foo')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns the value', function (): void {
			expect(HRef.make('foo').toString()).toBe('@foo')
		})

		it('returns the display string if used', function (): void {
			expect(HRef.make('foo', 'Foo').toString()).toBe('@foo "Foo"')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HRef.make('foo').equals(null as unknown as HRef)).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(HRef.make('foo').equals(undefined as unknown as HRef)).toBe(
				false
			)
		})

		it('string returns false', function (): void {
			expect(HRef.make('foo').equals('foo' as unknown as HRef)).toBe(
				false
			)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HRef.make('foo').compareTo(HRef.make('foo1'))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HRef.make('foo1').compareTo(HRef.make('foo'))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HRef.make('foo').compareTo(HRef.make('foo'))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns a string', function (): void {
			expect(HRef.make('foo').toFilter()).toBe('@foo')
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HRef.make('foo').toZinc()).toBe('@foo')
		})

		it('returns a string with a display name', function (): void {
			expect(HRef.make('foo', 'Foo').toZinc()).toBe('@foo "Foo"')
		})

		it('excludes the display name from the zinc encoding', function (): void {
			expect(HRef.make('foo', 'Foo').toZinc(/*excludeDis*/ true)).toBe(
				'@foo'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HRef.make('foo').toJSON()).toEqual({
				_kind: Kind.Ref,
				val: 'foo',
			})
		})
	}) // #toJSON()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HRef.make('foo', 'Foo').toAxon()).toBe('@foo')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HRef.make('foo').isKind(Kind.Ref)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HRef.make('foo').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#dis', function (): void {
		it('returns a display name', function (): void {
			expect(HRef.make('foo', 'Foo').dis).toBe('Foo')
		})

		it("returns an empty string if there's no display name", function (): void {
			expect(HRef.make('/foo').dis).toBe('/foo')
		})
	}) // #dis

	describe('#displayName', function (): void {
		it('returns a display name name', function (): void {
			expect(HRef.make('foo', 'Foo').displayName).toBe('Foo')
		})

		it("returns an the ref if there's no display name name", function (): void {
			expect(HRef.make('/foo').displayName).toBe('/foo')
		})
	}) // #displayName

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(HRef.make('/foo').matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(HRef.make('/foo').matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const ref = HRef.make('/foo')
			expect(ref.newCopy()).toBe(ref)
		})
	}) // #newCopy()

	describe('#noDis()', function (): void {
		it('returns an instance of itself if the ref has no display name', function (): void {
			const ref = HRef.make('/foo')
			expect(ref.noDis()).toBe(ref)
		})

		it('returns a new instance with only the value and no display name', function (): void {
			const ref = HRef.make('/foo', 'Foo')
			expect(ref.noDis().toZinc()).toBe('@/foo')
		})
	}) // #noDis()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const ref = HRef.make('foo')
			expect(ref.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: ref })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const ref = HRef.make('foo')
			expect(ref.toList()).toValEqual(HList.make([ref]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const ref = HRef.make('foo')
			expect(ref.toDict()).toValEqual(HDict.make({ val: ref }))
		})
	}) // #toDict()
})

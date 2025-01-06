/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HXStr } from '../../src/core/HXStr'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import '../matchers'
import '../customMatchers'

describe('HXStr', function (): void {
	describe('.make()', function (): void {
		it('makes a haystack xstring', function (): void {
			expect(HXStr.make('Type', 'value') instanceof HXStr).toBe(true)
		})
	}) // .make()

	describe('.make()', function (): void {
		it('create a new xstring object with a type and value', function (): void {
			const xstr = HXStr.make('Type', 'value')

			expect(xstr.type).toBe('Type')
			expect(xstr.value).toBe('value')
		})

		it('create a new xstring object with a type and value from a hayson object', function (): void {
			const xstr = HXStr.make({
				_kind: Kind.XStr,
				type: 'Type',
				val: 'value',
			})

			expect(xstr.type).toBe('Type')
			expect(xstr.value).toBe('value')
		})

		it('create a haystack xstr from a haystack xstr', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(HXStr.make(xstr)).toBe(xstr)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting to change the value', function (): void {
			const xstr = HXStr.make('Type', 'value')

			expect((): void => {
				xstr.value = 'value2'
			}).toThrow()
		})

		it('throws error when attempting to change the type', function (): void {
			const xstr = HXStr.make('Type', 'value')

			expect((): void => {
				xstr.type = 'Type2'
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it('returns the encoded value', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(xstr.valueOf()).toBe('Type("value")')
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a string', function (): void {
			expect(HXStr.make('Type', 'value').toString()).toBe('Type("value")')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(null as unknown as HXStr)
			).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(
					undefined as unknown as HXStr
				)
			).toBe(false)
		})

		it('string returns false', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(
					'2020-01-01' as unknown as HXStr
				)
			).toBe(false)
		})

		it('returns true for equal xstring', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(HXStr.make('Type', 'value'))
			).toBe(true)
		})

		it('returns false when type is different', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(HXStr.make('type0', 'value'))
			).toBe(false)
		})

		it('returns false when value is different', function (): void {
			expect(
				HXStr.make('Type', 'value').equals(HXStr.make('Type', 'value0'))
			).toBe(false)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(
				HXStr.make('Type', 'value').compareTo(
					HXStr.make('Type', 'value0')
				)
			).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(
				HXStr.make('Type', 'value0').compareTo(
					HXStr.make('Type', 'value')
				)
			).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(
				HXStr.make('Type', 'value').compareTo(
					HXStr.make('Type', 'value')
				)
			).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('throws an error when converted to a filter value', function (): void {
			expect((): void => {
				HXStr.make('Type', 'instance').toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns a string', function (): void {
			expect(HXStr.make('Type', 'value').toZinc()).toBe('Type("value")')
		})

		it('returns a string with escaped unicode characters', function (): void {
			expect(HXStr.make('Type', 'vaᾞlue').toZinc()).toBe(
				'Type("va\\u1f9elue")'
			)
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns JSON', function (): void {
			expect(HXStr.make('Type', 'value').toJSON()).toEqual({
				_kind: Kind.XStr,
				val: 'value',
				type: 'Type',
			})
		})
	}) // #toJSON()

	describe('#toJSONv3()', function (): void {
		it('returns a string', function (): void {
			expect(HXStr.make('Type', 'value').toJSONv3()).toBe('x:Type:value')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HXStr.make('Type', 'value').toAxon()).toBe(
				'xstr("Type","value")'
			)
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HXStr.make('Type', 'value').isKind(Kind.XStr)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HXStr.make('Type', 'value').isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the item matches', function (): void {
			expect(HXStr.make('Type', 'value').matches('item')).toBe(true)
		})

		it('returns false when the item does not match', function (): void {
			expect(HXStr.make('Type', 'value').matches('itemm')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(xstr.newCopy()).toBe(xstr)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(xstr.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: xstr })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(xstr.toList()).toValEqual(HList.make([xstr]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const xstr = HXStr.make('Type', 'value')
			expect(xstr.toDict()).toValEqual(HDict.make({ val: xstr }))
		})
	}) // #toDict()
})

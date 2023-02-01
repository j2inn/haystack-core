/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

import { HDict, HValObj } from '../../src/core/HDict'
import { HNum } from '../../src/core/HNum'
import { Kind } from '../../src/core/Kind'
import { HStr } from '../../src/core/HStr'
import { HMarker } from '../../src/core/HMarker'
import { HBool } from '../../src/core/HBool'
import { HList } from '../../src/core/HList'
import { HGrid } from '../../src/core/HGrid'
import { HVal } from '../../src/core/HVal'
import { HSymbol } from '../../src/core/HSymbol'
import { HNamespace } from '../../src/core/HNamespace'
import { HaysonDict } from '../../src/core/hayson'
import { HFilter } from '../../src/filter/HFilter'
import '../matchers'
import '../customMatchers'
import { HDateTime } from '../../src/core/HDateTime'

describe('HDict', function (): void {
	let dict: HDict
	let values: HValObj

	beforeEach(function (): void {
		values = {}

		values['foo'] = HStr.make('foovalue')
		values['goo'] = HNum.make(99)
		values['soo'] = HMarker.make()

		dict = HDict.make(values)
	})

	describe('#constructor()', function (): void {
		it('creates a dict', function (): void {
			expect(new HDict({ foo: HBool.make(true) }) instanceof HDict).toBe(
				true
			)
		})

		it('creates an empty dict when no arguments', function (): void {
			expect(new HDict()).toEqual(new HDict({}))
		})

		it('creates a dict from a hayson dict', function (): void {
			expect(
				new HDict({
					foo: 'foovalue',
					goo: 99,
					soo: { _kind: Kind.Marker },
				})
			).toEqual(dict)
		})

		it('creates a dict from a hayson dict with a null value', function (): void {
			const haysonDict = {
				foo: 'foovalue',
				goo: 99,
				soo: { _kind: Kind.Marker },
				zoo: null,
			} as unknown as HaysonDict

			dict.set('zoo', null)

			expect(new HDict(haysonDict)).toEqual(dict)
		})

		it('creates a dict from a hayson dict with HVals', function (): void {
			values['too'] = HStr.make('something else')
			dict = HDict.make(values)

			expect(
				new HDict({
					foo: 'foovalue',
					goo: 99,
					soo: { _kind: Kind.Marker },
					too: HStr.make('something else'),
				})
			).toEqual(dict)
		})

		it('creates a dict from a haystack boolean', function (): void {
			expect(new HDict(HBool.make(true))).toValEqual(
				new HDict({ val: HBool.make(true) })
			)
		})

		it('creates a dict from a haystack string', function (): void {
			expect(new HDict(HStr.make('test'))).toValEqual(
				new HDict({ val: HStr.make('test') })
			)
		})

		it('creates a dict from a haystack dict', function (): void {
			expect(new HDict(dict)).toEqual(dict)
		})

		it('creates a dict from a haystack list', function (): void {
			const list = HList.make('foo', 123)

			const newDict = new HDict({
				val: list,
			})

			expect(new HDict(list)).toValEqual(newDict)
		})

		it('creates a dict from a haystack grid', function (): void {
			const grid = HGrid.make({
				rows: [
					{ foo: 'foo0', boo: 0 },
					{ foo: 'foo1', boo: 1 },
					{ foo: 'foo2', boo: 2 },
				],
			})

			const newDict = new HDict({
				row0: { foo: 'foo0', boo: 0 },
				row1: { foo: 'foo1', boo: 1 },
				row2: { foo: 'foo2', boo: 2 },
			})

			expect(new HDict(grid)).toValEqual(newDict)
		})
	}) // .make()

	describe('.make()', function (): void {
		it('makes a dict', function (): void {
			expect(HDict.make({ foo: HBool.make(true) }) instanceof HDict).toBe(
				true
			)
		})

		it('makes a dict from a dict', function (): void {
			expect(HDict.make(dict)).toBe(dict)
		})

		it('makes a typed dict', function (): void {
			interface TypedDict extends HDict {
				tag: HNum
			}

			const typed = HDict.make<TypedDict>({ tag: 42 })
			expect(typed.tag.equals(HNum.make(42))).toBeTruthy()
		})
	}) // .make()

	describe('#toObj()', function (): void {
		it('returns the underlying object for the dict', function (): void {
			expect(dict.toObj()).toEqual(values)
		})
	}) // #toObj()

	describe('#get()', function (): void {
		it('returns haystack undefined for a property that cannot be found', function (): void {
			expect(dict.get('boo')).toBeUndefined()
		})

		it('returns a string value for a property', function (): void {
			expect(dict.get('foo')).toEqual(HStr.make('foovalue'))
		})

		it('returns null for a null property', function (): void {
			dict.set('boo', null)
			expect(dict.get('boo')).toBeNull()
		})
	}) // #get()

	describe('#valueOf()', function (): void {
		it('returns the instance', function (): void {
			expect(dict.valueOf()).toBe(dict)
		})
	}) // #valueOf()

	describe('#toString()', function (): void {
		it('returns a human readable string', function (): void {
			dict.set('nullVal', null)
			expect(dict.toString()).toBe(
				'{foo: foovalue, goo: 99.0, soo, nullVal: null}'
			)
		})
	}) // #toString()

	describe('#toJSON()', function (): void {
		it('returns a JSON Object', function (): void {
			expect(dict.toJSON()).toEqual({
				foo: 'foovalue',
				goo: 99,
				soo: { _kind: 'marker' },
			})
		})
	}) // #toJSON()

	describe('#toFilter()', function (): void {
		it('throws an error', function (): void {
			expect((): void => {
				dict.toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('encodes to zinc format', function (): void {
			dict.set('nullVal', null)
			expect(dict.toZinc()).toBe('{foo:"foovalue" goo:99 soo nullVal:N}')
		})

		it('returns the dict with an embedded grid', function (): void {
			const grid = HGrid.make([{ foo: 'foo' }])
			dict = HDict.make({ grid })

			expect(dict.toZinc()).toBe('{grid:<<\nver:"3.0"\nfoo\n"foo"\n>>}')
		})
	}) // #toZinc()

	describe('#toAxon()', function (): void {
		it('returns an Axon encoded string', function (): void {
			dict.set('nullVal', null)
			expect(dict.toAxon()).toBe(
				'{foo:"foovalue",goo:99,soo,nullVal:null}'
			)
		})
	}) // #toAxon()

	describe('#equals()', function (): void {
		it('returns true when values match', function (): void {
			expect(
				dict.equals(
					HDict.make({
						foo: HStr.make('foovalue'),
						goo: HNum.make(99),
						soo: HMarker.make(),
					})
				)
			).toBe(true)
		})

		it('returns false when compared to an empty dict', function (): void {
			expect(dict.equals(HDict.make({}))).toBe(false)
		})

		it('returns false when one of the values differs', function (): void {
			expect(
				dict.equals(
					HDict.make({
						foo: HStr.make('foovalue'),
						goo: HNum.make(98),
						soo: HMarker.make(),
					})
				)
			).toBe(false)
		})

		it('returns false when the keys are different', function (): void {
			expect(
				HDict.make({ foo: HMarker.make() }).equals(
					HDict.make({ boo: HMarker.make() })
				)
			).toBe(false)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		let dict0: HDict

		beforeEach(function (): void {
			dict0 = HDict.make({
				foo: HStr.make('foovalue'),
				goo: HNum.make(98),
				soo: HMarker.make(),
			})
		})

		it('returns -1 when first is less than second', function (): void {
			expect(dict0.compareTo(dict)).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(dict.compareTo(dict0)).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(dict.compareTo(dict)).toBe(0)
		})
	}) // #compareTo()

	describe('#is()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(dict.isKind(Kind.Dict)).toBe(true)
		})
		it('returns false when the kind does not match', function (): void {
			expect(dict.isKind(Kind.Str)).toBe(false)
		})
	}) // #is()

	describe('iterator', function (): void {
		it('iterates through a dict', function (): void {
			let i = 0
			for (const row of dict) {
				if (i === 0) {
					expect(row.name).toBe('foo')
					expect(row.value).toEqual(HStr.make('foovalue'))
				} else if (i === 1) {
					expect(row.name).toBe('goo')
					expect(row.value).toEqual(HNum.make(99))
				} else if (i === 2) {
					expect(row.name).toBe('soo')
					expect(row.value).toEqual(HMarker.make())
				} else {
					throw new Error('Invalid iterator')
				}
				++i
			}

			expect(i).toBe(3)
		})

		it('descopes a dict', function (): void {
			const array = [...dict]
			expect(array.length).toBe(3)
		})
	}) // iterator

	describe('proxy', function (): void {
		interface FooDict extends HDict {
			foo: HStr
		}

		let fooDict: FooDict

		beforeEach(function (): void {
			fooDict = dict as FooDict
		})

		it('proxies getter call to foo', function (): void {
			expect(fooDict.foo.value).toBe('foovalue')
		})

		it('proxies setter foo', function (): void {
			fooDict.foo = HStr.make('foovalue2')
			expect(dict.get<HStr>('foo')).toEqual(HStr.make('foovalue2'))
		})

		// Required for lodash to work with dict.
		it('access proxy by numerical key access', function (): void {
			expect(dict[0]).toEqual({
				name: 'foo',
				value: HStr.make('foovalue'),
			})
		})

		// Required for lodash to work with dict.
		it('access proxy by property name', function (): void {
			expect(dict.foo).toEqual(HStr.make('foovalue'))
		})
	}) // proxy

	describe('#set()', function (): void {
		it('set a value in a dict', function (): void {
			dict.set('foobee', HStr.make('foobar'))
			expect(dict.get('foobee')).toEqual(HStr.make('foobar'))
		})

		it('set a value in a dict using hayson', function (): void {
			dict.set('foobee', 'foobar')
			expect(dict.get('foobee')).toEqual(HStr.make('foobar'))
		})

		it('is chainable', function (): void {
			expect(dict.set('foobee', 'foobar')).toBe(dict)
		})
	}) // #set()

	describe('#has()', function (): void {
		it('returns true for a property that exists', function (): void {
			expect(dict.has('foo')).toBe(true)
		})

		it('returns false for a property that does not exist', function (): void {
			expect(dict.has('foobee')).toBe(false)
		})

		it('returns true for a null property', function (): void {
			dict.set('nullVal', null)
			expect(dict.has('nullVal')).toBe(true)
		})
	}) // #has()

	describe('#any()', function (): void {
		it('returns true for a property that exists', function (): void {
			expect(dict.any('foo')).toBe(true)
		})

		it('returns false for a property that does not exist', function (): void {
			expect(dict.any('foobee')).toBe(false)
		})

		it('returns true when a haystack filter matches', function (): void {
			expect(dict.any('foo == "foovalue"')).toBe(true)
		})

		it('returns true when a haystack filter matches and node is passed in', function (): void {
			const node = HFilter.parse('foo == "foovalue"')
			expect(dict.any(node)).toBe(true)
		})

		it('returns false when a haystack filter does not match', function (): void {
			expect(dict.any('goo < 99')).toBe(false)
		})

		it('returns true when the value exists in the dict', function (): void {
			expect(dict.any(HNum.make(99))).toBe(true)
		})

		it('returns false when the value does not exist in the dict', function (): void {
			expect(dict.any(HNum.make(98))).toBe(false)
		})

		it('returns true when a null value exists in the dict', function (): void {
			dict.set('nullVal', null)
			expect(dict.any(null)).toBe(true)
		})

		it('returns false when a null value does not exist in the dict', function (): void {
			expect(dict.any(null)).toBe(false)
		})
	}) // #any()

	describe('#matches()', function (): void {
		it('returns true for a property that exists', function (): void {
			expect(dict.matches('foo')).toBe(true)
		})

		it('returns false for a property that does not exist', function (): void {
			expect(dict.matches('foobee')).toBe(false)
		})

		it('returns true when a haystack filter matches', function (): void {
			expect(dict.matches('foo == "foovalue"')).toBe(true)
		})

		it('returns true when a haystack filter matches and node is passed in', function (): void {
			const node = HFilter.parse('foo == "foovalue"')
			expect(dict.matches(node)).toBe(true)
		})

		it('returns false when a haystack filter does not match', function (): void {
			expect(dict.matches('goo < 99')).toBe(false)
		})
	}) // #matches()

	describe('#remove()', function (): void {
		it('removes an entry from a dict', function (): void {
			expect(dict.matches('foo')).toBe(true)
			dict.remove('foo')
			expect(dict.matches('foo')).toBe(false)
		})
	}) // #remove()

	describe('#clear()', function (): void {
		it('clears all entries from a dict', function (): void {
			expect(dict.isEmpty()).toBe(false)
			dict.clear()
			expect(dict.isEmpty()).toBe(true)
		})
	}) // #clear()

	describe('#isEmpty()', function (): void {
		it('returns true when a dict is empty', function (): void {
			expect(HDict.make({}).isEmpty()).toBe(true)
		})

		it('returns false when a dict is not empty', function (): void {
			expect(dict.isEmpty()).toBe(false)
		})
	}) // #isEmpty()

	describe('#length', function (): void {
		it('returns the size of the dict', function (): void {
			expect(dict.length).toBe(3)
		})
	}) // #length

	describe('#keys', function (): void {
		it('returns the keys for a dict', function (): void {
			expect(dict.keys).toEqual(['foo', 'goo', 'soo'])
		})
	}) // #keys

	describe('#values', function (): void {
		it('returns the keys for a dict', function (): void {
			expect(dict.values).toEqual([
				HStr.make('foovalue'),
				HNum.make(99),
				HMarker.make(),
			])
		})
	}) // #values

	describe('#toObj()', function (): void {
		it('returns a copy of the internal object', function (): void {
			expect(dict.toObj()).toEqual({
				foo: HStr.make('foovalue'),
				goo: HNum.make(99),
				soo: HMarker.make(),
			})
		})
	}) // #toObj()

	describe('#toList()', function (): void {
		it('returns a haystack list from a dict', function (): void {
			const list = HList.make<HVal>(
				HStr.make('foovalue'),
				HNum.make(99),
				HMarker.make()
			)
			expect(dict.toList()).toEqual(list)
		})
	}) // #toList()

	describe('#toGrid()', function (): void {
		it('returns a grid', function (): void {
			const grid = HGrid.make({
				columns: [
					{
						name: 'foo',
					},
					{
						name: 'goo',
					},
					{
						name: 'soo',
					},
				],
				rows: [
					HDict.make({
						foo: HStr.make('foovalue'),
						goo: HNum.make(99),
						soo: HMarker.make(),
					}),
				],
			})

			expect(dict.toGrid().equals(grid))
		})
	}) // #toGrid()

	describe('#toDict()', function (): void {
		it('returns itself', function (): void {
			expect(dict.toDict()).toBe(dict)
		})
	}) // #toDict()

	describe('#newCopy()', function (): void {
		it('returns a new instance', function (): void {
			dict.set('nullVal', null)
			const copy = dict.newCopy()
			expect(dict).toEqual(copy)
			expect(dict).not.toBe(copy)
		})
	}) // #newCopy()

	describe('#validate()', function (): void {
		it('validates the dict to ensure we have a valid set of haystack values', function (): void {
			const obj = dict.toObj() as unknown as { [prop: string]: number }

			obj.goo = 100

			dict.validate()

			expect(obj).toEqual({
				foo: HStr.make('foovalue'),
				goo: HNum.make(100),
				soo: HMarker.make(),
			})
		})
	}) // #validate()

	describe('#defName', function (): void {
		it('returns the name of a def', function (): void {
			expect(HDict.make({ def: HSymbol.make('foo') }).defName).toBe('foo')
		})

		it('returns an empty string if the def name cannot be found', function (): void {
			expect(dict.defName).toBe('')
		})
	}) // #defName

	describe('namespace', function (): void {
		let ns: HNamespace

		beforeEach(function (): void {
			ns = new HNamespace(HGrid.make({}))
			HNamespace.defaultNamespace = ns
		})

		afterEach(function (): void {
			HNamespace.defaultNamespace = new HNamespace(HGrid.make({}))
		})

		describe('#reflect()', function (): void {
			beforeEach(function (): void {
				jest.spyOn(ns, 'reflect')
			})

			it('calls default namespace reflect with dict instance', function (): void {
				dict.reflect()
				expect(ns.reflect).toHaveBeenCalledWith(dict)
			})

			it('calls namespace reflect with dict instance', function (): void {
				dict.reflect(ns)
				expect(ns.reflect).toHaveBeenCalledWith(dict)
			})
		}) // #reflect()

		describe('#protos()', function (): void {
			beforeEach(function (): void {
				jest.spyOn(ns, 'protos')
			})

			it('calls default namespace protos with dict instance', function (): void {
				dict.protos()
				expect(ns.protos).toHaveBeenCalledWith(dict)
			})

			it('calls namespace protos with dict instance', function (): void {
				dict.protos(ns)
				expect(ns.protos).toHaveBeenCalledWith(dict)
			})
		}) // #protos()
	}) // namespace

	describe('.merge()', function (): void {
		it('merge multiple dicts into one', function (): void {
			const dict0 = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				foo: 99,
			})

			const dict1 = HDict.make({
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
				goo: null,
			})

			const result = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
				goo: null,
			})

			expect(HDict.merge(dict0, dict1)).toValEqual(result)
		})

		it('return an empty dict when no arguments', function (): void {
			expect(HDict.merge()).toValEqual(HDict.make({}))
		})
	}) // .merge()

	describe('#update()', function (): void {
		it('update a dict from a dict', function (): void {
			const dict0 = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				foo: 99,
				goo: 199,
			})

			const dict1 = HDict.make({
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
				goo: null,
			})

			const result = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
				goo: null,
			})

			expect(dict0.update(dict1)).toValEqual(result)
		})

		it('update a dict from a hayson dict', function (): void {
			const dict0 = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				foo: 99,
			})

			const dict1 = {
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
			}

			const result = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
			})

			expect(dict0.update(dict1)).toValEqual(result)
		})

		it('update a dict from multiple dicts', function (): void {
			const dict0 = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				foo: 99,
			})

			const dict1 = {
				d: 4,
				e: 5,
				f: 6,
				foo: 100,
			}

			const dict2 = HDict.make({
				g: 7,
				h: 8,
				i: 9,
				foo: 101,
			})

			const result = HDict.make({
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				g: 7,
				h: 8,
				i: 9,
				foo: 101,
			})

			expect(dict0.update(dict1, dict2)).toValEqual(result)
		})
	}) // #update()

	describe('#toDis()', function (): void {
		it('returns the dis from a dict', function (): void {
			expect(new HDict({ dis: 'dis' }).toDis()).toBe('dis')
		})

		it("returns a tag's string value", function (): void {
			expect(new HDict({ tag: 'tag' }).toDis({ name: 'tag' })).toBe('tag')
		})

		it('returns the default value if the tag value cannot be found', function (): void {
			expect(
				new HDict({ tag: 'tag' }).toDis({ name: 'foo', def: 'def' })
			).toBe('def')
		})

		it('returns the default value if a dict display string cannot be found', function (): void {
			expect(new HDict().toDis({ name: 'foo', def: 'def' })).toBe('def')
		})

		it('returns a localized string', function (): void {
			const i18n = jest.fn().mockReturnValue('test')
			expect(new HDict({ disKey: 'pod::key' }).toDis({ i18n })).toBe(
				'test'
			)
			expect(i18n).toHaveBeenCalledWith('pod', 'key')
		})

		it('returns a localized string from a macro', function (): void {
			const i18n = jest.fn().mockReturnValue('test')
			expect(new HDict({ disMacro: '$<pod::key>' }).toDis({ i18n })).toBe(
				'test'
			)
			expect(i18n).toHaveBeenCalledWith('pod', 'key')
		})
	}) // #toDis()

	describe('#diff()', function (): void {
		it('returns a dict with removed values', function (): void {
			const dict = new HDict({ a: 'a', b: 'b', c: 'c' })
			const newDict = new HDict({ a: 'a', c: 'd', e: 'e' })
			const diff = dict.diff(newDict)

			expect(diff.toJSON()).toEqual({
				b: {
					_kind: 'remove',
				},
				c: 'd',
				e: 'e',
			})
		})
	}) // #diff()

	describe('isNewer()', function (): void {
		let dict1: HDict
		let dict2: HDict

		beforeEach(function (): void {
			dict1 = new HDict({
				mod: HDateTime.make('2022-12-21T12:45:00Z'),
			})

			dict2 = new HDict({
				mod: HDateTime.make('2022-12-21T12:42:00Z'),
			})
		})

		it('returns true if dict1 gets compared to dict2', function (): void {
			expect(dict1.isNewer(dict2)).toBe(true)
		})

		it('returns false if dict2 gets compared to dict1', function (): void {
			expect(dict2.isNewer(dict1)).toBe(false)
		})

		it('returns true if mod is not defined in for first dict', function (): void {
			dict1 = new HDict({
				foo: 'foo',
				mod: HDateTime.make('2022-12-21T12:45:00Z'),
			})

			dict2 = new HDict({
				foo: 'foo',
			})

			expect(dict1.isNewer(dict2)).toBe(true)
		})

		it('returns true if mod is not defined in first dict', function (): void {
			dict1 = new HDict({
				foo: 'foo',
			})

			dict2 = new HDict({
				foo: 'foo',
				mod: HDateTime.make('2022-12-21T12:45:00Z'),
			})

			expect(dict1.isNewer(dict2)).toBe(true)
		})

		it('returns true if mods are the same', function (): void {
			dict1 = new HDict({
				foo: 'foo',
				mod: HDateTime.make('2022-12-21T12:45:00Z'),
			})

			dict2 = new HDict({
				foo: 'foo',
				mod: HDateTime.make('2022-12-21T12:45:00Z'),
			})

			expect(dict1.isNewer(dict2)).toBe(true)
		})
	}) // isNewer()
})

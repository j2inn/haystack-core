/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

import {
	HGrid,
	DEFAULT_GRID_VERSION,
	GridColumn,
	GRID_VERSION_NAME,
} from '../../src/core/HGrid'
import { HDict } from '../../src/core/dict/HDict'
import { HStr } from '../../src/core/HStr'
import { Kind } from '../../src/core/Kind'
import { HNum } from '../../src/core/HNum'
import { HMarker } from '../../src/core/HMarker'
import { HList } from '../../src/core/HList'
import { HRef } from '../../src/core/HRef'
import { HFilter } from '../../src/filter/HFilter'
import { HaysonDict } from '../../src/core/hayson'
import '../matchers'
import '../customMatchers'
import { HBool } from '../../src/core/HBool'
import { ZincReader } from '../../src/core/ZincReader'

describe('HGrid', function (): void {
	let grid: HGrid
	let meta: HDict
	let columns: { name: string; meta?: HDict }[]
	let rows: HDict[]

	beforeEach(function (): void {
		columns = [
			{
				name: 'foo',
				meta: HDict.make(),
			},
		]
		rows = [HDict.make({ foo: 'foo' })]
		meta = HDict.make()

		grid = HGrid.make({ meta, columns, rows })
	})

	function makeGridWithRows(): void {
		columns = [
			{
				name: 'col0',
			},
			{
				name: 'col1',
			},
			{
				name: 'col2',
			},
		]
		rows = [
			HDict.make({ col0: 'row0', col1: 0, col2: { _kind: Kind.Marker } }),
			HDict.make({ col0: 'row1', col1: 1, col2: { _kind: Kind.Marker } }),
			HDict.make({ col0: 'row2', col1: 2, col2: { _kind: Kind.Marker } }),
		]
		meta = HDict.make()

		grid = new HGrid({ meta, columns, rows })
	}

	describe('GridColumn', function (): void {
		let col: GridColumn

		beforeEach(function (): void {
			col = grid.getColumns()[0]
		})

		it('has a name', function (): void {
			expect(col.name).toBe('foo')
		})

		it('has meta data', function (): void {
			expect(col.meta).toEqual(HDict.make())
		})

		describe('#dis', function (): void {
			it('returns the display name of the column when there is dis meta data', function (): void {
				const displayName = 'A display name'
				col.meta.set('dis', HStr.make(displayName))

				expect(col.dis).toBe(displayName)
			})

			it('returns the name of the column when there is no dis meta data', function (): void {
				expect(col.dis).toBe('foo')
			})
		}) // #dis

		describe('#displayName', function (): void {
			it('returns the display name of the column when there is dis meta data', function (): void {
				const displayName = 'A display name'
				col.meta.set('dis', HStr.make(displayName))

				expect(col.displayName).toBe(displayName)
			})

			it('returns the name of the column when there is no dis meta data', function (): void {
				expect(col.displayName).toBe('foo')
			})
		}) // #displayName

		describe('#equals()', function (): void {
			it('returns true when the column is the same', function (): void {
				expect(col.equals(col)).toBe(true)
			})

			it('returns false when null is passed in', function (): void {
				expect(col.equals(null as unknown as GridColumn)).toBe(false)
			})

			it('returns false when undefined is passed in', function (): void {
				expect(col.equals(undefined as unknown as GridColumn)).toBe(
					false
				)
			})

			it('returns false when a string is passed in', function (): void {
				expect(
					col.equals(HStr.make('foo') as unknown as GridColumn)
				).toBe(false)
			})

			it('returns false when the column name is different', function (): void {
				const otherCol = new GridColumn('boo', HDict.make())
				expect(col.equals(otherCol)).toBe(false)
			})

			it('returns false when the meta data is different', function (): void {
				const otherCol = new GridColumn(
					'foo',
					HDict.make({ foo: HStr.make('foo') })
				)
				expect(col.equals(otherCol)).toBe(false)
			})
		}) // #equals()
	}) // GridColumn

	describe('row', function (): void {
		it('adds a new column when setting value that does not exist in the dict', function (): void {
			expect(grid.getColumns().length).toBe(1)
			const dict = grid.get(0) as HDict
			dict.set('boo', true)
			expect(grid.getColumns().length).toBe(2)
			expect(grid.getColumns()[1].name).toBe('boo')
		})
	}) // row

	describe('grid', function (): void {
		describe('#constructor()', function (): void {
			it('creates a grid', function (): void {
				expect(grid instanceof HGrid).toBe(true)
			})

			it('creates an empty grid', function (): void {
				expect(new HGrid().isEmpty()).toBe(true)
			})

			it('creates a grid with the default version', function (): void {
				expect(grid.version).toBe(DEFAULT_GRID_VERSION)
			})

			it('creates a grid with a different version', function (): void {
				expect(
					new HGrid({ meta, columns, rows, version: 'otherVersion' })
						.version
				).toBe('otherVersion')
			})

			it('creates a grid with no column meta data specified', function (): void {
				columns = [
					{
						name: 'foo',
					},
				]

				grid = new HGrid({ meta, columns, rows })

				expect(grid.getColumns()[0].meta).toEqual(HDict.make())
			})

			it('creates a grid from a hayson object', function (): void {
				expect(
					new HGrid({
						cols: [{ name: 'foo' }],
						rows: [{ foo: 'foo' }],
					})
				).toEqual(grid)
			})

			it('creates a grid from a hayson object with meta data', function (): void {
				const metaGrid = new HGrid({
					meta: {
						boo: 'doo',
					},
					cols: [{ name: 'foo', meta: { this: 'that' } }],
					rows: [{ foo: 'foo' }],
				})

				expect(metaGrid.meta.toJSON()).toEqual({ boo: 'doo' })
				expect(metaGrid.getColumn(0)?.meta?.toJSON()).toEqual({
					this: 'that',
				})
			})

			it('creates a grid from a haystack number', function (): void {
				const newGrid = new HGrid({
					rows: [{ val: 123 }],
				})

				expect(new HGrid(HNum.make(123))).toValEqual(newGrid)
			})

			it('creates a grid from a haystack boolean', function (): void {
				const newGrid = new HGrid({
					rows: [{ val: true }],
				})

				expect(new HGrid(HBool.make(true))).toValEqual(newGrid)
			})

			it('creates a grid from a grid', function (): void {
				expect(new HGrid(grid)).toValEqual(grid)
			})

			it('creates a grid from a dict', function (): void {
				const dict = HDict.make({ foo: 'foovalue' })

				const newGrid = new HGrid({
					rows: [dict],
				})

				expect(new HGrid(dict)).toValEqual(newGrid)
			})

			it('creates a grid from an array of dicts', function (): void {
				const dict = HDict.make({ foo: 'foovalue' })
				const newGrid = new HGrid([dict])

				expect(new HGrid(dict)).toValEqual(newGrid)
			})

			it('creates a grid from an array of hayson dicts', function (): void {
				const hayson = { foo: 'foovalue' }
				const dict = HDict.make(hayson)
				const newGrid = new HGrid([dict])

				expect(new HGrid([hayson])).toValEqual(newGrid)
			})

			it('creates a grid from hayson and ensures the version is removed from the meta', function (): void {
				const grid = new HGrid({
					rows: [
						new HDict({ id: HRef.make('a'), dis: 'a display' }),
						new HDict({ id: HRef.make('b'), dis: 'b display' }),
					],
				})

				const gridJson = grid.toJSON()

				expect(gridJson?.meta?.ver).toBe(DEFAULT_GRID_VERSION)

				const decodedGrid = new HGrid(gridJson)

				expect(decodedGrid.equals(grid)).toBe(true)
				expect(decodedGrid.meta.has(GRID_VERSION_NAME)).toBe(false)
			})
		}) // #constructor()

		describe('.make()', function (): void {
			it('makes a grid from a hayson object', function (): void {
				expect(
					HGrid.make({
						cols: [{ name: 'foo' }],
						rows: [{ foo: 'foo' }],
					})
				).toEqual(grid)
			})

			it('makes a grid that returns a grid', function (): void {
				expect(grid === HGrid.make(grid)).toBe(true)
			})
		}) //.make()

		describe('.DEFAULT_GRID_VERSION', function (): void {
			it('Uses version 3 for zinc', function (): void {
				expect(DEFAULT_GRID_VERSION).toBe('3.0')
			})
		}) // .DEFAULT_GRID_VERSION

		describe('#getKind()', function (): void {
			it("returns the grid's kind", function (): void {
				expect(grid.getKind()).toBe(Kind.Grid)
			})
		}) // #getKind()

		describe('#toJSON()', function (): void {
			it('returns a JSON representation of a grid', function (): void {
				grid.get(0)?.set('goo', null)

				expect(grid.toJSON()).toEqual({
					_kind: Kind.Grid,
					meta: { ver: DEFAULT_GRID_VERSION },
					cols: [
						{
							name: 'foo',
							meta: {},
						},
						{
							name: 'goo',
							meta: {},
						},
					],
					rows: [
						{
							foo: 'foo',
							goo: null,
						},
					],
				})
			})

			it('lazily adds columns when generating JSON', function (): void {
				grid.getRows().push(HDict.make({ boo: true }))

				expect(grid.toJSON()).toEqual({
					_kind: Kind.Grid,
					meta: { ver: DEFAULT_GRID_VERSION },
					cols: [
						{
							name: 'foo',
							meta: {},
						},
						{
							name: 'boo',
							meta: {},
						},
					],
					rows: [
						{
							foo: 'foo',
						},
						{
							boo: true,
						},
					],
				})
			})
		}) // #toJSON()

		describe('#toJSONv3()', function (): void {
			it('returns a JSON representation of a grid', function (): void {
				grid.get(0)?.set('goo', null)

				expect(grid.toJSONv3()).toEqual({
					meta: { ver: DEFAULT_GRID_VERSION },
					cols: [
						{
							name: 'foo',
						},
						{
							name: 'goo',
						},
					],
					rows: [
						{
							foo: 'foo',
							goo: null,
						},
					],
				})
			})

			// https://project-haystack.org/doc/docHaystack/Json
			it('decode example 1 from project haystack spec into JSON', function (): void {
				const zinc = `ver:"3.0" projName:"test"
dis dis:"Equip Name",equip,siteRef,installed
"RTU-1",M,@153c-699a "HQ",2005-06-01
"RTU-2",M,@153c-699a "HQ",1999-07-12

`
				const value = ZincReader.readValue(zinc)

				expect(value?.toJSONv3()).toEqual({
					meta: { ver: '3.0', projName: 'test' },
					cols: [
						{ name: 'dis', dis: 'Equip Name' },
						{ name: 'equip' },
						{ name: 'siteRef' },
						{ name: 'installed' },
					],
					rows: [
						{
							dis: 'RTU-1',
							equip: 'm:',
							siteRef: 'r:153c-699a HQ',
							installed: 'd:2005-06-01',
						},
						{
							dis: 'RTU-2',
							equip: 'm:',
							siteRef: 'r:153c-699a HQ',
							installed: 'd:1999-07-12',
						},
					],
				})
			})

			it('decode example 2 from project haystack spec into JSON', function (): void {
				const zinc = `ver:"3.0"
type,val
"list",[1,2,3]
"dict",{dis:"Dict!" foo}
"grid",<<
 ver:"3.0"
 a,b
 1,2
 3,4
 >>
"scalar","simple string"

`
				const value = ZincReader.readValue(zinc)

				expect(value?.toJSONv3()).toEqual({
					meta: { ver: '3.0' },
					cols: [{ name: 'type' }, { name: 'val' }],
					rows: [
						{ type: 'list', val: ['n:1', 'n:2', 'n:3'] },
						{ type: 'dict', val: { dis: 'Dict!', foo: 'm:' } },
						{
							type: 'grid',
							val: {
								meta: { ver: '3.0' },
								cols: [{ name: 'a' }, { name: 'b' }],
								rows: [
									{ a: 'n:1', b: 'n:2' },
									{ a: 'n:3', b: 'n:4' },
								],
							},
						},
						{ type: 'scalar', val: 'simple string' },
					],
				})
			})
		}) // #toJSONv3()

		describe('#valueOf()', function (): void {
			it('returns the instance', function (): void {
				expect(grid.valueOf()).toBe(grid)
			})
		}) // #valueOf()

		describe('#toFilter()', function (): void {
			it('throws an error', function (): void {
				expect((): void => {
					grid.toFilter()
				}).toThrow()
			})
		}) // #toFilter()

		describe('#toString()', function (): void {
			it('returns a human readable string', function (): void {
				grid.add({ test: 'me', number: 4, boo: true })
				expect(grid.toString()).toEqual(
					'[{foo: foo}, {test: me, number: 4, boo: true}]'
				)
			})
		}) // #toString()

		describe('#toZinc()', function (): void {
			it('returns a zinc encoded grid', function (): void {
				grid[0]?.set('goo', null)
				const zinc = 'ver:"3.0"\nfoo,goo\n"foo",N\n'
				expect(grid.toZinc()).toEqual(zinc)
			})

			it('returns a nested zinc encoded grid', function (): void {
				const zinc = '<<\nver:"3.0"\nfoo\n"foo"\n>>'
				expect(grid.toZinc(/*nested*/ true)).toEqual(zinc)
			})

			it('encodes an empty grid', function (): void {
				expect(HGrid.make({}).toZinc()).toBe('ver:"3.0"\nempty\n\n')
			})

			it('returns a grid with a nested zinc encoded grid', function (): void {
				const outerGrid = HGrid.make([HDict.make({ grid })])
				expect(outerGrid.toZinc()).toEqual(
					'ver:"3.0"\ngrid\n<<\nver:"3.0"\nfoo\n"foo"\n>>\n'
				)
			})

			it('returns zinc encoded grid with meta data', function (): void {
				grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				const zinc =
					'ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites",val dis:"Value" unit:"kW"\n' +
					'"Site 1",356.214kW\n' +
					'"Site 2",463.028kW\n'

				expect(grid.toZinc()).toEqual(zinc)
			})

			it('lazily adds columns when rows is added to outside of grid object', function (): void {
				grid = HGrid.make({
					meta: HDict.make({
						database: HStr.make('test'),
						dis: HStr.make('Site Energy Summary'),
					}),
					columns: [
						{
							name: 'siteName',
							meta: HDict.make({
								dis: HStr.make('Sites'),
							}),
						},
						{
							name: 'val',
							meta: HDict.make({
								dis: HStr.make('Value'),
								unit: HStr.make('kW'),
							}),
						},
					],
					rows: [
						HDict.make({
							siteName: HStr.make('Site 1'),
							val: HNum.make(356.214, 'kW'),
						}),
						HDict.make({
							siteName: HStr.make('Site 2'),
							val: HNum.make(463.028, 'kW'),
						}),
					],
				})

				grid.getRows().push(HDict.make({ foo: true }))

				const zinc =
					'ver:"3.0" database:"test" dis:"Site Energy Summary"\n' +
					'siteName dis:"Sites",val dis:"Value" unit:"kW",foo\n' +
					'"Site 1",356.214kW,\n' +
					'"Site 2",463.028kW,\n' +
					',,T\n'

				expect(grid.toZinc()).toEqual(zinc)
			})
		}) // #toZinc()

		describe('#toAxon()', function (): void {
			it('returns an Axon encoded string', function (): void {
				expect(grid.toAxon()).toBe('[{foo:"foo"}].toGrid')
			})

			it('returns an Axon encoded string with meta data', function (): void {
				grid.meta.set('test', 'me')
				expect(grid.toAxon()).toBe(
					'[{foo:"foo"}].toGrid.addMeta({test:"me"})'
				)
			})
		}) // #toAxon()

		describe('#equals()', function (): void {
			it('returns false when null is passed in', function (): void {
				expect(grid.equals(null as unknown as HGrid)).toBe(false)
			})

			it('returns false when undefined is passed in', function (): void {
				expect(grid.equals(undefined as unknown as HGrid)).toBe(false)
			})

			it('returns false when a string is passed in', function (): void {
				expect(grid.equals(HStr.make('foo') as unknown as HGrid)).toBe(
					false
				)
			})

			it('returns true when the grids match', function (): void {
				expect(grid).toValEqual(grid)
			})

			it("returns false when the version doesn't match", function (): void {
				const otherGrid = HGrid.make({
					columns,
					rows,
					version: 'otherVersion',
				})
				expect(grid).not.toValEqual(otherGrid)
			})

			it("returns false when the meta data doesn't match", function (): void {
				const otherGrid = HGrid.make({
					meta: HDict.make({ foo: HStr.make('foo') }),
					columns,
					rows,
				})
				expect(grid).not.toValEqual(otherGrid)
			})

			it('returns false when the columns do not match', function (): void {
				const otherGrid = HGrid.make({
					meta,
					columns: [{ name: 'otherCol', meta: HDict.make() }],
					rows,
				})
				expect(grid).not.toValEqual(otherGrid)
			})

			it('returns false when the columns length differ', function (): void {
				const otherGrid = HGrid.make({
					meta,
					columns: columns.concat([
						{ name: 'otherCol', meta: HDict.make() },
					]),
					rows,
				})
				expect(grid).not.toValEqual(otherGrid)
			})

			it('returns false when the rows differ', function (): void {
				const otherGrid = HGrid.make({
					meta,
					columns,
					rows: [HDict.make({ foo: HStr.make('goo') })],
				})
				expect(grid).not.toValEqual(otherGrid)
			})
		}) // #equals()

		describe('#compareTo()', function (): void {
			let grid0: HGrid
			let grid1: HGrid

			beforeEach(function (): void {
				grid0 = HGrid.make({
					columns: [{ name: 'num' }],
					rows: [HDict.make({ num: 0 })],
				})

				grid1 = HGrid.make({
					columns: [{ name: 'num' }],
					rows: [HDict.make({ num: 1 })],
				})
			})

			it('returns -1 when first is less than second', function (): void {
				expect(grid0.compareTo(grid1)).toBe(-1)
			})

			it('returns 1 when first is greater than second', function (): void {
				expect(grid1.compareTo(grid0)).toBe(1)
			})

			it('returns 0 when first is equal to second', function (): void {
				expect(grid0.compareTo(grid0)).toBe(0)
			})
		}) // #compareTo()

		describe('#getRows()', function (): void {
			it('returns all the rows from the grid', function (): void {
				const rows = grid.getRows()

				expect(rows.length).toBe(1)
				expect(rows[0].values.length).toBe(1)
				expect(rows[0].values[0]).toEqual(HStr.make('foo'))
			})
		}) // #getRows()

		describe('#get()', function (): void {
			it('returns a row', function (): void {
				const row = grid.get(0) as HDict
				expect(row.values[0]).toEqual(HStr.make('foo'))
			})

			it("returns haystack undefined when a row can't be found", function (): void {
				expect(grid.get(1)).toBeUndefined()
			})

			it('throws an error for an invalid index number', function (): void {
				expect((): void => {
					grid.get(-1)
				}).toThrow()
			})
		}) // #get()

		describe('#first()', function (): void {
			it('returns a row', function (): void {
				const row = grid.first as HDict
				expect(row.values[0]).toEqual(HStr.make('foo'))
			})

			it("returns haystack undefined when a row can't be found", function (): void {
				expect(HGrid.make().first).toBeUndefined()
			})
		}) // #first()

		describe('#last()', function (): void {
			it('returns a row', function (): void {
				const row = grid.last as HDict
				expect(row.values[0]).toEqual(HStr.make('foo'))
			})

			it("returns haystack undefined when a row can't be found", function (): void {
				expect(HGrid.make().last).toBeUndefined()
			})
		}) // #last()

		describe('#remove()', function (): void {
			describe('remove via index', function (): void {
				it('removes a row from the grid', function (): void {
					expect(grid.length).toBe(1)
					grid.remove(0)
					expect(grid.length).toBe(0)
				})

				it('returns the removed row from the grid', function (): void {
					const removed = grid.remove(0)

					const expected = [HDict.make({ foo: HStr.make('foo') })]

					expect(removed.length).toEqual(expected.length)
					expect(removed[0].equals(expected[0])).toBe(true)
				})

				it('returns an empty array when no row is removed', function (): void {
					expect(grid.remove(1)).toEqual([])
				})
			})

			describe('remove via a filter', function (): void {
				it('removes a row from the grid', function (): void {
					expect(grid.length).toBe(1)
					grid.remove('foo == "foo"')
					expect(grid.length).toBe(0)
				})

				it('removes a row from the grid via a node', function (): void {
					const node = HFilter.parse('foo == "foo"')
					expect(grid.length).toBe(1)
					grid.remove(node)
					expect(grid.length).toBe(0)
				})

				it('does not remove a row from the grid when there is not a match', function (): void {
					expect(grid.length).toBe(1)
					grid.remove('foo == "food"')
					expect(grid.length).toBe(1)
				})

				it('returns the rows removed', function (): void {
					const row = grid.get(0) as HDict
					expect(grid.remove('foo == "foo"')).toEqual([row])
				})

				it('removes multiple rows', function (): void {
					makeGridWithRows()
					const removed = grid.remove(
						'col0 == "row0" or col0 == "row1"'
					)

					const expected = [
						HDict.make({
							col0: HStr.make('row0'),
							col1: HNum.make(0),
							col2: HMarker.make(),
						}),
						HDict.make({
							col0: HStr.make('row1'),
							col1: HNum.make(1),
							col2: HMarker.make(),
						}),
					]

					expect(removed.length).toBe(expected.length)
					expect(removed[0].equals(expected[0])).toBe(true)
					expect(removed[1].equals(expected[1])).toBe(true)
				})
			})
		}) // #remove()

		describe('#length', function (): void {
			it('returns the number of rows', function (): void {
				expect(grid.length).toBe(1)
			})
		}) // #length

		describe('#set()', function (): void {
			it('sets the values in a row at the specified index', function (): void {
				const value = HStr.make('boo')
				grid.set(0, HDict.make({ foo: 'boo' }))
				const row = grid.get(0) as HDict
				expect(row.values[0]).toEqual(value)
			})

			it('sets the values in the row via a dict', function (): void {
				const value = HStr.make('boo')

				const dict = HDict.make({ foo: value })
				grid.set(0, dict)

				const row = grid.get(0) as HDict
				expect(row.values[0]).toEqual(value)
			})

			it('sets the values in the row via a dict using hayson', function (): void {
				const value = HStr.make('boo')

				grid.set(0, { foo: 'boo' })

				const row = grid.get(0) as HDict
				expect(row.values[0]).toEqual(value)
			})

			it('throws an error if the value being passed in is not a dict', function (): void {
				expect((): void => {
					grid.set(0, 'foo' as unknown as HaysonDict)
				}).toThrow()
			})

			it('is chainable', function (): void {
				expect(grid.set(0, { foo: 'boo' })).toBe(grid)
			})
		}) // #set()

		describe('#add()', function (): void {
			it('adds a row from some values', function (): void {
				const value = HStr.make('boo')

				expect(grid.length).toBe(1)

				grid.add(HDict.make({ foo: value }))

				expect(grid.length).toBe(2)

				const row = grid.get(1) as HDict
				expect(row.values[0]).toValEqual(value)
			})

			it('adds a row from some hayson values', function (): void {
				const value = HStr.make('boo')

				expect(grid.length).toBe(1)

				grid.add({ foo: 'boo' })

				expect(grid.length).toBe(2)

				const row = grid.get(1) as HDict
				expect(row.values[0]).toValEqual(value)
			})

			it('adds a row from a dict', function (): void {
				const value = HStr.make('boo')
				const dict = HDict.make({ foo: value })

				expect(grid.length).toBe(1)
				grid.add(dict)
				expect(grid.length).toBe(2)

				const row = grid.get(1) as HDict
				expect(row.values[0]).toValEqual(value)
			})

			it('throws an error if a non-dict value is added', function (): void {
				expect((): void => {
					grid.add([] as unknown as HDict)
				}).toThrow()
			})

			it('adds missing columns to grid', function (): void {
				expect(grid.getColumns().length).toBe(1)

				grid.add({ boo: true })

				expect(grid.getColumns().length).toBe(2)
				expect(grid.getColumns()[1].name).toBe('boo')
			})

			it('is chainable', function (): void {
				expect(grid.add({ foo: 'boo' })).toBe(grid)
			})

			describe('add multiple arguments', function (): void {
				let dict1: HDict
				let dict2: HDict
				let haysonDict1: HaysonDict
				let haysonDict2: HaysonDict

				beforeEach(function (): void {
					haysonDict1 = { foo: 'dict1' }
					dict1 = HDict.make(haysonDict1)

					haysonDict2 = { foo: 'dict2' }
					dict2 = HDict.make(haysonDict2)
				})

				function testAfter(): void {
					expect(grid.length).toBe(3)
					expect(grid.get(1)).toValEqual(dict1)
					expect(grid.get(2)).toValEqual(dict2)
				}

				it('using dicts', function (): void {
					grid.add(dict1, dict2)
					testAfter()
				})

				it('using an array of dicts', function (): void {
					grid.add([dict1, dict2])
					testAfter()
				})

				it('using multiple arrays of dicts', function (): void {
					grid.add([dict1], [dict2])
					testAfter()
				})

				it('using hayson dicts', function (): void {
					grid.add(haysonDict1, haysonDict2)
					testAfter()
				})

				it('using an array of hayson dicts', function (): void {
					grid.add([haysonDict1, haysonDict2])
					testAfter()
				})

				it('using multiple arrays of hayson dicts', function (): void {
					grid.add([haysonDict1], [haysonDict2])
					testAfter()
				})
			})
		}) // #add()

		describe('#insert()', function (): void {
			let haysonDict1: HaysonDict
			let haysonDict2: HaysonDict
			let dict1: HDict
			let dict2: HDict

			beforeEach(function (): void {
				grid.add({ foo: 'last' })

				haysonDict1 = { foo: 'inserted1' }
				dict1 = HDict.make(haysonDict1)

				haysonDict2 = { foo: 'inserted2' }
				dict2 = HDict.make(haysonDict2)
			})

			function getFoo(index: number): string {
				const row = grid.get(index)

				if (row) {
					const str = row.get<HStr>('foo')
					return (str && str.value) || ''
				} else {
					throw new Error('Cannot find row')
				}
			}

			it('inserts a dict into a grid', function (): void {
				expect(grid.length).toBe(2)

				grid.insert(1, dict1)

				expect(grid.length).toBe(3)

				expect(getFoo(0)).toBe('foo')
				expect(getFoo(1)).toBe('inserted1')
				expect(getFoo(2)).toBe('last')
			})

			it('inserts a hayson dict into a grid', function (): void {
				expect(grid.length).toBe(2)

				grid.insert(1, haysonDict1)

				expect(grid.length).toBe(3)

				expect(getFoo(0)).toBe('foo')
				expect(getFoo(1)).toBe('inserted1')
				expect(getFoo(2)).toBe('last')
			})

			it('is chainable', function (): void {
				expect(grid.insert(1, { foo: 'test' })).toBe(grid)
			})

			describe('inserts multiple arguments', function (): void {
				function testAfter(): void {
					expect(grid.length).toBe(4)

					expect(getFoo(0)).toBe('foo')
					expect(getFoo(1)).toBe('inserted1')
					expect(getFoo(2)).toBe('inserted2')
					expect(getFoo(3)).toBe('last')
				}

				it('using dicts', function (): void {
					grid.insert(1, dict1, dict2)
					testAfter()
				})

				it('using an array of dicts', function (): void {
					grid.insert(1, [dict1, dict2])
					testAfter()
				})

				it('using multiple arrays of dicts', function (): void {
					grid.insert(1, [dict1], [dict2])
					testAfter()
				})

				it('using hayson dicts', function (): void {
					grid.insert(1, haysonDict1, haysonDict2)
					testAfter()
				})

				it('using an array of hayson dicts', function (): void {
					grid.insert(1, [haysonDict1, haysonDict2])
					testAfter()
				})

				it('using multiple arrays of hayson dicts', function (): void {
					grid.insert(1, [haysonDict1], [haysonDict2])
					testAfter()
				})
			})

			it('throws an error if no arguments are inserted', function (): void {
				expect((): void => {
					grid.insert(0, [])
				}).toThrow()
			})

			it('throws an error if the index is less than one', function (): void {
				expect((): void => {
					grid.insert(-1, dict1)
				}).toThrow()
			})

			it('throws an error if the index is too high', function (): void {
				expect((): void => {
					grid.insert(3, dict1)
				}).toThrow()
			})
		}) // #insert()

		describe('#sortBy()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ name: 'fred', age: 48 },
						{ name: 'barney', age: 36 },
						{ name: 'jack', age: 40 },
						{ name: 'barney', age: 34 },
					],
				})
			})

			interface NameAge {
				name: string
				age: number
			}

			function getRow(index: number): NameAge {
				const json = grid.toJSON()
				const row = (json.rows || [])[index]
				return row ? (row as unknown as NameAge) : { name: '', age: -1 }
			}

			it('sort by name', function (): void {
				grid.sortBy('name')

				expect(getRow(0).name).toBe('barney')
				expect(getRow(1).name).toBe('barney')
				expect(getRow(2).name).toBe('fred')
				expect(getRow(3).name).toBe('jack')
			})

			it('sort by age', function (): void {
				grid.sortBy('age')

				expect(getRow(0).age).toBe(34)
				expect(getRow(1).age).toBe(36)
				expect(getRow(2).age).toBe(40)
				expect(getRow(3).age).toBe(48)
			})

			it('sort by name and age', function (): void {
				grid.sortBy(['name', 'age'])

				expect(grid.toJSON().rows).toEqual([
					{ name: 'barney', age: 34 },
					{ name: 'barney', age: 36 },
					{ name: 'fred', age: 48 },
					{ name: 'jack', age: 40 },
				])
			})
		}) // #sortBy()

		describe('#reverse()', function (): void {
			function getCol0(index: number): string {
				const row = grid.get(index)

				if (row) {
					const str = row.get<HStr>('col0')
					return (str && str.value) || ''
				} else {
					throw new Error('Cannot find row')
				}
			}

			it('reverses the order of all the rows', function (): void {
				makeGridWithRows()
				grid.reverse()

				expect(getCol0(0)).toBe('row2')
				expect(getCol0(1)).toBe('row1')
				expect(getCol0(2)).toBe('row0')
			})
		}) // #reverse()

		describe('#clear()', function (): void {
			it('clears all the rows from the grid', function (): void {
				grid.clear()
				expect(grid.length).toBe(0)
			})
		}) // #clear()

		describe('#filter()', function (): void {
			let otherGrid: HGrid

			beforeEach(function (): void {
				makeGridWithRows()

				otherGrid = HGrid.make({
					columns,
					rows: [
						HDict.make({
							col0: HStr.make('row1'),
							col1: HNum.make(1),
							col2: HMarker.make(),
						}),
					],
					version: grid.version,
				})
			})

			it('filters the grid to another grid', function (): void {
				expect(grid.filter('col1 == 1').equals(otherGrid)).toBe(true)
			})

			it('filters the grid to another grid using a node', function (): void {
				const node = HFilter.parse('col1 == 1')
				expect(grid.filter(node).equals(otherGrid)).toBe(true)
			})

			it('filters a grid to another grid using a function callback', function (): void {
				const newGrid = grid.filter(
					(row: HDict): boolean => row.get<HNum>('col1')?.value === 1
				)
				expect(newGrid.equals(otherGrid)).toBe(true)
			})

			it('filters a grid to another grid using a function callback and index number', function (): void {
				const newGrid = grid.filter(
					(row: HDict, index: number): boolean => index === 1
				)
				expect(newGrid.equals(otherGrid)).toBe(true)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.filter('col1 = 1')
				}).toThrow()
			})

			it('filters via a ref', function (): void {
				const site = HDict.make({
						id: HRef.make('site'),
						site: HMarker.make(),
						dis: HStr.make('My site'),
					}),
					otherGrid = HGrid.make({
						rows: [site],
					})

				const result = otherGrid.filter('id == @site')

				expect(result.length).toBe(1)
				expect(result[0]?.toJSON()).toEqual(site.toJSON())
			})

			it('follows a ref', function (): void {
				const equip = HDict.make({
					id: HRef.make('equip'),
					equip: HMarker.make(),
					siteRef: HRef.make('site'),
				})

				otherGrid = HGrid.make({
					rows: [
						HDict.make({
							id: HRef.make('site'),
							site: HMarker.make(),
							dis: HStr.make('My site'),
						}),
						equip,
					],
				})

				const result = otherGrid.filter(
					'equip and siteRef->dis == "My site"'
				)

				expect(result.length).toBe(1)
				expect(result[0]?.toJSON()).toEqual(equip.toJSON())
			})

			it('follows two refs', function (): void {
				const point = HDict.make({
					id: HRef.make('point'),
					point: HMarker.make(),
					equipRef: HRef.make('equip'),
				})

				otherGrid = HGrid.make({
					rows: [
						HDict.make({
							id: HRef.make('site'),
							site: HMarker.make(),
							dis: HStr.make('My site'),
						}),
						HDict.make({
							id: HRef.make('equip'),
							equip: HMarker.make(),
							siteRef: HRef.make('site'),
						}),
						point,
					],
				})

				const result = otherGrid.filter(
					'point and equipRef->siteRef->dis == "My site"'
				)

				expect(result.length).toBe(1)
				expect(result[0]?.toJSON()).toEqual(point.toJSON())
			})

			it('copies the column meta to the new grid', function (): void {
				const meta = new HDict({
					boolean: true,
					num: 12,
					str: 'string',
				})

				grid.setColumn(0, 'col0', meta)

				expect(
					grid.filter('col0').getColumn(0)?.meta.equals(meta)
				).toBe(true)
			})
		}) // #filter()

		describe('#any()', function (): void {
			it('returns true for a match', function (): void {
				expect(grid.any('foo')).toBe(true)
			})

			it('returns true for a match when using a node', function (): void {
				const node = HFilter.parse('foo')
				expect(grid.any(node)).toBe(true)
			})

			it('returns false when there is not a match', function (): void {
				expect(grid.any('food')).toBe(false)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.any('foo = true')
				}).toThrow()
			})
		}) // #any()

		describe('#find()', function (): void {
			it('returns the row dict for a match', function (): void {
				expect(grid.find('foo')?.toJSON()).toEqual({ foo: 'foo' })
			})

			it('returns true for a match when using a node', function (): void {
				const node = HFilter.parse('foo')
				expect(grid.find(node)?.toJSON()).toEqual({ foo: 'foo' })
			})

			it('returns false when there is not a match', function (): void {
				expect(grid.find('food')).toBeUndefined()
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.find('foo = true')
				}).toThrow()
			})
		}) // #find()

		describe('#matches()', function (): void {
			it('returns true for a match', function (): void {
				expect(grid.matches('foo')).toBe(true)
			})

			it('returns true for a match when using a node', function (): void {
				const node = HFilter.parse('foo')
				expect(grid.matches(node)).toBe(true)
			})

			it('returns false when there is not a match', function (): void {
				expect(grid.matches('food')).toBe(false)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.matches('foo = true')
				}).toThrow()
			})
		}) // #matches()

		describe('#anyBy()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ id: 1, list: ['foo', 'boo', 'goo'] },
						{ id: 2, list: ['boo', 'goo'] },
						{ id: 3, list: ['goo'] },
					],
				})
			})

			it('returns true for a matching list item', function (): void {
				expect(grid.anyBy('list', 'item == "foo"')).toBe(true)
			})

			it('returns false when the column does not exist', function (): void {
				expect(grid.anyBy('something', 'item == "foo"')).toBe(false)
			})

			it('returns false when an inner list does not contain the value', function (): void {
				expect(grid.anyBy('list', 'item == "soo"')).toBe(false)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.anyBy('list', 'item = "foo"')
				}).toThrow()
			})
		}) // #anyBy()

		describe('#all()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ id: '1', foo: true },
						{ id: '2', foo: true },
						{ id: '3', foo: true },
					],
				})
			})

			it('returns false for an empty grid', function (): void {
				expect(HGrid.make({}).all('foo')).toBe(false)
			})

			it('returns true when the grid all has the specified value via a filter', function (): void {
				expect(grid.all('foo == true')).toBe(true)
			})

			it('returns false when the grid does not have all the specified value via a filter', function (): void {
				grid.add({ id: '4', foo: false })
				expect(grid.all('foo == true')).toBe(false)
			})

			it('returns true when the grid all has the specified value via a node', function (): void {
				expect(grid.all(HFilter.parse('foo == true'))).toBe(true)
			})

			it('returns false when the grid does not have all the specified value via a node', function (): void {
				grid.add({ id: '4', foo: false })
				expect(grid.all(HFilter.parse('foo == true'))).toBe(false)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.all('foo = true')
				}).toThrow()
			})
		}) // #all()

		describe('#allBy()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ id: 1, list: ['foo', 'foo'] },
						{ id: 2, list: ['foo'] },
						{ id: 3, list: ['foo', 'foo', 'foo'] },
					],
				})
			})

			it('returns true for all matching items in a list', function (): void {
				expect(grid.allBy('list', 'item == "foo"')).toBe(true)
			})

			it('returns false when a row is added that causes the filter not to match', function (): void {
				grid.add({ id: 4, list: ['foo', 'soo', 'foo'] })
				expect(grid.allBy('list', 'item == "foo"')).toBe(false)
			})

			it('returns true for all matching items in a list for a node', function (): void {
				expect(grid.allBy('list', HFilter.parse('item == "foo"'))).toBe(
					true
				)
			})

			it('returns false when a row is added that causes the filter not to match for a node', function (): void {
				grid.add({ id: 4, list: ['foo', 'soo', 'foo'] })
				expect(grid.allBy('list', HFilter.parse('item == "foo"'))).toBe(
					false
				)
			})

			it('returns false when one item in the list does not match for all', function (): void {
				expect(grid.allBy('list', 'item == "boo"')).toBe(false)
			})

			it('returns false when the column does not exist', function (): void {
				expect(grid.allBy('somethingelse', 'item == "foo"')).toBe(false)
			})

			it('returns false when the column is not a collection', function (): void {
				expect(grid.allBy('id', 'item')).toBe(false)
			})

			it('returns false for an empty grid', function (): void {
				expect(HGrid.make({}).allBy('list', 'item == "foo"')).toBe(
					false
				)
			})

			it('throws an error when the filter is invalid', function (): void {
				expect((): void => {
					grid.allBy('list', 'item = "foo"')
				}).toThrow()
			})
		}) // #allBy()

		describe('#listBy()', function (): void {
			it('returns a list from a column index number', function (): void {
				makeGridWithRows()
				expect(grid.listBy(0)).toEqual(
					HList.make(
						HStr.make('row0'),
						HStr.make('row1'),
						HStr.make('row2')
					)
				)
			})

			it('returns a list from a column name', function (): void {
				makeGridWithRows()
				expect(grid.listBy('col0')).toEqual(
					HList.make(
						HStr.make('row0'),
						HStr.make('row1'),
						HStr.make('row2')
					)
				)
			})

			it('returns a list from a column instance', function (): void {
				makeGridWithRows()
				expect(grid.listBy(grid.getColumns()[0])).toEqual(
					HList.make(
						HStr.make('row0'),
						HStr.make('row1'),
						HStr.make('row2')
					)
				)
			})
		}) // #listBy()

		describe('#toGrid()', function (): void {
			it('returns a grid from a row', function (): void {
				makeGridWithRows()

				const newGrid = HGrid.make({
					columns: grid.getColumns(),
					rows: [
						HDict.make({
							col0: HStr.make('row0'),
							col1: HNum.make(0),
							col2: HMarker.make(),
						}),
					],
				})

				const row = grid.get(0) as HDict

				expect(row.toGrid().equals(newGrid)).toBe(true)
			})
		}) // #toGrid()

		describe('#getColumns()', function (): void {
			it("returns a copy of the grid's columns", function (): void {
				expect(grid.getColumns()).toEqual([new GridColumn('foo')])
			})
		}) // #getColumns()

		describe('#getColumnNames()', function (): void {
			it('returns the column names', function (): void {
				expect(grid.getColumnNames()).toEqual(['foo'])
			})
		}) // #getColumnNames()

		describe('#getColumnsLength()', function (): void {
			it('return the number of columns', function (): void {
				expect(grid.getColumnsLength()).toBe(1)
				makeGridWithRows()
				expect(grid.getColumnsLength()).toBe(3)
			})
		}) // #getColumnsLength()

		describe('#reorderColumns()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					columns: [
						{ name: 'b' },
						{ name: 'd' },
						{ name: 'c' },
						{ name: 'a' },
					],
				})
			})

			it('reorders the columns alphabetically', function (): void {
				grid.reorderColumns(['a', 'b', 'c', 'd'])

				expect(grid.toJSON().cols).toEqual([
					{ name: 'a', meta: {} },
					{ name: 'b', meta: {} },
					{ name: 'c', meta: {} },
					{ name: 'd', meta: {} },
				])
			})

			it('reorders the columns alphabetically in reverse', function (): void {
				grid.reorderColumns(['d', 'c', 'b', 'a'])

				expect(grid.toJSON().cols).toEqual([
					{ name: 'd', meta: {} },
					{ name: 'c', meta: {} },
					{ name: 'b', meta: {} },
					{ name: 'a', meta: {} },
				])
			})
		}) // #reorderColumns()

		describe('#getColumn()', function (): void {
			beforeEach(function (): void {
				makeGridWithRows()
			})

			it('returns a column via its index number', function (): void {
				const col = grid.getColumn(1)
				expect(col && col.name).toBe('col1')
			})

			it('returns a undefined when the column does not exist', function (): void {
				expect(grid.getColumn(4)).toBeUndefined()
			})

			it('returns a column via its name', function (): void {
				const col = grid.getColumn('col1')
				expect(col && col.name).toBe('col1')
			})

			it("returns undefined when the column can't be found via it's name", function (): void {
				expect(grid.getColumn('col3')).toBeUndefined()
			})
		}) // #getColumn()

		describe('#addColumn()', function (): void {
			it('adds a column', function (): void {
				const meta = HDict.make({ test: true })

				grid.addColumn('boo', meta)

				expect(grid.getColumns()).toEqual([
					new GridColumn('foo'),
					new GridColumn('boo', meta),
				])
			})

			it('does not add the column if it already exists', function (): void {
				expect(grid.length).toBe(1)

				grid.addColumn('foo')

				expect(grid.length).toBe(1)
				expect(grid.getColumns()[0].name).toBe('foo')
			})

			it('sets new meta on a column that already exists', function (): void {
				expect(grid.length).toBe(1)

				const meta = HDict.make({ test: true })
				grid.addColumn('foo', meta)

				expect(grid.length).toBe(1)
				expect(grid.getColumns()[0].meta.equals(meta)).toBe(true)
			})

			it('returns a newly added grid column', function (): void {
				expect(grid.addColumn('boo').name).toBe('boo')
			})

			it('returns a grid column for a column that already exists', function (): void {
				expect(grid.addColumn('foo').name).toBe('foo')
			})
		}) // #addColumn()

		describe('#hasColumn()', function (): void {
			it('returns true for a column that already exists', function (): void {
				expect(grid.hasColumn('foo')).toBe(true)
			})

			it('returns false for a column that does not exist', function (): void {
				expect(grid.hasColumn('boo')).toBe(false)
			})
		}) // #hasColumn()

		describe('#setColumn()', function (): void {
			it('sets the column at the specified index number', function (): void {
				const meta = HDict.make({ test: true })
				grid.setColumn(0, 'too', meta)
				expect(grid.getColumns()).toEqual([new GridColumn('too', meta)])
			})

			it('throws an error when the index is less than one', function (): void {
				expect((): void => {
					grid.setColumn(-1, 'too')
				}).toThrow()
			})

			it('throws an error when the index refers to a column that does not exist', function (): void {
				expect((): void => {
					grid.setColumn(1, 'too')
				}).toThrow()
			})
		}) // #setColumn()

		describe('#limitColumns()', function (): void {
			beforeEach(function (): void {
				makeGridWithRows()
			})

			it('limits the grid columns', function (): void {
				expect(grid.getColumnsLength()).toBe(3)
				grid = grid.limitColumns(['col1', 'col2'])

				expect(grid.getColumnsLength()).toBe(2)
				expect(grid.getColumnNames()).toEqual(['col1', 'col2'])
			})

			it('limits the dicts with the column names', function (): void {
				expect(grid.getColumnsLength()).toBe(3)
				grid = grid.limitColumns(['col1', 'col2'])

				expect(grid.getColumnsLength()).toBe(2)
				expect(grid.get(0)?.keys).toEqual(['col1', 'col2'])
				expect(grid.get(1)?.keys).toEqual(['col1', 'col2'])
			})
		}) // #limitColumns()

		describe('proxy', function (): void {
			it('gets a value', function (): void {
				expect(grid[0]).toEqual(grid.get(0))
			})

			it('sets a value', function (): void {
				const dict = HDict.make({ foo: HStr.make('boo') })

				grid[0] = HDict.make({ foo: 'boo' })
				expect((grid.get(0) as HDict).equals(dict)).toBe(true)
			})
		}) // proxy

		describe('iterator', function (): void {
			it('iterates a grid using dicts', function (): void {
				makeGridWithRows()
				let index = 0

				for (const dict of grid) {
					const rowDict = HDict.make({
						col0: HStr.make(`row${index}`),
						col1: HNum.make(index),
						col2: HMarker.make(),
					})

					expect(dict.equals(rowDict)).toBe(true)
					index++
				}

				expect(index).toBe(3)
			})
		}) // iterator

		describe('#isEmpty()', function (): void {
			it('returns false when the grid is not empty', function (): void {
				expect(grid.isEmpty()).toBe(false)
			})

			it('returns true when the grid is empty', function (): void {
				grid.clear()
				expect(grid.isEmpty()).toBe(true)
			})
		}) // #isEmpty()

		describe('#range()', function (): void {
			beforeEach(function (): void {
				grid = new HGrid({
					rows: [
						new HDict({ num: 0 }),
						new HDict({ num: 1 }),
						new HDict({ num: 2 }),
						new HDict({ num: 3 }),
						new HDict({ num: 4 }),
						new HDict({ num: 5 }),
						new HDict({ num: 6 }),
						new HDict({ num: 7 }),
						new HDict({ num: 8 }),
						new HDict({ num: 9 }),
					],
				})
			})

			it('Use the first three rows', function (): void {
				// [0, 1, 2]
				grid.range(0, 2)

				expect(grid.length).toBe(3)
				expect(grid.get(0)?.get<HNum>('num')?.value).toBe(0)
				expect(grid.get(1)?.get<HNum>('num')?.value).toBe(1)
				expect(grid.get(2)?.get<HNum>('num')?.value).toBe(2)
			})

			it('Use rows 1 to 4', function (): void {
				// [1, 2, 3, 4]
				grid.range(1, 4)

				expect(grid.length).toBe(4)
				expect(grid.get(0)?.get<HNum>('num')?.value).toBe(1)
				expect(grid.get(1)?.get<HNum>('num')?.value).toBe(2)
				expect(grid.get(2)?.get<HNum>('num')?.value).toBe(3)
				expect(grid.get(3)?.get<HNum>('num')?.value).toBe(4)
			})

			it('select the first four rows', function (): void {
				// [1, 2, 3, 4]
				grid.range(4)

				expect(grid.length).toBe(4)
				expect(grid.get(0)?.get<HNum>('num')?.value).toBe(0)
				expect(grid.get(1)?.get<HNum>('num')?.value).toBe(1)
				expect(grid.get(2)?.get<HNum>('num')?.value).toBe(2)
				expect(grid.get(3)?.get<HNum>('num')?.value).toBe(3)
			})

			it('selects the first row from the start and end', function (): void {
				grid.range(0, 0)
				expect(grid.length).toBe(1)
				expect(grid.get(0)?.get<HNum>('num')?.value).toBe(0)
			})

			it('selects the first row from the quantity', function (): void {
				grid.range(1)
				expect(grid.length).toBe(1)
				expect(grid.get(0)?.get<HNum>('num')?.value).toBe(0)
			})

			it('removes nothing if the range is zero', function (): void {
				grid.range(0)
				expect(grid.length).toBe(10)
			})
		}) // #range()

		describe('#isError()', function (): void {
			it('returns false when the grid has no error', function (): void {
				expect(grid.isError()).toBe(false)
			})

			it('returns true when the grid has an error', function (): void {
				grid.meta.set('err', HMarker.make())
				expect(grid.isError()).toBe(true)
			})
		}) // #isError()

		describe('#getError()', function (): void {
			it('returns undefined when there is no error', function (): void {
				expect(grid.getError()).toBeUndefined()
			})

			it('returns error information', function (): void {
				grid.meta
					.set('err', HMarker.make())
					.set('errType', HStr.make('type'))
					.set('errTrace', HStr.make('trace'))
					.set('dis', HStr.make('dis'))

				expect(grid.getError()).toEqual({
					type: 'type',
					trace: 'trace',
					dis: 'dis',
				})
			})
		}) // #getError()

		describe('#sumOf()', function (): void {
			it('returns the sum of all the values found', function (): void {
				makeGridWithRows()
				expect(grid.sumOf('col1')).toBe(3)
			})

			it('returns zero when no values can be found in the column', function (): void {
				makeGridWithRows()
				expect(grid.sumOf('col0')).toBe(0)
			})
		}) // #sumOf()

		describe('#maxOf()', function (): void {
			it('returns the maximum value', function (): void {
				makeGridWithRows()
				expect(grid.maxOf('col1')).toBe(2)
			})

			it('returns Number.MIN_SAFE_INTEGER when no values can be found in the column', function (): void {
				makeGridWithRows()
				expect(grid.maxOf('col0')).toBe(Number.MIN_SAFE_INTEGER)
			})
		}) // #maxOf()

		describe('#minOf()', function (): void {
			it('returns the minimum value', function (): void {
				makeGridWithRows()
				expect(grid.minOf('col1')).toBe(0)
			})

			it('returns Number.MAX_SAFE_INTEGER when no values can be found in the column', function (): void {
				makeGridWithRows()
				expect(grid.minOf('col0')).toBe(Number.MAX_SAFE_INTEGER)
			})
		}) // #minOf()

		describe('#avgOf()', function (): void {
			it('returns the average value', function (): void {
				makeGridWithRows()
				expect(grid.avgOf('col1')).toBe(1)
			})

			it('returns Number.NaN when no values can be found in the column', function (): void {
				makeGridWithRows()
				expect(grid.avgOf('col0')).toBeNaN()
			})
		}) // #avgOf()

		describe('#uniqueBy()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
						{ index: 2, foo: 'foo1', boo: 1, goo: true },
						{ index: 3, foo: 'foo1', boo: 1, goo: true },
						{ index: 4, foo: 'foo2', boo: 2, goo: true },
						{ index: 5, foo: 'foo3', boo: 1, goo: true, doo: 23 },
						{
							index: 6,
							foo: 'foo1',
							boo: 2,
							goo: false,
							unique: 'unique',
						},
					],
				})
			})

			it('keep unique columns for one name', function (): void {
				expect(grid.uniqueBy('foo').toJSON().rows).toEqual([
					{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
					{ index: 2, foo: 'foo1', boo: 1, goo: true },
					{ index: 5, foo: 'foo3', boo: 1, goo: true, doo: 23 },
				])
			})

			it('keep unique columns for two names', function (): void {
				expect(grid.uniqueBy(['foo', 'boo']).toJSON().rows).toEqual([
					{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
					{ index: 2, foo: 'foo1', boo: 1, goo: true },
					{ index: 4, foo: 'foo2', boo: 2, goo: true },
					{ index: 5, foo: 'foo3', boo: 1, goo: true, doo: 23 },
					{
						index: 6,
						foo: 'foo1',
						boo: 2,
						goo: false,
						unique: 'unique',
					},
				])
			})

			it('keep unique columns for three names', function (): void {
				expect(
					grid.uniqueBy(['foo', 'boo', 'goo']).toJSON().rows
				).toEqual([
					{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
					{ index: 2, foo: 'foo1', boo: 1, goo: true },
					{ index: 4, foo: 'foo2', boo: 2, goo: true },
					{ index: 5, foo: 'foo3', boo: 1, goo: true, doo: 23 },
					{
						index: 6,
						foo: 'foo1',
						boo: 2,
						goo: false,
						unique: 'unique',
					},
				])
			})

			it('returns one row for a unique row', function (): void {
				expect(grid.uniqueBy('unique').toJSON().rows).toEqual([
					{
						index: 6,
						foo: 'foo1',
						boo: 2,
						goo: false,
						unique: 'unique',
					},
				])
			})

			it('returns one row data that only exists in two rows for one columns', function (): void {
				expect(grid.uniqueBy('doo').toJSON().rows).toEqual([
					{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
				])
			})

			it('returns two rows data that only exists in two rows for two columns', function (): void {
				expect(grid.uniqueBy(['doo', 'goo']).toJSON().rows).toEqual([
					{ index: 1, foo: 'foo2', boo: 1, goo: false, doo: 23 },
					{ index: 5, foo: 'foo3', boo: 1, goo: true, doo: 23 },
				])
			})

			it('returns an empty grid when the name cannot be found', function (): void {
				expect(grid.uniqueBy(['doesNotExist']).toJSON().rows).toEqual(
					[]
				)
			})

			it('copies the column meta to the new grid', function (): void {
				const meta = new HDict({
					boolean: true,
					num: 12,
					str: 'string',
				})

				grid.setColumn(1, 'foo', meta)

				expect(
					grid.uniqueBy('foo').getColumn(1)?.meta.equals(meta)
				).toBe(true)
			})
		}) // #uniqueBy()

		describe('#filterBy()', function (): void {
			beforeEach(function (): void {
				grid = HGrid.make({
					rows: [
						{ name: 'name1', list: ['first', 'second', 'third'] },
						{ name: 'name2', list: ['second', 'third'] },
						{ name: 'name3', list: ['first'] },
					],
				})
			})

			it('filters using a list in a grid', function (): void {
				const newGrid = HGrid.make({
					rows: [
						{ name: 'name1', list: ['first', 'second', 'third'] },
						{ name: 'name3', list: ['first'] },
					],
				})

				expect(grid.filterBy('list', 'item == "first"')).toValEqual(
					newGrid
				)
			})

			it('filters using a list in a grid using a node', function (): void {
				const newGrid = HGrid.make({
					rows: [
						{ name: 'name1', list: ['first', 'second', 'third'] },
						{ name: 'name3', list: ['first'] },
					],
				})

				const node = HFilter.parse('item == "first"')

				expect(grid.filterBy('list', node)).toValEqual(newGrid)
			})

			it('returns an empty grid for an invalid column', function (): void {
				expect(grid.filterBy('foo', 'item == "first"').length).toBe(0)
			})

			it('returns an empty grid when the filter does not match', function (): void {
				expect(
					grid.filterBy('foo', 'item == "somethingElse"').length
				).toBe(0)
			})

			it('filters using a dict in a grid', function (): void {
				grid = HGrid.make({
					rows: [
						{ name: 'name1', dict: { foo: 'foo1' } },
						{ name: 'name2', dict: { foo: 'foo2' } },
					],
				})

				const newGrid = HGrid.make({
					rows: [{ name: 'name1', dict: { foo: 'foo1' } }],
				})

				expect(grid.filterBy('dict', 'foo == "foo1"')).toValEqual(
					newGrid
				)
			})

			it('filters using a grid in a grid', function (): void {
				grid = HGrid.make({
					rows: [
						{
							name: 'name1',
							grid: { _kind: Kind.Grid, rows: [{ foo: 'foo1' }] },
						},
						{
							name: 'name2',
							grid: { _kind: Kind.Grid, rows: [{ foo: 'foo2' }] },
						},
					],
				})

				const newGrid = HGrid.make({
					rows: [
						{
							name: 'name1',
							grid: { _kind: Kind.Grid, rows: [{ foo: 'foo1' }] },
						},
					],
				})

				expect(grid.filterBy('grid', 'foo == "foo1"')).toValEqual(
					newGrid
				)
			})
		}) // #filterBy()

		describe('#map()', function (): void {
			it('map from one type of grid to another', function (): void {
				grid = HGrid.make({
					rows: [
						{ a: 1, b: 2 },
						{ a: 3, b: 4 },
					],
				})

				expect(
					grid.map(
						(dict): HDict =>
							HDict.make({
								total:
									Number(dict.get<HNum>('a')?.value) +
									Number(dict.get<HNum>('b')?.value),
							})
					)
				).toEqual([HDict.make({ total: 3 }), HDict.make({ total: 7 })])
			})
		}) // #map()

		describe('#reduce()', function (): void {
			it('reduce a grid down to one dict', function (): void {
				grid = HGrid.make({
					rows: [
						{ a: 1, b: 2 },
						{ a: 3, b: 4 },
					],
				})

				expect(
					grid
						.reduce(
							(prev, cur): HDict =>
								HDict.make({
									a:
										Number(prev.get<HNum>('a')?.value) +
										Number(cur.get<HNum>('a')?.value),
									b:
										Number(prev.get<HNum>('b')?.value) +
										Number(cur.get<HNum>('b')?.value),
								})
						)
						.toJSON()
				).toEqual({ a: 4, b: 6 })
			})

			it('reduce a grid down to one row', function (): void {
				grid = HGrid.make({
					rows: [
						{ a: 1, b: 2 },
						{ a: 3, b: 4 },
					],
				})

				expect(
					grid
						.reduce((prev, cur): HGrid => {
							const dict = prev.get(0)

							if (dict) {
								dict.set(
									'a',
									Number(cur.get<HNum>('a')?.value) +
										Number(dict.get<HNum>('a')?.value)
								)

								dict.set(
									'b',
									Number(cur.get<HNum>('b')?.value) +
										Number(dict.get<HNum>('b')?.value)
								)
							}

							return prev
						}, HGrid.make({ rows: [{ a: 0, b: 0 }] }))
						.toJSON().rows
				).toEqual([{ a: 4, b: 6 }])
			})
		}) // #reduce()

		describe('#newCopy()', function (): void {
			it('returns a new instance', function (): void {
				const copy = grid.newCopy()
				expect(grid).toEqual(copy)
				expect(grid).not.toBe(copy)
			})
		}) // #newCopy()

		describe('#toGrid()', function (): void {
			it('returns itself', function (): void {
				expect(grid.toGrid()).toBe(grid)
			})
		}) // #toGrid()

		describe('#toList()', function (): void {
			it('returns a list of dicts', function (): void {
				expect(grid.toList()).toValEqual(HList.make(grid.getRows()))
			})
		}) // #toList()

		describe('#toDict()', function (): void {
			it('returns a dict with each key as a row', function (): void {
				expect(grid.toDict()).toValEqual(
					HDict.make({ row0: HDict.make({ foo: 'foo' }) })
				)
			})
		}) // #toDict()
	}) // grid
})

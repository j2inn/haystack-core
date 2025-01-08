/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { GridObjStore } from '../../../src/core/grid/GridObjStore'
import {
	DEFAULT_GRID_VERSION,
	GridStore,
} from '../../../src/core/grid/GridStore'
import { HDict } from '../../../src/core/dict/HDict'
import { GridColumn } from '../../../src/core/grid/GridColumn'
import { HStr } from '../../../src/core/HStr'
import { Kind } from '../../../src/core/Kind'

import '../../matchers'
import '../../customMatchers'

describe('GridObjStore', () => {
	let store: GridStore<HDict>

	beforeEach(() => {
		store = new GridObjStore(
			DEFAULT_GRID_VERSION,
			new HDict({
				foo: 'bar',
			}),
			[new GridColumn('foo'), new GridColumn('boo')],
			[new HDict({ foo: 'foo', boo: null })]
		)
	})

	describe('#version', () => {
		it('gets the version', () => {
			expect(store.version).toBe(DEFAULT_GRID_VERSION)
		})

		it('sets a new version', () => {
			store.version = '4.0'
			expect(store.version).toBe('4.0')
		})
	}) // #version

	describe('#meta', () => {
		it('gets the meta', () => {
			expect(store.meta).toValEqual(new HDict({ foo: 'bar' }))
		})

		it('sets a new meta', () => {
			store.meta = new HDict({ bar: 'foo' })
			expect(store.meta).toValEqual(new HDict({ bar: 'foo' }))
		})
	}) // #meta

	describe('#columns', () => {
		it('gets the columns', () => {
			expect(store.columns).toHaveLength(2)
			expect(store.columns[0].name).toBe('foo')
			expect(store.columns[1].name).toBe('boo')
		})

		it('sets the columns', () => {
			store.columns = [new GridColumn('bar')]
			expect(store.columns).toHaveLength(1)
			expect(store.columns[0].name).toBe('bar')
		})
	}) // #columns

	describe('#rows', () => {
		it('gets the rows', () => {
			expect(store.rows).toHaveLength(1)
			expect(store.rows[0].get<HStr>('foo')?.value).toBe('foo')
			expect(store.rows[0].get('boo')).toBe(null)
		})

		it('sets the rows', () => {
			store.rows = [new HDict({ bar: 'bar' })]
			expect(store.rows).toHaveLength(1)
			expect(store.rows[0].get<HStr>('bar')?.value).toBe('bar')
		})
	}) // #rows

	describe('#toJSON()', () => {
		it('returns a JSON representation of the grid', () => {
			expect(store.toJSON()).toEqual({
				_kind: Kind.Grid,
				meta: { ver: DEFAULT_GRID_VERSION, foo: 'bar' },
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
						boo: null,
					},
				],
			})
		})
	}) // #toJSON()
})

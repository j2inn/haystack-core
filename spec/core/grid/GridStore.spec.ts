/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { GridObjStore } from '../../../src/core/grid/GridObjStore'
import {
	DEFAULT_GRID_VERSION,
	isGridStore,
} from '../../../src/core/grid/GridStore'
import { HDict } from '../../../src/core/dict/HDict'
import { Kind } from '../../../src/core/Kind'
import { GridColumn } from '../../../src/core/grid/GridColumn'

import '../../matchers'
import '../../customMatchers'

describe('GridStore', () => {
	describe('isGridStore()', () => {
		it('returns true for a grid store', () => {
			expect(
				isGridStore(new GridObjStore('1.0', new HDict(), [], []))
			).toBe(true)
		})

		it('returns false for object that is not a grid store', () => {
			expect(isGridStore({})).toBe(false)
		})

		it('returns false for undefined', () => {
			expect(isGridStore(undefined)).toBe(false)
		})
	}) // isGridStore()

	describe('gridStoreToJson()', () => {
		it('converts a grid store to a JSON object', () => {
			const gridStore = new GridObjStore(
				DEFAULT_GRID_VERSION,
				new HDict(),
				[new GridColumn('foo'), new GridColumn('goo')],
				[new HDict({ foo: 'foo', goo: null })]
			)

			expect(gridStore.toJSON()).toEqual({
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
	}) // gridStoreToJson()
})

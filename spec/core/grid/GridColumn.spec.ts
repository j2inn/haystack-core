/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { GridColumn } from '../../../src/core/grid/GridColumn'
import { HDict } from '../../../src/core/dict/HDict'

import '../../matchers'
import '../../customMatchers'

describe('GridColumn', () => {
	let column: GridColumn

	beforeEach(() => {
		column = new GridColumn('name', new HDict({ dis: 'Display name' }))
	})

	describe('#dis', () => {
		it('returns true for a display name', () => {
			expect(column.dis).toBe('Display name')
		})
	}) // #dis

	describe('#displayName', () => {
		it('returns true for a display name', () => {
			expect(column.displayName).toBe('Display name')
		})
	}) // #displayName

	describe('#equals()', () => {
		it('returns true for a column that is equal', () => {
			expect(
				column.equals(
					new GridColumn('name', new HDict({ dis: 'Display name' }))
				)
			).toBe(true)
		})

		it('returns false for a column with a diffferent name', () => {
			expect(
				column.equals(
					new GridColumn('other', new HDict({ dis: 'Display name' }))
				)
			).toBe(false)
		})

		it('returns false for a column with diffferent meta', () => {
			expect(
				column.equals(
					new GridColumn(
						'name',
						new HDict({ dis: 'Display name', foobar: 'foobar' })
					)
				)
			).toBe(false)
		})
	}) // #equals()
})

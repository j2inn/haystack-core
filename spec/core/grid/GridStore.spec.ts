/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { GridObjStore } from '../../../src/core/grid/GridObjStore'
import { isGridStore } from '../../../src/core/grid/GridStore'
import { HDict } from '../../../src/core/dict/HDict'

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
})

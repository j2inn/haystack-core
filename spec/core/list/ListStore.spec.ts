/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { isListStore } from '../../../src/core/list/ListStore'
import { ListObjStore } from '../../../src/core/list/ListObjStore'

import '../../matchers'
import '../../customMatchers'

describe('ListStore', () => {
	describe('isListStore()', () => {
		it('returns true for a list store', () => {
			expect(isListStore(new ListObjStore([]))).toBe(true)
		})

		it('returns false for an object that is not a list store', () => {
			expect(isListStore({})).toBe(false)
		})
	}) // isListStore()
})

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { isDictStore } from '../../../src/core/dict/DictStore'
import { DictJsonStore } from '../../../src/core/dict/DictJsonStore'

import '../../matchers'
import '../../customMatchers'

describe('DictStore', () => {
	describe('isDictStore()', () => {
		it('returns true for a dict store', () => {
			expect(isDictStore(new DictJsonStore({}))).toBe(true)
		})

		it('returns false for an object that is not a dict store', () => {
			expect(isDictStore({})).toBe(false)
		})
	}) // isDictStore()
})

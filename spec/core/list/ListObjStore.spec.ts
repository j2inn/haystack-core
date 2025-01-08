/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { ListObjStore } from '../../../src/core/list/ListObjStore'
import { HNum } from '../../../src/core/HNum'

import '../../matchers'
import '../../customMatchers'

describe('ListObjStore', () => {
	describe('#values', () => {
		it('returns true for a list store', () => {
			const values = [HNum.make(42)]

			expect(new ListObjStore(values).values).toBe(values)
		})
	}) // #values()
})

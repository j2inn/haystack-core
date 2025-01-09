/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { ListJsonStringStore } from '../../../src/core/list/ListJsonStringStore'
import { HNum } from '../../../src/core/HNum'

import '../../matchers'
import '../../customMatchers'

describe('ListJsonStringStore', () => {
	describe('#values', () => {
		it('sets values', () => {
			const values = [HNum.make(42)]

			const store = new ListJsonStringStore<HNum>('[]')
			store.values = values

			expect(store.values).toEqual(values)
		})

		it('returns values', () => {
			const values = [42]
			const store = new ListJsonStringStore(JSON.stringify(values))

			expect(store.values.length).toBe(1)
			expect(store.values[0]).toValEqual(HNum.make(42))
		})
	}) // #values()

	describe('#toJSON()', () => {
		it('returns JSON', () => {
			const values = [42]
			expect(
				new ListJsonStringStore(JSON.stringify(values)).toJSON()
			).toEqual([42])
		})

		it('returns JSON after changing the values', () => {
			const values = [42]
			const store = new ListJsonStringStore(JSON.stringify(values))
			store.values = [HNum.make(43)]
			expect(store.toJSON()).toEqual([43])
		})
	}) // #toJSON()

	describe('#toJSONString()', () => {
		it('returns a JSON string', () => {
			const values = [42]
			expect(
				new ListJsonStringStore(JSON.stringify(values)).toJSONString()
			).toEqual('[42]')
		})
	}) // #toJSONString()
})

/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { ListObjStore } from '../../../src/core/list/ListObjStore'
import { HNum } from '../../../src/core/HNum'
import { TEXT_ENCODER } from '../../../src/core/HVal'

import '../../matchers'
import '../../customMatchers'

describe('ListObjStore', () => {
	describe('#values', () => {
		it('sets values', () => {
			const values = [HNum.make(42)]

			const store = new ListObjStore<HNum>([])
			store.values = values

			expect(store.values).toEqual(values)
		})

		it('returns values', () => {
			const values = [HNum.make(42)]

			expect(new ListObjStore(values).values).toEqual(values)
		})
	}) // #values()

	describe('#toJSON()', () => {
		it('returns JSON', () => {
			const values = [HNum.make(42)]
			expect(new ListObjStore(values).toJSON()).toEqual([42])
		})
	}) // #toJSON()

	describe('#toJSONString()', () => {
		it('returns a JSON string', () => {
			const values = [HNum.make(42)]
			expect(new ListObjStore(values).toJSONString()).toEqual('[42]')
		})
	}) // #toJSONString()

	describe('#toJSONUint8Array()', () => {
		it('returns a JSON byte buffer', () => {
			const values = [HNum.make(42)]
			expect(new ListObjStore(values).toJSONUint8Array()).toEqual(
				TEXT_ENCODER.encode('[42]')
			)
		})
	}) // #toJSONUint8Array()
})

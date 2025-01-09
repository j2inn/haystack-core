/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { ListJsonUint8ArrayStore } from '../../../src/core/list/ListJsonUint8ArrayStore'
import { HNum } from '../../../src/core/HNum'
import { TEXT_ENCODER } from '../../../src/core/HVal'

import '../../matchers'
import '../../customMatchers'

describe('ListJsonUint8ArrayStore', () => {
	describe('#values', () => {
		it('sets values', () => {
			const values = [HNum.make(42)]

			const store = new ListJsonUint8ArrayStore<HNum>(
				TEXT_ENCODER.encode('[]')
			)
			store.values = values

			expect(store.values).toEqual(values)
		})

		it('returns values', () => {
			const values = [42]
			const store = new ListJsonUint8ArrayStore(
				TEXT_ENCODER.encode(JSON.stringify(values))
			)

			expect(store.values.length).toBe(1)
			expect(store.values[0]).toValEqual(HNum.make(42))
		})
	}) // #values()

	describe('#toJSON()', () => {
		it('returns JSON', () => {
			const values = [42]
			expect(
				new ListJsonUint8ArrayStore(
					TEXT_ENCODER.encode(JSON.stringify(values))
				).toJSON()
			).toEqual([42])
		})

		it('returns JSON after changing the values', () => {
			const values = [42]
			const store = new ListJsonUint8ArrayStore(
				TEXT_ENCODER.encode(JSON.stringify(values))
			)
			store.values = [HNum.make(43)]
			expect(store.toJSON()).toEqual([43])
		})
	}) // #toJSON()

	describe('#toJSONString()', () => {
		it('returns a JSON string', () => {
			const values = [42]
			expect(
				new ListJsonUint8ArrayStore(
					TEXT_ENCODER.encode(JSON.stringify(values))
				).toJSONString()
			).toEqual('[42]')
		})
	}) // #toJSONString()

	describe('#toJSONUint8Array()', () => {
		it('returns a JSON byte buffer', () => {
			const values = [42]
			expect(
				new ListJsonUint8ArrayStore(
					TEXT_ENCODER.encode(JSON.stringify(values))
				).toJSONUint8Array()
			).toEqual(TEXT_ENCODER.encode('[42]'))
		})
	}) // #toJSONUint8Array()
})

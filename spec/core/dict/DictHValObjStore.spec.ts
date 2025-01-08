/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { DictHValObjStore } from '../../../src/core/dict/DictHValObjStore'
import { HMarker } from '../../../src/core/HMarker'
import { HStr } from '../../../src/core/HStr'
import { Kind } from '../../../src/core/Kind'
import { TEXT_ENCODER } from '../../../src/core/HVal'

import '../../matchers'
import '../../customMatchers'

describe('DictObjStore', () => {
	let store: DictHValObjStore

	beforeEach(() => {
		store = new DictHValObjStore({
			site: HMarker.make(),
			dis: HStr.make('A site'),
			isNull: null,
		})
	})

	describe('#get()', () => {
		it('gets a value', () => {
			expect(store.get('dis')?.toJSON()).toBe('A site')
		})

		it('returns undefined if the value does not exist', () => {
			expect(store.get('notThere')).toBeUndefined()
		})
	}) // .#get()

	describe('#has()', () => {
		it('returns true if the value exists', () => {
			expect(store.has('dis')).toBe(true)
		})

		it('returns true if the value is null', () => {
			expect(store.has('isNull')).toBe(true)
		})

		it('returns false if the value does not exist', () => {
			expect(store.has('notThere')).toBe(false)
		})
	}) // .#has()

	describe('#set()', () => {
		it('sets a value', () => {
			store.set('dis', HStr.make('New site'))
			expect(store.get('dis')?.toJSON()).toBe('New site')
		})
	}) // .#set()

	describe('#remove()', () => {
		it('removes a value', () => {
			store.remove('dis')
			expect(store.has('dis')).toBe(false)
		})
	}) // .#remove()

	describe('#clear()', () => {
		it('clears all values', () => {
			store.clear()
			expect(store.toJSON()).toEqual({})
		})
	}) // .#clear()

	describe('#getKeys()', () => {
		it('returns all keys', () => {
			expect(store.getKeys()).toEqual(['site', 'dis', 'isNull'])
		})
	}) // .#getKeys()

	describe('#toObj()', () => {
		it('returns a haystack value object', () => {
			expect(store.toObj()).toEqual({
				site: HMarker.make(),
				dis: HStr.make('A site'),
				isNull: null,
			})
		})
	}) // .#toObj()

	describe('#toJSON()', () => {
		it('returns a JSON object', () => {
			expect(store.toJSON()).toEqual({
				site: { _kind: Kind.Marker },
				dis: 'A site',
				isNull: null,
			})
		})
	}) // .#toJSON()

	describe('#toJSONString()', () => {
		it('returns a JSON string', () => {
			expect(store.toJSONString()).toEqual(
				JSON.stringify({
					site: { _kind: Kind.Marker },
					dis: 'A site',
					isNull: null,
				})
			)
		})
	}) // .#toJSONString()

	describe('#toJSONUint8Array()', () => {
		it('returns a JSON byte buffer', () => {
			expect(store.toJSONUint8Array()).toEqual(
				TEXT_ENCODER.encode(
					JSON.stringify({
						site: { _kind: Kind.Marker },
						dis: 'A site',
						isNull: null,
					})
				)
			)
		})
	}) // .#toJSONUint8Array()
})

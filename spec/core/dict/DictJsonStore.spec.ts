/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { DictJsonStore } from '../../../src/core/dict/DictJsonStore'
import { HMarker } from '../../../src/core/HMarker'
import { HStr } from '../../../src/core/HStr'
import { Kind } from '../../../src/core/Kind'

import '../../matchers'
import '../../customMatchers'

describe('DictJsonStore', () => {
	let store: DictJsonStore

	beforeEach(() => {
		store = new DictJsonStore({
			site: { _kind: Kind.Marker },
			dis: 'A site',
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

		it('returns true after the value has been set', () => {
			store.set('dis', HStr.make('New site'))
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

		it('removes a value after it has been set', () => {
			store.set('dis', HStr.make('New site'))
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

		it('returns a JSON object after it has been set', () => {
			store.set('dis', HStr.make('New site'))

			expect(store.toJSON()).toEqual({
				site: { _kind: Kind.Marker },
				dis: 'New site',
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
})

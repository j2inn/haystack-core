/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { DictObjStore } from '../../../src/core/dict/DictObjStore'
import { HMarker } from '../../../src/core/HMarker'
import { HStr } from '../../../src/core/HStr'
import { HGrid } from '../../../src/core/HGrid'
import { HDict } from '../../../src/core/dict/HDict'
import { Kind } from '../../../src/core/Kind'

import '../../matchers'
import '../../customMatchers'

describe('DictObjStore', () => {
	let store: DictObjStore

	beforeEach(() => {
		store = new DictObjStore({
			site: HMarker.make(),
			dis: HStr.make('A site'),
			isNull: null,
		})
	})

	describe('#constructor()', () => {
		it('makes an object from an object', () => {
			expect(store.toJSON()).toEqual({
				site: { _kind: Kind.Marker },
				dis: 'A site',
				isNull: null,
			})
		})

		it('makes an object from null', () => {
			const store = new DictObjStore(null)
			expect(store.toJSON()).toEqual({ val: null })
		})

		it('makes an object from a haystack value', () => {
			const store = new DictObjStore(HStr.make('a string'))
			expect(store.toJSON()).toEqual({ val: 'a string' })
		})

		it('makes an object from a dict', () => {
			const store = new DictObjStore(
				new HDict({
					site: HMarker.make(),
				})
			)
			expect(store.toJSON()).toEqual({ site: { _kind: Kind.Marker } })
		})

		it('makes an object from a grid', () => {
			const store = new DictObjStore(
				new HGrid({
					rows: [new HDict({ site: HMarker.make() })],
				})
			)

			expect(store.toJSON()).toEqual({
				row0: { site: { _kind: Kind.Marker } },
			})
		})
	}) // .#constructor()

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
})

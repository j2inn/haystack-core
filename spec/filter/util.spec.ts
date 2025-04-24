/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../../src/core/dict/HDict'
import { HRef } from '../../src/core/HRef'
import { makeRelativeHaystackFilter } from '../../src/filter/util'
import { HMarker } from '../../src/core/HMarker'
import { HStr } from '../../src/core/HStr'

describe('haystack', () => {
	describe('makeRelativeHaystackFilter()', () => {
		it('returns a haystack filter with dis', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
					})
				)
			).toEqual('equip and dis == "an equip"')
		})

		it('returns a haystack filter without a display name with the option disabled', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
					}),
					{
						useDisplayName: false,
					}
				)
			).toEqual('equip')
		})

		it('returns a haystack filter with a nav name', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'an equip',
						equip: HMarker.make(),
					})
				)
			).toEqual('equip and navName == "an equip"')
		})

		it('returns a haystack filter with a point kind', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'a point',
						point: HMarker.make(),
						kind: HStr.make('Number'),
					})
				)
			).toEqual('point and navName == "a point" and kind == "Number"')
		})

		it('returns a haystack filter without the point kind and the option disabled', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'a point',
						point: HMarker.make(),
						kind: HStr.make('Number'),
					}),
					{
						useKind: false,
					}
				)
			).toEqual('point and navName == "a point"')
		})

		it('returns a haystack filter with an absolute id as a fallback', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
					})
				)
			).toEqual('id == @id')
		})
	}) // makeRelativeHaystackFilter()
})

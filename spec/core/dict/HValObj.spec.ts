/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { hvalObjToJson } from '../../../src/core/dict/HValObj'
import { Kind } from '../../../src/core/Kind'
import { HStr } from '../../../src/core/HStr'
import { HMarker } from '../../../src/core/HMarker'

import '../../matchers'
import '../../customMatchers'

describe('HValObj', () => {
	describe('hvalObjToJson()', () => {
		it('converts a haystack value object to a JSON object', () => {
			expect(
				hvalObjToJson({
					site: HMarker.make(),
					dis: HStr.make('A site'),
					isNull: null,
				})
			).toEqual({
				site: { _kind: Kind.Marker },
				dis: 'A site',
				isNull: null,
			})
		})
	}) // hvalObjToJson()
})

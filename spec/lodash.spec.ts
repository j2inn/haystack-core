/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

import { HGrid } from '../src/core/grid/HGrid'
import { forEach, fill } from 'lodash'
import './matchers'
import './customMatchers'
import { HDict, HValRow } from '../src/core/dict/HDict'
import { HList } from '../src/core/HList'
import { HVal } from '../src/core/HVal'
import { HStr } from '../src/core/HStr'
import { HNum } from '../src/core/HNum'
import { HBool } from '../src/core/HBool'
import { HaysonVal } from '../src/core/hayson'

/**
 * Some intergation tests to ensure this library plays nicely with lodash.
 *
 * @module
 */

describe('lodash', function (): void {
	let grid: HGrid
	let list: HList
	let dict: HDict

	beforeEach(function (): void {
		grid = HGrid.make({
			rows: [
				{ str: 'string0', num: 0, bool: true },
				{ str: 'string1', num: 1, bool: false },
				{ str: 'string2', num: 2, bool: true },
			],
		})

		list = HList.make<HVal>('string0', 1, true)

		dict = HDict.make({ str: 'string0', num: 1, bool: true })
	})
	describe('#forEach()', function (): void {
		it('iterates a grid', function (): void {
			let counter = 0

			forEach(grid.asArrayLike(), (dict: HDict): void => {
				if (counter === 0) {
					expect(dict).toValEqual(
						HDict.make({
							str: 'string0',
							num: 0,
							bool: true,
						})
					)
				} else if (counter === 1) {
					expect(dict).toValEqual(
						HDict.make({
							str: 'string1',
							num: 1,
							bool: false,
						})
					)
				} else if (counter === 2) {
					expect(dict).toValEqual(
						HDict.make({
							str: 'string2',
							num: 2,
							bool: true,
						})
					)
				}

				++counter
			})

			expect(counter).toBe(3)
		})

		it('iterates a list', function (): void {
			let counter = 0

			forEach(list.asArrayLike(), (val: HaysonVal | HVal): void => {
				if (counter === 0) {
					expect(val).toEqual(HStr.make('string0'))
				} else if (counter === 1) {
					expect(val).toEqual(HNum.make(1))
				} else if (counter === 2) {
					expect(val).toEqual(HBool.make(true))
				}

				++counter
			})

			expect(counter).toBe(3)
		})

		it('iterates a dict', function (): void {
			let counter = 0

			forEach(dict.asArrayLike(), (val: HValRow): void => {
				if (counter === 0) {
					expect(val.name).toBe('str')
					expect(val.value).toValEqual(HStr.make('string0'))
				} else if (counter === 1) {
					expect(val.name).toBe('num')
					expect(val.value).toValEqual(HNum.make(1))
				} else if (counter === 2) {
					expect(val.name).toBe('bool')
					expect(val.value).toValEqual(HBool.make(true))
				}

				++counter
			})

			expect(counter).toBe(3)
		})
	}) // #forEach()

	describe('#fill()', function (): void {
		it('fills a list with values', function (): void {
			list = HList.make([0, 0, 0])

			fill(list, 1)

			expect(list).toValEqual(HList.make([1, 1, 1]))
		})
	}) // #fill()
})

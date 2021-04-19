/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import '../../src/core/Array'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/HDict'
import { HGrid } from '../../src/core/HGrid'
import { HStr } from '../../src/core/HStr'
import { HBool } from '../../src/core/HBool'
import { HNum } from '../../src/core/HNum'

describe('Array', function (): void {
	describe('#toList()', function (): void {
		it('returns a list', function (): void {
			const list = HList.make([
				HStr.make('test'),
				HBool.make(true),
				HNum.make(12),
			])

			expect(['test', true, 12].toList()).toEqual(list)
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns a dict', function (): void {
			const list = HList.make([
				HStr.make('test'),
				HBool.make(true),
				HNum.make(12),
			])

			const dict = HDict.make({
				val: list,
			})

			expect(['test', true, 12].toDict()).toEqual(dict)
		})
	}) // #toDict()

	describe('#toGrid()', function (): void {
		it('returns a grid', function (): void {
			const dict = HDict.make({
				test: HStr.make('test'),
				boo: HBool.make(true),
				num: HNum.make(12),
			})

			const grid = HGrid.make({ rows: [dict] })

			expect(
				[{ test: 'test', boo: true, num: 12 }].toGrid().toJSON()
			).toEqual(grid.toJSON())
		})
	}) // #toGrid()

	describe('#toHayson()', function (): void {
		it('returns Hayson', function (): void {
			expect(
				[HStr.make('test'), HBool.make(true), HNum.make(12)].toHayson()
			).toEqual(['test', true, 12])
		})
	}) // #toHayson()
})

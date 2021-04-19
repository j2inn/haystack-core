/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	UnitDimensions,
	UnitDimensionsData,
} from '../../src/core/UnitDimensions'

describe('UnitDimensions', function (): void {
	const unitData: UnitDimensionsData = {
		kg: 1,
		m: 1,
		sec: 1,
		K: 1,
		A: 1,
		mol: 1,
		cd: 1,
	}

	describe('#adds()', function (): void {
		it('adds two dimensions together', function (): void {
			expect(
				new UnitDimensions(unitData)
					.add(new UnitDimensions(unitData))
					.toJSON()
			).toEqual({
				kg: 2,
				m: 2,
				sec: 2,
				K: 2,
				A: 2,
				mol: 2,
				cd: 2,
			})
		})
	}) // #adds()

	describe('#subtract()', function (): void {
		it('subtract two dimensions together', function (): void {
			expect(
				new UnitDimensions(unitData)
					.subtract(new UnitDimensions(unitData))
					.toJSON()
			).toEqual({
				kg: 0,
				m: 0,
				sec: 0,
				K: 0,
				A: 0,
				mol: 0,
				cd: 0,
			})
		})
	}) // #subtract()

	describe('#equals()', function (): void {
		it('returns true when two dimensions are equal', function (): void {
			expect(
				new UnitDimensions(unitData).equals(
					new UnitDimensions(unitData)
				)
			).toBe(true)
		})

		it('returns false when two dimensions are not equal', function (): void {
			const unitData0: UnitDimensionsData = {
				kg: 2,
				m: 1,
				sec: 1,
				K: 1,
				A: 1,
				mol: 1,
				cd: 1,
			}

			expect(
				new UnitDimensions(unitData).equals(
					new UnitDimensions(unitData0)
				)
			).toBe(false)
		})

		it('returns false when undefined is passed in', function (): void {
			expect(new UnitDimensions(unitData).equals(undefined)).toBe(false)
		})
	}) // #equals()

	describe('#toJSON()', function (): void {
		it('returns a JSON object', function (): void {
			expect(new UnitDimensions(unitData).toJSON()).toEqual({
				kg: 1,
				m: 1,
				sec: 1,
				K: 1,
				A: 1,
				mol: 1,
				cd: 1,
			})
		})
	}) // #toJSON()
})

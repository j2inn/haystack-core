/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { UnitDatabase } from '../../src/core/UnitDatabase'
import { joule, pound, square_mile, mile } from './units'
import { HUnit } from '../../src/core/HUnit'

describe('UnitDatabase', function (): void {
	let db: UnitDatabase

	beforeEach(function (): void {
		db = new UnitDatabase()
		db.define(joule)
		db.define(pound)
		db.define(square_mile)
		db.define(mile)
	})

	describe('#define()', function (): void {
		it('does not throw an error if the same unit is defined twice', function (): void {
			expect(() => db.define(joule)).not.toThrow()
		})

		it('does not define a unit multiple times in the database', function (): void {
			// Define joules again but as a different instance.
			const joule2 = new HUnit({
				ids: ['joule', 'J'],
				scale: 1,
				offset: 0,
				dimensions: { kg: 1, m: 2, sec: -2, K: 0, A: 0, mol: 0, cd: 0 },
				quantity: 'energy',
			})

			db.define(joule2)
			expect(db.getUnitsForQuantity('energy')).toEqual([joule2])
		})
	}) // #define()

	describe('#get()', function (): void {
		it('returns a unit via its name', function (): void {
			expect(db.get(joule.name)).toEqual(joule)
		})

		it('returns a unit via its symbol', function (): void {
			expect(db.get(joule.symbol)).toEqual(joule)
		})

		it("returns undefined when it can't be found", function (): void {
			expect(db.get('foo')).toBeUndefined()
		})
	}) // #get()

	describe('#units', function (): void {
		it('returns all the registered units', function (): void {
			expect(db.units).toEqual([joule, pound, square_mile, mile])
		})
	}) // #units

	describe('#quantities', function (): void {
		it('returns all the registered quantities', function (): void {
			expect(db.quantities).toEqual([
				'energy',
				'currency',
				'area',
				'length',
			])
		})
	}) // #quantities

	describe('#getUnitsForQuantity()', function (): void {
		it('returns the units for the quantity', function (): void {
			expect(db.getUnitsForQuantity('energy')).toEqual([joule])
		})

		it('returns an empty array for a quantity that does not exist', function (): void {
			expect(db.getUnitsForQuantity('foo')).toEqual([])
		})
	}) // #getUnitsForQuantity()

	describe('#multiply()', function (): void {
		it('throws an error when the first unit is dimensionless', function (): void {
			expect(() => db.multiply(pound, joule)).toThrow()
		})

		it('throws an error when the secondary unit is dimensionless', function (): void {
			expect(() => db.multiply(joule, pound)).toThrow()
		})

		it('returns a unit for multiplying', function (): void {
			// miles * miles = square miles
			expect(db.multiply(mile, mile).name).toBe(square_mile.name)
		})

		it('handles memoization', function (): void {
			// miles * miles = square miles
			expect(db.multiply(mile, mile).name).toBe(square_mile.name)
			expect(db.multiply(mile, mile).name).toBe(square_mile.name)
		})
	}) // #multiply()

	describe('#divide()', function (): void {
		it('throws an error when the first unit is dimensionless', function (): void {
			expect(() => db.divide(pound, joule)).toThrow()
		})

		it('throws an error when the secondary unit is dimensionless', function (): void {
			expect(() => db.divide(joule, pound)).toThrow()
		})

		it('returns a unit for divideing', function (): void {
			// miles * miles = square miles
			expect(db.divide(square_mile, mile).name).toBe(mile.name)
		})

		it('handles memoization', function (): void {
			// miles * miles = square miles
			expect(db.divide(square_mile, mile).name).toBe(mile.name)
		})
	}) // #divide()
})

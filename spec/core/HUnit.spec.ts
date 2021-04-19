/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HUnit, valueIsHUnit } from '../../src/core/HUnit'
import { joule, pound, byte, megabyte } from './units'

describe('HUnit', function (): void {
	beforeEach(HUnit.clearDatabase)

	describe('valueIsHUnit()', function (): void {
		it('returns true for a unit', function (): void {
			expect(valueIsHUnit(joule)).toBe(true)
		})

		it('returns false for unit data', function (): void {
			expect(valueIsHUnit(joule.toJSON())).toBe(false)
		})

		it('returns false for undefined', function (): void {
			expect(valueIsHUnit(undefined)).toBe(false)
		})
	}) //valueIsHUnit()

	describe('.get()', function (): void {
		it("returns undefined when a unit can't be found", function (): void {
			expect(HUnit.get('foo')).toBeUndefined()
		})

		it('returns a unit via its ids', function (): void {
			const unit = HUnit.define({
				ids: ['foo', 'boo'],
				scale: 1,
				offset: 0,
			})
			expect(HUnit.get('foo')).toBe(unit)
			expect(HUnit.get('boo')).toBe(unit)
		})
	}) // .get()

	describe('.define()', function (): void {
		it('defines a unit from a unit', function (): void {
			HUnit.define(joule)
			expect(HUnit.get('joule')).toBe(joule)
		})

		it('defines a unit from some unit data', function (): void {
			HUnit.define(joule.toJSON())
			expect(HUnit.get('joule')).toEqual(joule)
		})

		it('does not throw an error if the unit is already defined', function (): void {
			const define = () => HUnit.define(joule)

			define()
			expect(define).not.toThrow()
		})
	}) // .define()

	describe('.parseDatabase()', function (): void {
		it('parse a database', function (): void {
			const units = `
-- energy (kg1*m2*sec-2)
joule, J; kg1*m2*sec-2
kilojoule, kJ; kg1*m2*sec-2; 1000.0 
			`

			expect(HUnit.parseDatabase(units)).toEqual([
				{
					ids: ['joule', 'J'],
					scale: 1,
					offset: 0,
					dimensions: {
						kg: 1,
						m: 2,
						sec: -2,
						A: 0,
						K: 0,
						cd: 0,
						mol: 0,
					},
					quantity: 'energy',
				},
				{
					ids: ['kilojoule', 'kJ'],
					scale: 1000,
					offset: 0,
					dimensions: {
						kg: 1,
						m: 2,
						sec: -2,
						A: 0,
						K: 0,
						cd: 0,
						mol: 0,
					},
					quantity: 'energy',
				},
			])
		})
	}) // .parseDatabase()

	describe('.parseQuantity()', function (): void {
		it('parse a quantity', function (): void {
			expect(HUnit.parseQuantity('-- test (me)')).toBe('test')
		})

		it('parse a quantity with extra spaces', function (): void {
			expect(HUnit.parseQuantity('--     test     (me)')).toBe('test')
		})

		it('parse a quantity with no spaces', function (): void {
			expect(HUnit.parseQuantity('--test(me)')).toBe('test')
		})
	}) // .parseQuantity()

	describe('.parseUnit()', function (): void {
		it('parses a dimensionless unit', function (): void {
			const unit = new HUnit({
				ids: ['pound_sterling', 'GBP', '£'],
				scale: 1,
				offset: 0,
			})

			expect(HUnit.parseUnit('pound_sterling,GBP,£')).toEqual(
				unit.toJSON()
			)
		})

		it('parses a unit with dimensions and scale', function (): void {
			const unit = new HUnit({
				ids: ['kilojoule', 'kJ'],
				dimensions: {
					kg: 1,
					m: 2,
					sec: -2,
				},
				scale: 1000,
				offset: 0,
			})

			expect(
				HUnit.parseUnit('kilojoule, kJ; kg1*m2*sec-2; 1000.0')
			).toEqual(unit.toJSON())
		})

		it('throws an error if the scale cannot be parsed', function (): void {
			expect(() =>
				HUnit.parseUnit('kilojoule, kJ; kg1*m2*sec-2; notANum')
			).toThrow()
		})

		it('does not parse an empty string', function (): void {
			expect(HUnit.parseUnit('')).toBeUndefined()
		})

		it('does not parse a comment', function (): void {
			expect(HUnit.parseUnit('// afilecomment')).toBeUndefined()
		})
	}) // .parseUnit()

	describe('#ids', function (): void {
		it('returns the ids for a unit', function (): void {
			expect(joule.ids).toEqual(['joule', 'J'])
		})
	}) // #ids

	describe('#name', function (): void {
		it('returns the name for a unit', function (): void {
			expect(joule.name).toEqual('joule')
		})
	}) // #name

	describe('#symbol', function (): void {
		it('returns the symbol for a unit', function (): void {
			expect(joule.symbol).toEqual('J')
		})
	}) // #symbol

	describe('#scale', function (): void {
		it('returns the scale for a unit', function (): void {
			expect(joule.scale).toEqual(1)
		})
	}) // #scale

	describe('#offset', function (): void {
		it('returns the offset for a unit', function (): void {
			expect(joule.offset).toEqual(0)
		})
	}) // #offset

	describe('#quantity', function (): void {
		it('returns the quantity for a unit', function (): void {
			expect(joule.quantity).toEqual('energy')
		})
	}) // #quantity

	describe('#dimensions', function (): void {
		it('returns the dimensions for a unit', function (): void {
			expect(joule.dimensions).toEqual({
				kg: 1,
				m: 2,
				sec: -2,
				A: 0,
				K: 0,
				cd: 0,
				mol: 0,
			})
		})
	}) // #dimensions

	describe('#toJSON()', function (): void {
		it('returns the units as a JSON object', function (): void {
			expect(joule.toJSON()).toEqual({
				ids: ['joule', 'J'],
				scale: 1,
				offset: 0,
				dimensions: {
					kg: 1,
					m: 2,
					sec: -2,
					A: 0,
					K: 0,
					cd: 0,
					mol: 0,
				},
				quantity: 'energy',
			})
		})
	}) // #toJSON()

	describe('.quantities', function (): void {
		it('returns a list of quantity names', function (): void {
			HUnit.define(joule)
			expect(HUnit.quantities).toEqual(['energy'])
		})
	}) // .quantities

	describe('.getUnitsForQuantity()', function (): void {
		it('returns a list of units for a quantity', function (): void {
			const unit = joule
			HUnit.define(unit)
			expect(JSON.stringify(HUnit.getUnitsForQuantity('energy'))).toEqual(
				JSON.stringify([unit])
			)
		})
	}) // .getUnitsForQuantity()

	describe('.units', function (): void {
		it('returns all the registered units', function (): void {
			const unit = joule
			HUnit.define(unit)
			expect(JSON.stringify(HUnit.units)).toEqual(JSON.stringify([unit]))
		})
	}) // .units

	describe('#toString()', function (): void {
		it('returns the symbol of the unit', function (): void {
			expect(joule.toString()).toBe('J')
		})
	}) // #toString()

	describe('#convertTo()', function (): void {
		it('returns a new scalar', function (): void {
			expect(joule.convertTo(2, joule)).toBe(2)
		})

		it('converts bytes to megabytes', function (): void {
			expect(byte.convertTo(1048576, megabyte)).toBe(1)
		})

		it('converts megabytes to bytes', function (): void {
			expect(megabyte.convertTo(1, byte)).toBe(1048576)
		})

		it('throws an error when trying to convert joules to megabytes', function (): void {
			expect(() => joule.convertTo(2, megabyte)).toThrow()
		})

		it('throws an error when trying to convert bytes to joules', function (): void {
			expect(() => byte.convertTo(2, joule)).toThrow()
		})

		it('throws an error when trying to convert joules to pounds', function (): void {
			expect(() => joule.convertTo(2, pound)).toThrow()
		})
	}) // #convertTo()

	describe('#equals()', function (): void {
		it('returns false when a unit is undefined', function (): void {
			expect(joule.equals(undefined)).toBe(false)
		})

		it('returns false when the unit is not equal', function (): void {
			expect(joule.equals(pound)).toBe(false)
		})

		it('returns true when the units are equal', function (): void {
			expect(joule.equals(joule)).toBe(true)
		})
	}) // #equals()
})

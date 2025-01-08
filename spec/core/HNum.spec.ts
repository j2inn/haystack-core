/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	HNum,
	POSITIVE_INFINITY_ZINC,
	NEGATIVE_INFINITY_ZINC,
	NOT_A_NUMBER_ZINC,
	DEFAULT_PRECISION,
} from '../../src/core/HNum'
import { Kind } from '../../src/core/Kind'
import { HGrid } from '../../src/core/grid/HGrid'
import { HList } from '../../src/core/HList'
import { HDict } from '../../src/core/dict/HDict'
import { HUnit } from '../../src/core/HUnit'
import {
	celsius,
	centimeter,
	fahrenheit,
	hour,
	joule,
	meter,
	millisecond,
	minute,
	second,
	square_centimeter,
} from './units'
import '../matchers'
import '../customMatchers'
import { nanosecond, microsecond, year } from '../../src/core/duration'

describe('HNum', function (): void {
	describe('.make()', function (): void {
		it('makes a number', function (): void {
			expect(HNum.make(23).valueOf()).toBe(23)
			expect(HNum.make(23) instanceof HNum).toBe(true)
		})

		it('makes a number from a hayson object', function (): void {
			const obj = {
				_kind: Kind.Number,
				val: 23,
				unit: 'm',
			}

			expect(HNum.make(obj).value).toBe(23)
			expect(HNum.make(obj).unit?.symbol).toBe('m')
		})

		it('makes positive infinity from a hayson object', function (): void {
			expect(
				HNum.make({
					_kind: Kind.Number,
					val: POSITIVE_INFINITY_ZINC,
				}).value
			).toBe(Number.POSITIVE_INFINITY)
		})

		it('makes negative infinity from a hayson object', function (): void {
			expect(
				HNum.make({
					_kind: Kind.Number,
					val: NEGATIVE_INFINITY_ZINC,
				}).value
			).toBe(Number.NEGATIVE_INFINITY)
		})

		it('makes not a number from a hayson object', function (): void {
			expect(
				HNum.make({
					_kind: Kind.Number,
					val: NOT_A_NUMBER_ZINC,
				}).value
			).toBe(Number.NaN)
		})

		it('throws an error when the value is not a special number string value', function (): void {
			expect(
				() =>
					HNum.make({
						_kind: Kind.Number,
						val: 'somethingThatIsNotInfNegInfOrNaN',
					}).value
			).toThrow()
		})

		it('returns positive infinity', function (): void {
			expect(HNum.make(Number.POSITIVE_INFINITY).value).toBe(
				Number.POSITIVE_INFINITY
			)
		})

		it('returns negative infinity', function (): void {
			expect(HNum.make(Number.NEGATIVE_INFINITY).value).toBe(
				Number.NEGATIVE_INFINITY
			)
		})

		it('returns not a number', function (): void {
			expect(HNum.make(Number.NaN).value).toBeNaN()
		})

		it('returns a haystack number from a haystack number', function (): void {
			const num = HNum.make(24)
			expect(HNum.make(num)).toBe(num)
		})
	}) // .make()

	describe('immutability', function (): void {
		it('throws error when attempting change the numeric value', function (): void {
			const num = HNum.make(34, 'm')

			expect((): void => {
				num.value = 35
			}).toThrow()
		})

		it('throws error when attempting change the unit value', function (): void {
			const num = HNum.make(34, 'm')

			expect((): void => {
				num.unit = new HUnit({ ids: ['cm'], scale: 1, offset: 0 })
			}).toThrow()
		})
	}) // immutability

	describe('#valueOf()', function (): void {
		it("returns the number's value", function (): void {
			expect(HNum.make(23).valueOf()).toBe(23)
		})
	}) // #valueOf()

	describe('#unit()', function (): void {
		it('returns the units for the number', function (): void {
			expect(HNum.make(23, 'cm').unit?.symbol).toBe('cm')
		})

		it('returns undefined if not specified', function (): void {
			expect(HNum.make(23).unit).toBe(undefined)
		})
	}) //#unit()

	describe('#toString()', function (): void {
		it('returns the integer encoded as a string', function (): void {
			expect(HNum.make(34).toString()).toBe('34')
		})

		it('returns the integer encoded as a string with precision', function (): void {
			expect(HNum.make(34).toString(4)).toBe('34')
		})

		it('returns the number encoded as a string', function (): void {
			expect(HNum.make(34.6).toString()).toBe('34.6')
		})

		it('returns the number and units encoded as a string', function (): void {
			expect(HNum.make(34.6, 'cm').toString()).toBe('34.6cm')
		})

		it('returns the number encoded as a string to one decimal place', function (): void {
			expect(HNum.make(34.635234234).toString()).toBe('34.6')
		})

		it('returns the number encoded as a string to four decimal places', function (): void {
			expect(HNum.make(34.635234234).toString(4)).toBe('34.6352')
		})

		it('returns the number and units encoded as a string to one decimal place', function (): void {
			expect(HNum.make(34.635234234, 'cm').toString()).toBe('34.6cm')
		})

		it('returns the number and units encoded as a string to four decimal places', function (): void {
			expect(HNum.make(34.635234234, 'cm').toString(4)).toBe('34.6352cm')
		})

		it('returns INF for positive infinity', function (): void {
			expect(HNum.make(Number.POSITIVE_INFINITY).toString()).toBe('INF')
		})

		it('returns -INF for negative infinity', function (): void {
			expect(HNum.make(Number.NEGATIVE_INFINITY).toString()).toBe('-INF')
		})

		it('returns NaN for not a number', function (): void {
			expect(HNum.make(Number.NaN).toString()).toBe('NaN')
		})

		it('returns the number with U.S. locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'en-us',
				})
			).toBe('1,000.5')
		})

		it('returns the number with Great Britain locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'en-gb',
				})
			).toBe('1,000.5')
		})

		// Disabling this test for now. It seems like Node 22.12.0 formats this differently
		// for Italy compared to other JS runtimes.
		xit('returns the number with Italys locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'it-it',
				})
			).toBe('1.000,5')
		})

		it('returns the number with Frances locale formatting', () => {
			// Handle escaped space.
			const formattedNumber = HNum.make(1000.5)
				.toString({ precision: DEFAULT_PRECISION, locale: 'fr-fr' })
				.replace(/\s/g, ' ')

			expect(formattedNumber).toBe('1 000,5')
		})

		it('returns the number with Germanys locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'de-de',
				})
			).toBe('1.000,5')
		})

		it('returns the number with Spains locale formatting', () => {
			expect(
				HNum.make(10000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'es-es',
				})
			).toBe('10.000,5')
		})

		it('returns the number with Netherlands locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'nl-nl',
				})
			).toBe('1.000,5')
		})

		it('returns the number with Netherlands (Belgium) locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'nl-be',
				})
			).toBe('1.000,5')
		})

		it('returns the number with Chinas locale formatting', () => {
			expect(
				HNum.make(1000.5).toString({
					precision: DEFAULT_PRECISION,
					locale: 'zh-cn',
				})
			).toBe('1,000.5')
		})
	}) // #toString()

	describe('#equals()', function (): void {
		it('null returns false', function (): void {
			expect(HNum.make(34.4).equals(null as unknown as HNum)).toBe(false)
		})

		it('undefined returns false', function (): void {
			expect(HNum.make(34.4).equals(undefined as unknown as HNum)).toBe(
				false
			)
		})

		it('string returns false', function (): void {
			expect(HNum.make(34.4).equals('foo' as unknown as HNum)).toBe(false)
		})

		it('same number with no units returns true', function (): void {
			expect(HNum.make(34.4).equals(HNum.make(34.4))).toBe(true)
		})

		it('same number with different units on target returns false', function (): void {
			expect(HNum.make(34.4).equals(HNum.make(34.4, 'cm'))).toBe(false)
		})

		it('same number with different units on source returns false', function (): void {
			expect(HNum.make(34.4, 'cm').equals(HNum.make(34.4))).toBe(false)
		})

		it('Two NaN values return true', function (): void {
			expect(HNum.make(Number.NaN).equals(HNum.make(Number.NaN))).toBe(
				true
			)
		})
	}) // #equals()

	describe('#compareTo()', function (): void {
		it('returns -1 when first is less than second', function (): void {
			expect(HNum.make(1).compareTo(HNum.make(2))).toBe(-1)
		})

		it('returns 1 when first is greater than second', function (): void {
			expect(HNum.make(2).compareTo(HNum.make(1))).toBe(1)
		})

		it('returns 0 when first is equal to second', function (): void {
			expect(HNum.make(1).compareTo(HNum.make(1))).toBe(0)
		})
	}) // #compareTo()

	describe('#toFilter()', function (): void {
		it('returns the number encoded as a string', function (): void {
			expect(HNum.make(34.6).toFilter()).toBe('34.6')
		})

		it('returns the number and units encoded as a string', function (): void {
			expect(HNum.make(34.6, 'cm').toFilter()).toBe('34.6cm')
		})

		it('throws an error when encoding not a number', function (): void {
			expect((): void => {
				HNum.make(Number.NaN).toFilter()
			}).toThrow()
		})

		it('throws an error when encoding positive infinity', function (): void {
			expect((): void => {
				HNum.make(Number.POSITIVE_INFINITY).toFilter()
			}).toThrow()
		})

		it('throws an error when encoding negative infinity', function (): void {
			expect((): void => {
				HNum.make(Number.NEGATIVE_INFINITY).toFilter()
			}).toThrow()
		})
	}) // #toFilter()

	describe('#toZinc()', function (): void {
		it('returns the number encoded as a string', function (): void {
			expect(HNum.make(34.6).toZinc()).toBe('34.6')
		})

		it('returns the number and units encoded as a string', function (): void {
			expect(HNum.make(34.6, 'cm').toZinc()).toBe('34.6cm')
		})

		it('returns INF for positive infinity', function (): void {
			expect(HNum.make(Number.POSITIVE_INFINITY).toZinc()).toBe('INF')
		})

		it('returns -INF for negative infinity', function (): void {
			expect(HNum.make(Number.NEGATIVE_INFINITY).toZinc()).toBe('-INF')
		})

		it('returns NaN for not a number', function (): void {
			expect(HNum.make(Number.NaN).toZinc()).toBe('NaN')
		})
	}) // #toZinc()

	describe('#toJSON()', function (): void {
		it('returns number with no units', function (): void {
			expect(HNum.make(123).toJSON()).toEqual(123)
		})

		it('returns JSON with units', function (): void {
			expect(HNum.make(123, 'm').toJSON()).toEqual({
				_kind: Kind.Number,
				val: 123,
				unit: 'm',
			})
		})

		it('returns positive infinity', function (): void {
			expect(HNum.make(Number.POSITIVE_INFINITY).toJSON()).toEqual({
				_kind: Kind.Number,
				val: POSITIVE_INFINITY_ZINC,
			})
		})

		it('returns negative infinity', function (): void {
			expect(HNum.make(Number.NEGATIVE_INFINITY).toJSON()).toEqual({
				_kind: Kind.Number,
				val: NEGATIVE_INFINITY_ZINC,
			})
		})

		it('returns not a number', function (): void {
			expect(HNum.make(Number.NaN).toJSON()).toEqual({
				_kind: Kind.Number,
				val: NOT_A_NUMBER_ZINC,
			})
		})
	}) // #toJSON()

	describe('#toJSONString()', function (): void {
		it('returns JSON string', function (): void {
			expect(HNum.make(123, 'm').toJSONString()).toBe(
				JSON.stringify({
					_kind: Kind.Number,
					val: 123,
					unit: 'm',
				})
			)
		})
	}) // #toJSONString()

	describe('#toJSONv3()', function (): void {
		it('returns the number encoded as a string', function (): void {
			expect(HNum.make(34.6).toJSONv3()).toBe('n:34.6')
		})

		it('returns the number and units encoded as a string', function (): void {
			expect(HNum.make(34.6, 'cm').toJSONv3()).toBe('n:34.6 cm')
		})

		it('returns INF for positive infinity', function (): void {
			expect(HNum.make(Number.POSITIVE_INFINITY).toJSONv3()).toBe('n:INF')
		})

		it('returns -INF for negative infinity', function (): void {
			expect(HNum.make(Number.NEGATIVE_INFINITY).toJSONv3()).toBe(
				'n:-INF'
			)
		})

		it('returns NaN for not a number', function (): void {
			expect(HNum.make(Number.NaN).toJSONv3()).toBe('n:NaN')
		})
	}) // #toJSONv3()

	describe('#toAxon()', function (): void {
		it('returns an Axon string', function (): void {
			expect(HNum.make(34.6, 'm').toZinc()).toBe('34.6m')
		})
	}) // #toAxon()

	describe('#isKind()', function (): void {
		it('returns true when the kind matches', function (): void {
			expect(HNum.make(123).isKind(Kind.Number)).toBe(true)
		})

		it('returns false when the kind does not match', function (): void {
			expect(HNum.make(123).isKind(Kind.Dict)).toBe(false)
		})
	}) // #isKind()

	describe('#matches()', function (): void {
		it('returns true when the number matches', function (): void {
			expect(HNum.make(123).matches('item == 123')).toBe(true)
		})

		it('returns true when the number and unit matches', function (): void {
			expect(HNum.make(123, 'm').matches('item == 123m')).toBe(true)
		})

		it('returns false when the number does not match', function (): void {
			expect(HNum.make(122).matches('item == 123')).toBe(false)
		})
	}) // #matches()

	describe('#newCopy()', function (): void {
		it('returns an instance of itself', function (): void {
			const num = HNum.make(123)
			expect(num.newCopy()).toBe(num)
		})
	}) // #newCopy()

	describe('#toGrid()', function (): void {
		it('returns the value as a grid', function (): void {
			const num = HNum.make(42)
			expect(num.toGrid()).toValEqual(
				HGrid.make([HDict.make({ val: num })])
			)
		})
	}) // #toGrid()

	describe('#toList()', function (): void {
		it('returns the value as a list', function (): void {
			const num = HNum.make(42)
			expect(num.toList()).toValEqual(HList.make([num]))
		})
	}) // #toList()

	describe('#toDict()', function (): void {
		it('returns the value as a dict', function (): void {
			const num = HNum.make(42)
			expect(num.toDict()).toValEqual(HDict.make({ val: num }))
		})
	}) // #toDict()

	describe('caching', function (): void {
		it('Zero with no units creates the same object', function (): void {
			expect(HNum.make(0)).toBe(HNum.make(0))
		})

		it('Non-zero with no units creates a different object', function (): void {
			expect(HNum.make(0)).not.toBe(HNum.make(1))
		})

		it('Zero with units creates a different object', function (): void {
			expect(HNum.make(0, 'm')).not.toBe(HNum.make(0))
		})
	}) // caching

	describe('units', function (): void {
		beforeEach(function (): void {
			HUnit.define(second)
			HUnit.define(minute)
			HUnit.define(millisecond)
			HUnit.define(hour)
			HUnit.define(joule)
			HUnit.define(celsius)
			HUnit.define(centimeter)
			HUnit.define(fahrenheit)
			HUnit.define(meter)
			HUnit.define(square_centimeter)
		})

		afterEach(HUnit.clearDatabase)

		describe('#plus()', function (): void {
			it('adds two numbers together with no units', function (): void {
				expect(HNum.make(1).plus(HNum.make(2))).toValEqual(HNum.make(3))
			})

			it('adds two numbers together with the same units', function (): void {
				expect(
					HNum.make(1, celsius).plus(HNum.make(2, celsius))
				).toValEqual(HNum.make(3, celsius))
			})

			it('adds two numbers together using the unit', function (): void {
				expect(HNum.make(1, celsius).plus(HNum.make(2))).toValEqual(
					HNum.make(3, celsius)
				)
			})

			it('adds two numbers together using the unit argument', function (): void {
				expect(HNum.make(1).plus(HNum.make(2, celsius))).toValEqual(
					HNum.make(3, celsius)
				)
			})

			it('throws an error when the units are different', function (): void {
				expect(() =>
					HNum.make(1, celsius).plus(HNum.make(2, fahrenheit))
				).toThrow()
			})
		}) // #plus()

		describe('#minus()', function (): void {
			it('subtracts a number with no units', function (): void {
				expect(HNum.make(3).minus(HNum.make(1))).toValEqual(
					HNum.make(2)
				)
			})

			it('subtracts a number with the same unitss', function (): void {
				expect(
					HNum.make(3, celsius).minus(HNum.make(2, celsius))
				).toValEqual(HNum.make(1, celsius))
			})

			it('subtracts a number using the unit', function (): void {
				expect(HNum.make(3, celsius).minus(HNum.make(2))).toValEqual(
					HNum.make(1, celsius)
				)
			})

			it('subtracts a number using the unit argument', function (): void {
				expect(HNum.make(3).minus(HNum.make(2, celsius))).toValEqual(
					HNum.make(1, celsius)
				)
			})

			it('throws an error when the units are different', function (): void {
				expect(() =>
					HNum.make(3, celsius).minus(HNum.make(2, fahrenheit))
				).toThrow()
			})
		}) // #minus()

		describe('#multiply()', function (): void {
			it('multiply two numbers with no units', function (): void {
				expect(HNum.make(2).multiply(HNum.make(2))).toValEqual(
					HNum.make(4)
				)
			})

			it('multiply two numbers with the same units', function (): void {
				expect(
					HNum.make(2, centimeter).multiply(HNum.make(2, centimeter))
				).toValEqual(HNum.make(4, square_centimeter))
			})

			it('multiply two numbers using the unit', function (): void {
				expect(
					HNum.make(2, centimeter).multiply(HNum.make(2))
				).toValEqual(HNum.make(4, centimeter))
			})

			it('multiply two numbers using the unit argument', function (): void {
				expect(
					HNum.make(2).multiply(HNum.make(2, centimeter))
				).toValEqual(HNum.make(4, centimeter))
			})

			it('throws an error when the units are different', function (): void {
				expect(() =>
					HNum.make(1, centimeter).multiply(HNum.make(2, meter))
				).toThrow()
			})
		}) // #multiply()

		describe('#divide()', function (): void {
			it('divide two numbers with no units', function (): void {
				expect(HNum.make(4).divide(HNum.make(2))).toValEqual(
					HNum.make(2)
				)
			})

			it('divide two numbers with the same units', function (): void {
				expect(
					HNum.make(4, square_centimeter).divide(
						HNum.make(2, centimeter)
					)
				).toValEqual(HNum.make(2, centimeter))
			})

			it('divide two numbers using the unit', function (): void {
				expect(
					HNum.make(4, centimeter).divide(HNum.make(2))
				).toValEqual(HNum.make(2, centimeter))
			})

			it('divide two numbers using the unit argument', function (): void {
				expect(
					HNum.make(4).divide(HNum.make(2, centimeter))
				).toValEqual(HNum.make(2, centimeter))
			})

			it('throws an error when the units are different', function (): void {
				expect(() =>
					HNum.make(4, centimeter).divide(HNum.make(2, meter))
				).toThrow()
			})
		}) // #divide()

		describe('#convertTo()', function (): void {
			it('converts 60 seconds to one minute', function (): void {
				expect(HNum.make(60, second).convertTo(minute)).toValEqual(
					HNum.make(1, minute)
				)
			})

			it('converts 1 minute to 60 seconds', function (): void {
				expect(HNum.make(1, minute).convertTo(second)).toValEqual(
					HNum.make(60, second)
				)
			})

			it('converts 1 minute to 60 seconds', function (): void {
				expect(HNum.make(1, minute).convertTo(second)).toValEqual(
					HNum.make(60, second)
				)
			})

			it('converts one hour to milliseconds', function (): void {
				expect(HNum.make(1, hour).convertTo(millisecond)).toValEqual(
					HNum.make(3600000, millisecond)
				)
			})

			it('throws an error for an unconvertable value', function (): void {
				expect(() => HNum.make(1, hour).convertTo(joule)).toThrow()
			})
		}) // #convertTo()

		describe('#isDuration()', function (): void {
			it('returns true for seconds', function (): void {
				expect(HNum.make(1, second).isDuration()).toBe(true)
			})

			it('returns true for milliseconds', function (): void {
				expect(HNum.make(1, millisecond).isDuration()).toBe(true)
			})

			it('returns false for joule', function (): void {
				expect(HNum.make(1, joule).isDuration()).toBe(false)
			})

			it('returns false for celsius', function (): void {
				expect(HNum.make(1, celsius).isDuration()).toBe(false)
			})
		}) // #isDuration()

		describe('#compareTo()', function (): void {
			it('throws an error when comparing two numbers with incompatible units', function (): void {
				expect(() =>
					HNum.make(2, millisecond).compareTo(HNum.make(3, joule))
				).toThrow('ms <=> J')
			})

			it('one millisecond is less than one second', function (): void {
				expect(
					HNum.make(1, millisecond).compareTo(HNum.make(1, second))
				).toBe(-1)
			})

			it('one second is greater than one millisecond', function (): void {
				expect(
					HNum.make(1, second).compareTo(HNum.make(1, millisecond))
				).toBe(1)
			})

			it('one second is equal to one second', function (): void {
				expect(
					HNum.make(1, second).compareTo(HNum.make(1, second))
				).toBe(0)
			})

			it('one second is equal to one thousand milliseconds', function (): void {
				expect(
					HNum.make(1, second).compareTo(HNum.make(1000, millisecond))
				).toBe(0)
			})

			it('one thousand nanoseconds are equal to one microsecond', function (): void {
				expect(
					HNum.make(1000, nanosecond).compareTo(
						HNum.make(1, microsecond)
					)
				).toBe(0)
			})

			it('one nanosecond is equal to one thousand microseconds', function (): void {
				expect(
					HNum.make(1, nanosecond).compareTo(
						HNum.make(0.001, microsecond)
					)
				).toBe(0)
			})

			it('one thousand years are equal to a lot of microseconds', function (): void {
				expect(
					HNum.make(1000, year).compareTo(
						HNum.make(31536000000000000, microsecond)
					)
				).toBe(0)
			})
		}) // #compareTo()
	}) // units
})

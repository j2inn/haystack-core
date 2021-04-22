/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { memoize } from '../../src/util/memoize'

describe('memoize', function (): void {
	describe('getters', function (): void {
		class MathUtil {
			public index = 0

			@memoize()
			public get increment(): number {
				return ++this.index
			}

			@memoize()
			public get decrement(): number {
				return --this.index
			}
		}

		let util: MathUtil

		beforeEach(function (): void {
			util = new MathUtil()
		})

		it('memoizes returns the same value', function (): void {
			expect(util.index).toBe(0)
			expect(util.increment).toBe(1)
			expect(util.increment).toBe(1)
			expect(util.index).toBe(1)

			expect(util.decrement).toBe(0)
			expect(util.decrement).toBe(0)
			expect(util.increment).toBe(1)
			expect(util.index).toBe(0)
		})
	}) // getters

	describe('methods', function (): void {
		class StrUtil {
			public counter = 0

			@memoize()
			public add(a: number, b: number): number {
				this.counter++
				return a + b
			}
		}

		let util: StrUtil

		beforeEach(function (): void {
			util = new StrUtil()
		})

		it('adds two numbers together and increments the counter', function (): void {
			expect(util.add(1, 2)).toBe(3)
			expect(util.counter).toBe(1)
		})

		it('adds two numbers together twice and memoizes the result', function (): void {
			expect(util.add(1, 2)).toBe(3)
			expect(util.add(1, 2)).toBe(3)
			expect(util.counter).toBe(1)
		})

		it('adds two numbers together twice and a third with different arguments and memoizes the result', function (): void {
			expect(util.add(1, 2)).toBe(3)
			expect(util.add(1, 2)).toBe(3)
			expect(util.add(2, 2)).toBe(4)
			expect(util.counter).toBe(2)
		})
	}) // methods

	describe('setters', function (): void {
		it('throws an error when a setter is memoized', function (): void {
			expect((): void => {
				class MathUtil {
					public index = 0

					@memoize()
					public set increment(num: number) {
						this.index = this.index + num
					}
				}

				const util = new MathUtil()
				util.increment = 5
			}).toThrow()
		})
	}) // setters
})

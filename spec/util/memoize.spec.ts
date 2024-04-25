/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { memoize, getMemoizeCache, MemoizeCache } from '../../src/util/memoize'

/* eslint @typescript-eslint/no-explicit-any: "off" */

describe('memoize', () => {
	describe('memoize class getter methods', () => {
		class MathUtil {
			index = 0

			@memoize()
			get increment(): number {
				return ++this.index
			}

			@memoize()
			get decrement(): number {
				return --this.index
			}
		}

		let util: MathUtil

		beforeEach(function (): void {
			util = new MathUtil()
		})

		it('returns the same value', () => {
			expect(util.index).toBe(0)
			expect(util.increment).toBe(1)
			expect(util.increment).toBe(1)
			expect(util.index).toBe(1)

			expect(util.decrement).toBe(0)
			expect(util.decrement).toBe(0)
			expect(util.increment).toBe(1)
			expect(util.index).toBe(0)
		})

		it('clears memoization', () => {
			expect(util.increment).toBe(1)
			expect(util.increment).toBe(1)

			getMemoizeCache(util)?.clear()

			expect(util.increment).toBe(2)
		})

		describe('memoize using TC39 decorators', () => {
			it('returns the same value', () => {
				class MathUtil {
					index = 0

					get increment(): number {
						return ++this.index
					}
				}

				const getter = Object.getOwnPropertyDescriptor(
					MathUtil.prototype,
					'increment'
				)?.get

				const func = memoize()(getter, {
					name: 'increment',
					kind: 'getter',
				} as unknown as ClassMethodDecoratorContext) as any

				const util = new MathUtil()

				expect(func.call(util)).toBe(1)
				expect(func.call(util)).toBe(1)
			})
		}) // TC39
	}) // getters

	describe('memoize class methods', () => {
		class StrUtil {
			counter = 0

			@memoize()
			add(a: number, b: number): number {
				this.counter++
				return a + b
			}
		}

		let util: StrUtil

		beforeEach(() => {
			util = new StrUtil()
		})

		it('adds two numbers together and increments the counter', () => {
			expect(util.add(1, 2)).toBe(3)
			expect(util.counter).toBe(1)
		})

		it('adds two numbers together twice and memoizes the result', () => {
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

		describe('memoize using TC39 decorators', () => {
			it('adds two numbers together and increments the counter', () => {
				class StrUtil {
					counter = 0

					add(a: number, b: number): number {
						this.counter++
						return a + b
					}
				}

				const func = memoize()(StrUtil.prototype.add, {
					name: 'add',
					kind: 'method',
				} as ClassMethodDecoratorContext) as any

				const util = new StrUtil()

				let result = func.call(util, 1, 2)
				expect(result).toBe(3)
				expect(util.counter).toBe(1)

				result = func.call(util, 1, 2)
				expect(result).toBe(3)
				expect(util.counter).toBe(1)
			})
		}) // TC39
	}) // methods

	describe('memoize class setter methods', () => {
		it('throws an error when a setter is memoized', function (): void {
			expect((): void => {
				class MathUtil {
					index = 0

					@memoize()
					set increment(num: number) {
						this.index = this.index + num
					}
				}

				const util = new MathUtil()
				util.increment = 5
			}).toThrow()
		})
	}) // setters

	describe('getMemoizeCache()', () => {
		class MathUtil {
			index = 0

			@memoize()
			increment(): void {
				++this.index
			}

			getCache(): MemoizeCache | undefined {
				return getMemoizeCache(this)
			}
		}

		let util: MathUtil

		beforeEach(() => {
			util = new MathUtil()
		})

		it('returns undefined when there is no cache created yet', () => {
			expect(getMemoizeCache(util)).toBeUndefined()
		})

		it('returns a cache via a function argument', () => {
			util.increment()
			expect(getMemoizeCache(util)).not.toBeUndefined()
		})

		it('returns a cache via the this context', () => {
			util.increment()
			expect(util.getCache()).not.toBeUndefined()
		})
	}) // getMemoizeCache()

	describe('MemoizeCache', () => {
		let cache: MemoizeCache

		beforeEach(() => {
			cache = new MemoizeCache()
		})

		describe('#get()', () => {
			it('returns a value from the cache', () => {
				cache.set('test', 1)
				expect(cache.get('test')).toBe(1)
			})

			it('returns undefined when a value from the cache cannot be found', () => {
				expect(cache.get('test')).toBeUndefined()
			})
		}) // #get()

		describe('#set()', () => {
			it('sets a value and returns it', () => {
				expect(cache.set('test', 1)).toBe(1)
				expect(cache.get('test')).toBe(1)
			})
		}) // #set()

		describe('#has()', () => {
			it('returns false when there is no value cached', () => {
				expect(cache.has('test')).toBe(false)
			})

			it('returns true when there is a value cached', () => {
				cache.set('test', 1)
				expect(cache.has('test')).toBe(true)
			})
		}) // #has()

		describe('#clear()', () => {
			it('clears all the value from the cache', () => {
				cache.set('test', 1)
				cache.set('test1', 2)

				expect(cache.isEmpty()).toBe(false)
				cache.clear()
				expect(cache.isEmpty()).toBe(true)
			})
		}) // #clear()

		describe('#remove()', () => {
			it('removes an item from the cache', () => {
				cache.set('test', 1)

				expect(cache.isEmpty()).toBe(false)
				cache.remove('test')
				expect(cache.isEmpty()).toBe(true)
			})
		}) // #remove()

		describe('#size', () => {
			it('returns the size of the cache', () => {
				expect(cache.size).toBe(0)

				cache.set('test', 1)
				expect(cache.size).toBe(1)

				cache.set('test2', 2)
				expect(cache.size).toBe(2)
			})
		}) // #size

		describe('#isEmpty()', () => {
			it('returns true if the cache is empty', () => {
				expect(cache.isEmpty()).toBe(true)
			})

			it('returns false if the cache is not empty', () => {
				cache.set('test', 1)
				expect(cache.isEmpty()).toBe(false)
			})
		}) // #isEmpty()

		describe('#keys()', () => {
			it('returns all the keys from the cache', () => {
				cache.set('test1', 1)
				cache.set('test2', 2)
				expect(cache.keys).toEqual(['test1', 'test2'])
			})
		}) // #keys()

		describe('#toObj()', () => {
			it('return an object', () => {
				cache.set('test1', 1)
				cache.set('test2', 2)

				expect(cache.toObj()).toEqual({
					test1: 1,
					test2: 2,
				})
			})
		}) // #toObj()

		describe('#inspect()', () => {
			it('outputs a table', () => {
				cache.set('test1', 1)

				jest.spyOn(console, 'table')
				cache.inspect()
				expect(console.table).toHaveBeenCalled()
			})

			it('outputs a table with a title', () => {
				cache.set('test1', 1)

				jest.spyOn(console, 'log')
				cache.inspect('A message')
				expect(console.log).toHaveBeenCalledWith('A message')
			})
		}) // #inspect()
	}) // MemoizeCache
})

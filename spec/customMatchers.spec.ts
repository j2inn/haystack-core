/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HBool } from '../src/core/HBool'
import { matchers } from './customMatchers'
import { HVal } from '../src/core/HVal'

describe('customMatchers', function (): void {
	describe('#toValEqual()', function (): void {
		it('returns true when two values are equal', function (): void {
			const res = matchers.toValEqual(HBool.make(true), HBool.make(true))

			expect(res.pass).toBe(true)
			expect(typeof res.message()).toBe('string')
		})

		it('returns false when two values are not equal', function (): void {
			const res = matchers.toValEqual(HBool.make(true), HBool.make(false))
			expect(res.pass).toBe(false)
			expect(typeof res.message()).toBe('string')
		})

		it('returns false when first value is not a haystack value', function (): void {
			const res = matchers.toValEqual(
				({} as unknown) as HVal,
				HBool.make(false)
			)

			expect(res.pass).toBe(false)
			expect(typeof res.message()).toBe('string')
		})

		it('returns false when second value is not a haystack value', function (): void {
			const res = matchers.toValEqual(
				HBool.make(false),
				({} as unknown) as HVal
			)
			expect(res.pass).toBe(false)
			expect(typeof res.message()).toBe('string')
		})
	}) // #toValEqual
})

/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { TokenPaths } from '../../src/filter/TokenPaths'

describe('TokenPaths', function (): void {
	let token: TokenPaths

	beforeEach(function (): void {
		token = new TokenPaths(['a', 'b', 'c'])
	})

	describe('#toFilter()', function (): void {
		it('returns a joined series of paths', function (): void {
			expect(token.toFilter()).toBe('a->b->c')
		})
	}) // #toFilter()

	describe('#equals()', function (): void {
		it('returns true when the token paths are the same', function (): void {
			expect(token.equals(token)).toBe(true)
		})

		it('returns false if the token is not a token path', function (): void {
			expect(token.equals(null as unknown as TokenPaths)).toBe(false)
		})

		it('returns false when the paths are a different length', function (): void {
			const token2 = new TokenPaths(['a'])
			expect(token.equals(token2)).toBe(false)
		})

		it('returns false when the paths are different', function (): void {
			const token2 = new TokenPaths(['a', 'b', 'd'])
			expect(token.equals(token2)).toBe(false)
		})
	}) // #equals()

	describe('#toJSON()', function (): void {
		it('returns a JSON representation of the token', function (): void {
			expect(token.toJSON()).toEqual({
				type: 'paths',
				paths: ['a', 'b', 'c'],
			})
		})
	}) // #toJSON()
})

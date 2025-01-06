/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { TokenRelationship } from '../../src/filter/TokenRelationship'
import { TokenPaths } from '../../src/filter/TokenPaths'

describe('TokenRelationship', function (): void {
	let token: TokenRelationship

	beforeEach(function (): void {
		token = new TokenRelationship('inputs')
	})

	describe('#equals()', function (): void {
		it('returns true when the token is the same', function (): void {
			expect(token.equals(token)).toBe(true)
		})

		it('returns false when the relationship is different', function (): void {
			expect(token.equals(new TokenRelationship('outputs'))).toBe(false)
		})

		it('returns false when the token is different', function (): void {
			expect(token.equals(new TokenPaths(['foo']))).toBe(false)
		})
	}) // #equals()

	describe('#toString()', function (): void {
		it('returns the filter', function (): void {
			expect(token.toString()).toBe('inputs?')
		})
	}) // #toString()

	describe('#toFilter()', function (): void {
		it('returns a filter with a relationship', function (): void {
			expect(token.toFilter()).toBe('inputs?')
		})
	}) // #toFilter()

	describe('#toJSON()', function (): void {
		it('returns a JSON object of the token', function (): void {
			expect(token.toJSON()).toEqual({
				type: 'rel',
				relationship: 'inputs',
			})
		})
	}) // #toJSON()
})

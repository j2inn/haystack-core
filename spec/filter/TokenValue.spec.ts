/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { TokenValue } from '../../src/filter/TokenValue'
import { HBool } from '../../src/core/HBool'
import { TokenType } from '../../src/filter/TokenType'

describe('TokenValue', function (): void {
	let token: TokenValue

	beforeEach(function (): void {
		token = new TokenValue(TokenType.boolean, HBool.make(true))
	})

	describe('#toFilter()', function (): void {
		it('returns the values filter value', function (): void {
			expect(token.toFilter()).toBe('true')
		})
	}) // #toFilter()

	describe('#equals()', function (): void {
		it('returns true when the token paths are the same', function (): void {
			expect(token.equals(token)).toBe(true)
		})

		it('returns false if the token is not a token value', function (): void {
			expect(token.equals(null as unknown as TokenValue)).toBe(false)
		})

		it('returns false when the token is different', function (): void {
			expect(
				token.equals(
					new TokenValue(TokenType.boolean, HBool.make(false))
				)
			).toBe(false)
		})
	}) // #equals()

	describe('.makeBool()', function (): void {
		it('returns a true boolean token value', function (): void {
			expect(TokenValue.makeBool(true).equals(token)).toBe(true)
		})

		it('returns a false boolean token value', function (): void {
			const falseToken = new TokenValue(
				TokenType.boolean,
				HBool.make(false)
			)
			expect(TokenValue.makeBool(false).equals(falseToken)).toBe(true)
		})
	}) // .makeBool()

	describe('#toJSON()', function (): void {
		it('returns a JSON representation of the token', function (): void {
			expect(token.toJSON()).toEqual({
				type: 'boolean',
				val: true,
			})
		})
	}) // #toJSON()
})

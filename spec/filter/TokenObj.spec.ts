/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { TokenObj } from '../../src/filter/TokenObj'
import { TokenType } from '../../src/filter/TokenType'

describe('TokenObj', function (): void {
	it('Creates a token with a type', function (): void {
		expect(new TokenObj(TokenType.text, 'foo').type).toBe(TokenType.text)
	})

	describe('#text', function (): void {
		it('Returns the token text', function (): void {
			expect(new TokenObj(TokenType.text, 'foo').text).toBe('foo')
		})
	}) // text

	describe('#is()', function (): void {
		it('returns true when the type matches', function (): void {
			expect(new TokenObj(TokenType.text, 'foo').is(TokenType.text)).toBe(
				true
			)
		})

		it('returns false when the type does not match', function (): void {
			expect(new TokenObj(TokenType.number, '1').is(TokenType.text)).toBe(
				false
			)
		})
	}) // '#is()

	describe('#equals()', function (): void {
		it('returns true when the type matches', function (): void {
			expect(
				new TokenObj(TokenType.text, 'foo').equals(
					new TokenObj(TokenType.text, 'foo')
				)
			).toBe(true)
		})

		it('returns false when the type does not match', function (): void {
			expect(
				new TokenObj(TokenType.text, 'foo').equals(
					new TokenObj(TokenType.text, 'foob')
				)
			).toBe(false)
		})

		it('returns false when the object is null', function (): void {
			expect(
				new TokenObj(TokenType.text, 'foo').equals(
					(null as unknown) as TokenObj
				)
			).toBe(false)
		})

		it('returns false when the object is undefined', function (): void {
			expect(
				new TokenObj(TokenType.text, 'foo').equals(
					(undefined as unknown) as TokenObj
				)
			).toBe(false)
		})
	}) // '#equals()

	describe('#toJSON()', function (): void {
		it('returns a string representation of a token', function (): void {
			expect(new TokenObj(TokenType.text, 'foo').toJSON()).toEqual({
				type: 'text',
				text: 'foo',
			})
		})
	}) // #toJSON()
}) // TokenText

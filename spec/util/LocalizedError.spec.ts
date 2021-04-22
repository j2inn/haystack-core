/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { LocalizedError } from '../../src/util/LocalizedError'

describe('LocalizedError', function (): void {
	let error: LocalizedError

	beforeEach(function (): void {
		error = new LocalizedError({
			message: 'message',
			lex: 'lex',
			args: { arg: 'args' },
			index: 0,
		})
	})

	describe('message', function (): void {
		it('returns an error message', function (): void {
			expect(error.message).toBe('message')
		})
	}) // message

	describe('#lex', function (): void {
		it('returns the lexicon value', function (): void {
			expect(error.lex).toBe('lex')
		})
	}) // #lex

	describe('#args', function (): void {
		it('returns the arguments', function (): void {
			expect(error.args).toEqual({ arg: 'args' })
		})
	}) // #args

	describe('#index', function (): void {
		it('returns the index', function (): void {
			expect(error.index).toBe(0)
		})
	}) // #index
})

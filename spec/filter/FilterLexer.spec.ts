/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { TokenValue } from '../../src/filter/TokenValue'
import { TokenType } from '../../src/filter/TokenType'
import { FilterLexer } from '../../src/filter/FilterLexer'
import { HNum } from '../../src/core/HNum'
import { TokenPaths } from '../../src/filter/TokenPaths'
import { Scanner } from '../../src/util/Scanner'
import { TokenRelationship } from '../../src/filter/TokenRelationship'

describe('FilterLexer', function (): void {
	function makeLexer(input: string): FilterLexer {
		return new FilterLexer(new Scanner(input))
	}

	describe('#nextToken()', function (): void {
		it('returns an EOF token for an empty string', function (): void {
			expect(makeLexer('').nextToken().is(TokenType.eof)).toBe(true)
		})

		it('returns an EOF token when called multiple times', function (): void {
			const lexer = makeLexer('')
			for (let i = 0; i < 10; ++i) {
				expect(lexer.nextToken().is(TokenType.eof)).toBe(true)
			}
		})

		it('returns an EOF token for a string with white space', function (): void {
			expect(makeLexer(' \n\r\t ').nextToken().is(TokenType.eof)).toBe(
				true
			)
		})

		describe('string', function (): void {
			it('returns a string token', function (): void {
				expect(makeLexer('"some text"').nextToken().type).toBe(
					TokenType.string
				)
			})

			it('returns a string token with valid text', function (): void {
				expect(makeLexer('"some text"').nextToken().toString()).toBe(
					'some text'
				)
			})

			it('parse multiple string tokens followed by an EOF token', function (): void {
				const lexer = makeLexer(
					'"first text string""second text string"'
				)

				const first = lexer.nextToken()
				expect(first.type).toBe(TokenType.string)
				expect(first.toString()).toBe('first text string')

				const second = lexer.nextToken()
				expect(second.type).toBe(TokenType.string)
				expect(second.toString()).toBe('second text string')

				const third = lexer.nextToken()
				expect(third.type).toBe(TokenType.eof)
			})

			it('parse multiple string tokens with white space between followed by an EOF token', function (): void {
				const lexer = makeLexer(
					' "first text string" "second text string" '
				)

				const first = lexer.nextToken()
				expect(first.type).toBe(TokenType.string)
				expect(first.toString()).toBe('first text string')

				const second = lexer.nextToken()
				expect(second.type).toBe(TokenType.string)
				expect(second.toString()).toBe('second text string')

				const third = lexer.nextToken()
				expect(third.type).toBe(TokenType.eof)
			})

			it('throws an error when the end of a string cannot be found', function (): void {
				const lexer = makeLexer('"some text')
				expect((): void => {
					lexer.nextToken()
				}).toThrow()
			})

			it('parse a string with an escaped double quotation', function (): void {
				const token = makeLexer('"some text\\""').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('some text"')
			})

			it('parse a string with an escaped back slash', function (): void {
				const token = makeLexer('"some text\\\\"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('some text\\')
			})

			it('parse a unicode character', function (): void {
				const token = makeLexer('"Hell\\u00D3"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('HellÓ')
			})

			it('parse a line break', function (): void {
				const token = makeLexer('"Hell\\b"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell\b')
			})

			it('parse a form feed', function (): void {
				const token = makeLexer('"Hell\\f"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell\f')
			})

			it('parse a tab', function (): void {
				const token = makeLexer('"Hell\\t"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell\t')
			})

			it('parse a back tick', function (): void {
				const token = makeLexer('"Hell`"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell`')
			})

			it('parse a new line', function (): void {
				const token = makeLexer('"Hell\\no"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell\no')
			})

			it('parse a carriage return', function (): void {
				const token = makeLexer('"Hell\\r"').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('Hell\r')
			})

			it('parses an empty string', function (): void {
				const token = makeLexer('""').nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe('')
			})

			it('parse many special characters in a sentance', function (): void {
				const token = makeLexer(
					'"Hell\\u00D3 there. This\\nis lots of \\t func\\n"'
				).nextToken()
				expect(token.type).toBe(TokenType.string)
				expect(token.toString()).toBe(
					'HellÓ there. This\nis lots of \t func\n'
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('""(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // string

		describe('uri', function (): void {
			it('parse a uri', function (): void {
				const token = makeLexer('`/foo/bag`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('/foo/bag')
			})

			it('parse an empty uri', function (): void {
				const token = makeLexer('``').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('')
			})

			it('parse a unicode character', function (): void {
				const token = makeLexer('`Hell\\u00D3`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('HellÓ')
			})

			it('throws an error for a missing tick', function (): void {
				expect((): void => {
					makeLexer('`/foo/bag').nextToken()
				}).toThrow()
			})

			it('parse a string with an escaped tick', function (): void {
				const token = makeLexer('`some text\\``').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('some text\\`')
			})

			it('parse a string with an escaped back slash', function (): void {
				const token = makeLexer('`some text\\\\`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('some text\\\\')
			})

			it('parse back slash colon', function (): void {
				const token = makeLexer('`\\:`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\:')
			})

			it('parse back slash forward slash', function (): void {
				const token = makeLexer('`\\/`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\/')
			})

			it('parse back slash question mark', function (): void {
				const token = makeLexer('`\\?`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\?')
			})

			it('parse back slash hash', function (): void {
				const token = makeLexer('`\\#`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\#')
			})

			it('parse back slash left square bracket', function (): void {
				const token = makeLexer('`\\[`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\[')
			})

			it('parse back slash right square bracket', function (): void {
				const token = makeLexer('`\\]`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\]')
			})

			it('parse back slash at', function (): void {
				const token = makeLexer('`\\@`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\@')
			})

			it('parse back slash ampersand', function (): void {
				const token = makeLexer('`\\&`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\&')
			})

			it('parse back slash equals', function (): void {
				const token = makeLexer('`\\=`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\=')
			})

			it('parse back slash semi-colon', function (): void {
				const token = makeLexer('`\\;`').nextToken()
				expect(token.type).toBe(TokenType.uri)
				expect(token.toString()).toBe('\\;')
			})

			it('parse multiple uris', function (): void {
				const lexer = makeLexer('`/foo/bag` `/this/that`')

				const token0 = lexer.nextToken()
				expect(token0.type).toBe(TokenType.uri)
				expect(token0.toString()).toBe('/foo/bag')

				const token1 = lexer.nextToken()
				expect(token1.type).toBe(TokenType.uri)
				expect(token1.toString()).toBe('/this/that')
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('`h`(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // uri

		describe('ref', function (): void {
			it('parse ref', function (): void {
				const token = makeLexer('@test').nextToken()
				expect(token.type).toBe(TokenType.ref)
				expect(token.toString()).toBe('@test')
			})

			it('parse ref with all characters', function (): void {
				const token = makeLexer(
					'@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:-.~'
				).nextToken()
				expect(token.type).toBe(TokenType.ref)
				expect(token.toString()).toBe(
					'@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:-.~'
				)
			})

			it('parse mutiplie refs', function (): void {
				const lexer = makeLexer('@test @foo')

				const token0 = lexer.nextToken()
				expect(token0.type).toBe(TokenType.ref)
				expect(token0.toString()).toBe('@test')

				const token1 = lexer.nextToken()
				expect(token1.type).toBe(TokenType.ref)
				expect(token1.toString()).toBe('@foo')
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('@a(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})

			it('throws an error for an empty ref', function (): void {
				expect((): void => {
					makeLexer('@(').nextToken()
				}).toThrow()
			})
		}) // ref

		describe('def', function (): void {
			it('parse def', function (): void {
				const token = makeLexer('^test').nextToken()
				expect(token.type).toBe(TokenType.symbol)
				expect(token.toString()).toBe('test')
			})

			it('parse mutiplie refs', function (): void {
				const lexer = makeLexer('^test ^foo')

				const token0 = lexer.nextToken()
				expect(token0.type).toBe(TokenType.symbol)
				expect(token0.toString()).toBe('test')

				const token1 = lexer.nextToken()
				expect(token1.type).toBe(TokenType.symbol)
				expect(token1.toString()).toBe('foo')
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('^a(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})

			it('throws an error for an empty def', function (): void {
				expect((): void => {
					makeLexer('^(').nextToken()
				}).toThrow()
			})
		}) // def

		describe('numberDateTime', function (): void {
			describe('number', function (): void {
				function toTokenValue(numStr: string): TokenValue {
					return makeLexer(numStr).nextToken() as TokenValue
				}

				it('returns a token for 1', function (): void {
					expect(makeLexer('1').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 1', function (): void {
					expect(toTokenValue('1').value.valueOf()).toBe(1)
				})

				it('returns a number token for 11', function (): void {
					expect(makeLexer('11').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 11', function (): void {
					expect(toTokenValue('11').value.valueOf()).toBe(11)
				})

				it('returns a number token for -11', function (): void {
					expect(makeLexer('-11').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns -11', function (): void {
					expect(toTokenValue('-11').value.valueOf()).toBe(-11)
				})

				it('returns a number token for -45.78', function (): void {
					expect(makeLexer('-45.78').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns -45.78', function (): void {
					expect(toTokenValue('-45.78').value.valueOf()).toBe(-45.78)
				})

				it('returns a number token for 10.34E10', function (): void {
					expect(makeLexer('10.34E10').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 10.34E10', function (): void {
					expect(toTokenValue('10.34E10').value.valueOf()).toBe(
						10.34e10
					)
				})

				it('returns a number token for 10.34e10', function (): void {
					expect(makeLexer('10.34e10').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 10.34e10', function (): void {
					expect(toTokenValue('10.34e10').value.valueOf()).toBe(
						10.34e10
					)
				})

				it('returns a number token for 10.34e-10', function (): void {
					expect(makeLexer('10.34e-10').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 10.34e-10', function (): void {
					expect(toTokenValue('10.34e-10').value.valueOf()).toBe(
						10.34e-10
					)
				})

				it('returns a number token for 10.34e+10', function (): void {
					expect(makeLexer('10.34e-10').nextToken().type).toBe(
						TokenType.number
					)
				})

				it('returns 10.34e+10', function (): void {
					expect(toTokenValue('10.34e+10').value.valueOf()).toBe(
						10.34e10
					)
				})

				it('returns a number token for 10_000', function (): void {
					const token = makeLexer('10_000').nextToken()
					expect(token.type).toBe(TokenType.number)
					expect(token.toFilter()).toBe('10000')
				})

				it('returns a 10000 for 10_000', function (): void {
					expect(toTokenValue('10_000').value.valueOf()).toBe(10000)
				})

				it('returns multiple number tokens', function (): void {
					const lexer = makeLexer('-45.45 3445.24E10 1')

					const first = lexer.nextToken() as TokenValue
					expect(first.type).toBe(TokenType.number)
					expect(first.value.valueOf()).toBe(-45.45)

					const second = lexer.nextToken() as TokenValue
					expect(second.type).toBe(TokenType.number)
					expect(second.value.valueOf()).toBe(3445.24e10)

					const third = lexer.nextToken() as TokenValue
					expect(third.type).toBe(TokenType.number)
					expect(third.value.valueOf()).toBe(1)

					const fourth = lexer.nextToken() as TokenValue
					expect(fourth.type).toBe(TokenType.eof)
				})

				it('throws an error for an invalid number', function (): void {
					expect((): void => {
						makeLexer('-E23.34').nextToken()
					}).toThrow()
				})

				it('advances to next token', function (): void {
					const lexer = makeLexer('1(')
					lexer.nextToken()
					expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
				})

				describe('parse units', function (): void {
					it('into token meta data', function (): void {
						const num = toTokenValue('30cm').value as HNum
						expect(num.unit?.symbol).toBe('cm')
					})

					it('and value from number with units', function (): void {
						const num = toTokenValue('30cm').value as HNum
						expect(num.valueOf()).toBe(30)
					})

					it('into token meta data with all characters', function (): void {
						const num = toTokenValue(
							'30abcdefghijklmnopqrstuvwxyzABSDEFGHIJKLMNOPQRSTUVWXYZ_$%/'
						).value as HNum
						expect(num.unit?.symbol).toBe(
							'abcdefghijklmnopqrstuvwxyzABSDEFGHIJKLMNOPQRSTUVWXYZ_$%/'
						)
					})

					it('from multiple tokens', function (): void {
						const lexer = makeLexer('1cm 2m')

						const token0 = lexer.nextToken() as TokenValue
						const value0 = token0.value as HNum

						expect(value0.valueOf()).toBe(1)
						expect(value0.unit?.symbol).toBe('cm')

						const token1 = lexer.nextToken() as TokenValue
						const value1 = token1.value as HNum

						expect(value1.valueOf()).toBe(2)
						expect(value1.unit?.symbol).toBe('m')
					})
				})
			}) // number

			describe('date', function (): void {
				it('parse a date', function (): void {
					const token = makeLexer('2008-12-05').nextToken()
					expect(token.type).toBe(TokenType.date)
					expect(token.toFilter()).toBe('2008-12-05')
				})

				it('parse multiple dates', function (): void {
					const lexer = makeLexer('2008-12-05 2009-11-06')

					const token0 = lexer.nextToken()
					expect(token0.type).toBe(TokenType.date)
					expect(token0.toFilter()).toBe('2008-12-05')

					const token1 = lexer.nextToken()
					expect(token1.type).toBe(TokenType.date)
					expect(token1.toFilter()).toBe('2009-11-06')
				})
			}) // date

			describe('time', function (): void {
				it('parses a time with milliseconds', function (): void {
					const token = makeLexer('09:23:45.123').nextToken()
					expect(token.type).toBe(TokenType.time)
					expect(token.toString()).toBe('09:23:45.123')
				})

				it('parses a time with seconds', function (): void {
					const token = makeLexer('09:23:45').nextToken()
					expect(token.type).toBe(TokenType.time)
					expect(token.toString()).toBe('09:23:45')
				})

				it('adds missing seconds', function (): void {
					const token = makeLexer('09:23').nextToken()
					expect(token.type).toBe(TokenType.time)
					expect(token.toString()).toBe('09:23:00')
				})

				it('adds extra zero if missing', function (): void {
					const token = makeLexer('9:23:45').nextToken()
					expect(token.type).toBe(TokenType.time)
					expect(token.toString()).toBe('09:23:45')
				})

				it('parse multiple times', function (): void {
					const lexer = makeLexer('09:23:45.123 11:36:32.321')

					const token0 = lexer.nextToken()
					expect(token0.type).toBe(TokenType.time)
					expect(token0.toString()).toBe('09:23:45.123')

					const token1 = lexer.nextToken()
					expect(token1.type).toBe(TokenType.time)
					expect(token1.toString()).toBe('11:36:32.321')
				})
			}) // time

			describe('date time', function (): void {
				it('throws an error when a date time is attempted to be used in a filter', function (): void {
					expect((): void => {
						makeLexer('2009-11-09T15:39:00Z').nextToken()
					}).toThrow()
				})
			}) // date time
		}) // numberDateTime

		describe('text', function (): void {
			it('returns a text token for foo', function (): void {
				expect(makeLexer('foo').nextToken().type).toBe(TokenType.text)
			})

			it('returns foo', function (): void {
				expect(makeLexer('foo').nextToken().toString()).toBe('foo')
			})

			it('returns a text token for aR5_', function (): void {
				expect(makeLexer('aR5_').nextToken().type).toBe(TokenType.text)
			})

			it('returns aR5_', function (): void {
				expect(makeLexer('aR5_').nextToken().toString()).toBe('aR5_')
			})

			it('returns multiple tokens', function (): void {
				const lexer = makeLexer('abc d2ef g')

				const first = lexer.nextToken()
				expect(first.type).toBe(TokenType.text)
				expect(first.toString()).toBe('abc')

				const second = lexer.nextToken()
				expect(second.type).toBe(TokenType.text)
				expect(second.toString()).toBe('d2ef')

				const third = lexer.nextToken()
				expect(third.type).toBe(TokenType.text)
				expect(third.toString()).toBe('g')

				const fourth = lexer.nextToken()
				expect(fourth.type).toBe(TokenType.eof)
			})

			it('throws an error for invalid text that starts with a capital letter', function (): void {
				expect((): void => {
					makeLexer('Foo').nextToken()
				}).toThrow()
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('a(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // text

		describe('paths', function (): void {
			it('parses a path token', function (): void {
				expect(makeLexer('foo->boo').nextToken().type).toBe(
					TokenType.paths
				)
			})

			it('parses a path token with two paths', function (): void {
				const token = makeLexer('foo->boo').nextToken() as TokenPaths
				expect(token.paths).toEqual(['foo', 'boo'])
			})

			it('parses a path token with three paths', function (): void {
				const token = makeLexer(
					'foo->boo->goo'
				).nextToken() as TokenPaths
				expect(token.paths).toEqual(['foo', 'boo', 'goo'])
			})

			it('parses a path token with four paths', function (): void {
				const token = makeLexer(
					'foo->boo->goo->coo'
				).nextToken() as TokenPaths
				expect(token.paths).toEqual(['foo', 'boo', 'goo', 'coo'])
			})

			it('throws an error when there is no path after a dereference operator', function (): void {
				expect((): void => {
					makeLexer('foo->').nextToken()
				}).toThrow()
			})

			it('throws an error when there is no path after a dereference operator followed by another token', function (): void {
				expect((): void => {
					makeLexer('foo-> somethingElse').nextToken()
				}).toThrow()
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('foo->boo(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // paths

		describe('left brace', function (): void {
			it('returns a left brace token', function (): void {
				expect(makeLexer('(').nextToken().type).toBe(
					TokenType.leftBrace
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('()')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.rightBrace)
			})
		}) // left brace

		describe('right brace', function (): void {
			it('returns a right brace token', function (): void {
				expect(makeLexer(')').nextToken().type).toBe(
					TokenType.rightBrace
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer(')(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // right brace

		describe('parentheses', function (): void {
			it('parses path and number within parentheses', function (): void {
				const lexer = makeLexer('(test == 1)')

				expect(TokenType[lexer.nextToken().type]).toBe(
					TokenType[TokenType.leftBrace]
				)

				const test = lexer.nextToken()
				expect(test.type).toBe(TokenType.text)
				expect(test.toString()).toBe('test')

				expect(TokenType[lexer.nextToken().type]).toBe(
					TokenType[TokenType.equals]
				)

				const value = lexer.nextToken()
				expect(value.type).toBe(TokenType.number)
				expect(value.toString()).toBe('1')

				expect(TokenType[lexer.nextToken().type]).toBe(
					TokenType[TokenType.rightBrace]
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('()==')
				lexer.nextToken()
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.equals)
			})
		})

		describe('equals', function (): void {
			it('returns an equals token', function (): void {
				expect(makeLexer('==').nextToken().type).toBe(TokenType.equals)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('==(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // equals

		describe('not equals', function (): void {
			it('returns a not equals token', function (): void {
				expect(makeLexer('!=').nextToken().type).toBe(
					TokenType.notEquals
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('!=(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // not equals

		describe('less than', function (): void {
			it('returns a less than token', function (): void {
				expect(makeLexer('<').nextToken().type).toBe(TokenType.lessThan)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('<(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // less than

		describe('less than or equal', function (): void {
			it('returns a less than or equal token', function (): void {
				expect(makeLexer('<=').nextToken().type).toBe(
					TokenType.lessThanOrEqual
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('<=(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // less than or equal

		describe('greater than', function (): void {
			it('returns a greater than token', function (): void {
				expect(makeLexer('>').nextToken().type).toBe(
					TokenType.greaterThan
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('>(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // greater than

		describe('greater than or equal', function (): void {
			it('returns a greater than or equal token', function (): void {
				expect(makeLexer('>=').nextToken().type).toBe(
					TokenType.greaterThanOrEqual
				)
			})

			it('advances to next token', function (): void {
				const lexer = makeLexer('>=(')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.leftBrace)
			})
		}) // greater than or equal

		describe('relationship', function (): void {
			it('returns a relationship token', function (): void {
				const lexer = makeLexer('inputs?')
				expect(lexer.nextToken().type).toBe(TokenType.rel)
			})

			it('advances to the next token after a relationship', function (): void {
				const lexer = makeLexer('inputs? @ahu')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.ref)
			})

			it('parses a relationship name', function (): void {
				const lexer = makeLexer('inputs?')
				const token = lexer.nextToken() as TokenRelationship
				expect(token.relationship).toBe('inputs')
			})

			it('parses a relationship term', function (): void {
				const lexer = makeLexer('inputs-air?')
				const token = lexer.nextToken() as TokenRelationship
				expect(token.relationship).toBe('inputs')
				expect(token.term).toBe('air')
			})

			it('advances to the next token after a relationship and term', function (): void {
				const lexer = makeLexer('inputs-air? @ahu')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.ref)
			})

			it('parses a conjunct relationship term', function (): void {
				const lexer = makeLexer('inputs-air-output?')
				const token = lexer.nextToken() as TokenRelationship
				expect(token.relationship).toBe('inputs')
				expect(token.term).toBe('air-output')
			})

			it('advances to the next token after a relationship and conjunct term', function (): void {
				const lexer = makeLexer('inputs-air-output? @ahu')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.ref)
			})
		}) // relationship

		describe('wildcard', function (): void {
			it('returns a wildcard token', function (): void {
				const lexer = makeLexer('*==')
				expect(lexer.nextToken().type).toBe(TokenType.wildcardEq)
			})

			it('advances to the next token after a wildcard', function (): void {
				const lexer = makeLexer('*== @foo')
				lexer.nextToken()
				expect(lexer.nextToken().type).toBe(TokenType.ref)
			})
		}) // wildcard
	}) // #nextToken()
}) // FilterLexer

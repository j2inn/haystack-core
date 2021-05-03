/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { Scanner } from '../../src/util/Scanner'

describe('Scanner', function (): void {
	let scanner: Scanner

	beforeEach(function (): void {
		scanner = new Scanner('abc')
	})

	describe('#current', function (): void {
		it('returns the current character', function (): void {
			expect(scanner.current).toBe('a')
		})
	}) // #current

	describe('#next', function (): void {
		it('returns the next character', function (): void {
			expect(scanner.next).toBe('b')
		})
	}) // #next

	describe('#index', function (): void {
		it('returns the current index number', function (): void {
			expect(scanner.index).toBe(0)
		})
	}) // #index

	describe('#consume()', function (): void {
		describe('advances one place', function (): void {
			beforeEach(function (): void {
				scanner.consume()
			})

			it('to the next current character', function (): void {
				expect(scanner.current).toBe('b')
			})

			it('to the next next character', function (): void {
				expect(scanner.next).toBe('c')
			})

			it('to the next index', function (): void {
				expect(scanner.index).toBe(1)
			})
		})

		describe('advances two places', function (): void {
			beforeEach(function (): void {
				scanner.consume()
				scanner.consume()
			})

			it('to the next current character', function (): void {
				expect(scanner.current).toBe('c')
			})

			it('to the next next character', function (): void {
				expect(scanner.next).toBe(null)
			})

			it('to the next index', function (): void {
				expect(scanner.index).toBe(2)
			})
		})

		describe('advances three places', function (): void {
			beforeEach(function (): void {
				scanner.consume()
				scanner.consume()
				scanner.consume()
			})

			it('to the next current character', function (): void {
				expect(scanner.current).toBe(null)
			})

			it('to the next next character', function (): void {
				expect(scanner.next).toBe(null)
			})

			it('to the next index', function (): void {
				expect(scanner.index).toBe(3)
			})
		})
	}) // #consume()

	describe('#is()', function (): void {
		it('returns true for a character that matches', function (): void {
			expect(scanner.is('a')).toBe(true)
		})

		it("returns false when a character doesn't match", function (): void {
			expect(scanner.is('x')).toBe(false)
		})

		it("returns false for null does doesn't match", function (): void {
			expect(scanner.is(null)).toBe(false)
		})
	}) //#is()

	describe('#isEof()', function (): void {
		it('returns false when not at the end', function (): void {
			expect(scanner.isEof()).toBe(false)
		})

		it('returns true when at the end', function (): void {
			scanner.consume()
			scanner.consume()
			scanner.consume()
			expect(scanner.isEof()).toBe(true)
		})
	}) // #isEof()

	describe('#consumeSpacesAndTabs()', function (): void {
		it('consumes spaces', function (): void {
			scanner = new Scanner('  a')
			scanner.consumeSpacesAndTabs()
			expect(scanner.current).toBe('a')
		})

		it('consumes tabs', function (): void {
			scanner = new Scanner('		a')
			scanner.consumeSpacesAndTabs()
			expect(scanner.current).toBe('a')
		})

		it('consumes spaces and tabs', function (): void {
			scanner = new Scanner('	 a')
			scanner.consumeSpacesAndTabs()
			expect(scanner.current).toBe('a')
		})
	}) // #consumeSpacesAndTabs()

	describe('#isSpaceOrTab()', function (): void {
		it('returns true for a space', function (): void {
			expect(new Scanner(' ').isSpaceOrTab()).toBe(true)
		})

		it('returns true for a tab', function (): void {
			expect(new Scanner('	').isSpaceOrTab()).toBe(true)
		})

		it('returns false for a', function (): void {
			expect(new Scanner('a').isSpaceOrTab()).toBe(false)
		})
	}) // #isSpaceOrTab()

	describe('.isSpaceOrTab()', function (): void {
		it('returns true for a space', function (): void {
			expect(Scanner.isSpaceOrTab(' ')).toBe(true)
		})

		it('returns true for a tab', function (): void {
			expect(Scanner.isSpaceOrTab('	')).toBe(true)
		})

		it('returns false for a', function (): void {
			expect(Scanner.isSpaceOrTab('a')).toBe(false)
		})
	}) // .isSpaceOrTab()

	describe('#consumeWhiteSpace()', function (): void {
		it('consumes white space', function (): void {
			scanner = new Scanner('	 \t\r\na')
			scanner.consumeWhiteSpace()
			expect(scanner.current).toBe('a')
		})
	}) // #consumeWhiteSpace()

	describe('#isNewLine()', function (): void {
		it('returns true for new line', function (): void {
			scanner = new Scanner('\n')
			expect(scanner.isNewLine()).toBe(true)
		})

		it('returns true for carriage return', function (): void {
			scanner = new Scanner('\r')
			expect(scanner.isNewLine()).toBe(true)
		})

		it('returns false when not a new line', function (): void {
			expect(scanner.isNewLine()).toBe(false)
		})
	}) // #isNewLine()

	describe('#isLetter()', function (): void {
		it('returns true for a letter', function (): void {
			expect(scanner.isLetter()).toBe(true)
		})

		it('returns false for a number', function (): void {
			scanner = new Scanner('0')
			expect(scanner.isLetter()).toBe(false)
		})
	}) // #isLetter()

	describe('.isLetter()', function (): void {
		it('returns true for a letter', function (): void {
			expect(Scanner.isLetter('a')).toBe(true)
		})

		it('returns false for a number', function (): void {
			expect(Scanner.isLetter('0')).toBe(false)
		})
	}) // .isLetter()

	describe('#isDigit()', function (): void {
		it('returns false for a letter', function (): void {
			expect(scanner.isDigit()).toBe(false)
		})

		it('returns true for a number', function (): void {
			scanner = new Scanner('0')
			expect(scanner.isDigit()).toBe(true)
		})
	}) // #isDigit()

	describe('.isDigit()', function (): void {
		it('returns false for a letter', function (): void {
			expect(Scanner.isDigit('a')).toBe(false)
		})

		it('returns true for a number', function (): void {
			expect(Scanner.isDigit('0')).toBe(true)
		})
	}) // .isDigit()

	describe('#isWhiteSpace()', function (): void {
		it('returns true for a white space', function (): void {
			scanner = new Scanner(' ')
			expect(scanner.isWhiteSpace()).toBe(true)
		})

		it('returns true for a tab', function (): void {
			scanner = new Scanner('	')
			expect(scanner.isWhiteSpace()).toBe(true)
		})

		it('returns false for a letter', function (): void {
			expect(scanner.isWhiteSpace()).toBe(false)
		})
	}) // #isWhiteSpace()

	describe('.isWhiteSpace()', function (): void {
		it('returns true for a white space', function (): void {
			expect(Scanner.isWhiteSpace(' ')).toBe(true)
		})

		it('returns false for a number', function (): void {
			expect(Scanner.isWhiteSpace('0')).toBe(false)
		})
	}) // .isWhiteSpace()

	describe('#isHex()', function (): void {
		it('returns true for a hex character', function (): void {
			expect(scanner.isHex()).toBe(true)
		})

		it('returns false for a non-hex character', function (): void {
			scanner = new Scanner('G')
			expect(scanner.isHex()).toBe(false)
		})
	}) // #isHex()

	describe('.isHex()', function (): void {
		it('returns true for a hex character', function (): void {
			expect(Scanner.isHex('0')).toBe(true)
		})

		it('returns false for a non-hex character', function (): void {
			expect(Scanner.isHex('G')).toBe(false)
		})
	}) // .isHex()

	describe('#isUpperCase()', function (): void {
		it('returns true for an upper case character', function (): void {
			scanner = new Scanner('A')
			expect(scanner.isUpperCase()).toBe(true)
		})

		it('returns false for a lower case character', function (): void {
			expect(scanner.isUpperCase()).toBe(false)
		})
	}) // #isUpperCase()

	describe('.isUpperCase()', function (): void {
		it('returns true for an upper case character', function (): void {
			expect(Scanner.isUpperCase('A')).toBe(true)
		})

		it('returns false for a lower case character', function (): void {
			expect(Scanner.isUpperCase('a')).toBe(false)
		})

		it('returns false for null', function (): void {
			expect(Scanner.isUpperCase(null)).toBe(false)
		})
	}) // .isUpperCase()

	describe('#isLowerCase()', function (): void {
		it('returns false for an lower case character', function (): void {
			scanner = new Scanner('A')
			expect(scanner.isLowerCase()).toBe(false)
		})

		it('returns true for a lower case character', function (): void {
			expect(scanner.isLowerCase()).toBe(true)
		})
	}) // #isLowerCase()

	describe('.isLowerCase()', function (): void {
		it('returns false for an upper case character', function (): void {
			expect(Scanner.isLowerCase('A')).toBe(false)
		})

		it('returns true for a lower case character', function (): void {
			expect(Scanner.isLowerCase('a')).toBe(true)
		})

		it('returns false for null', function (): void {
			expect(Scanner.isLowerCase(null)).toBe(false)
		})
	}) // .isLowerCase()

	describe('#expect()', function (): void {
		it('does not throw an error if the characters match', function (): void {
			expect((): void => {
				new Scanner('c').expect('c', 'id')
			}).not.toThrow()
		})

		it('throws an error if the characters do not match', function (): void {
			expect((): void => {
				new Scanner('c').expect('d', 'id')
			}).toThrow()
		})
	}) // #expect()

	describe('#expectAndConsumeNewLine()', function (): void {
		it('consumes a new line character', function (): void {
			const scanner = new Scanner('\na')
			expect(scanner.expectAndConsumeNewLine('test').current).toBe('a')
		})

		it('consumes a CR and new line character', function (): void {
			const scanner = new Scanner('\r\na')
			expect(scanner.expectAndConsumeNewLine('test').current).toBe('a')
		})

		it('throws an error when no new line', function (): void {
			expect((): void => {
				scanner.expectAndConsumeNewLine('test')
			}).toThrow()
		})
	}) // #expectAndConsumeNewLine()
})

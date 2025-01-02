/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HFilterBuilder } from '../../src/filter/HFilterBuilder'
import { HFilter } from '../../src/filter/HFilter'
import { HNum } from '../../src/core/HNum'
import { HSymbol } from '../../src/core/HSymbol'
import { HRef } from '../../src/core/HRef'

describe('HFilterBuilder', function (): void {
	let builder: HFilterBuilder

	beforeEach(function (): void {
		builder = new HFilterBuilder()
	})

	describe('#has()', function (): void {
		it('tests to see if we have the `foo` tag', function (): void {
			expect(builder.has('foo').build()).toBe('foo')
		})

		it('tests to see if we have a path', function (): void {
			expect(builder.has(['foo', 'goo']).build()).toBe('foo->goo')
		})
	}) // #has()

	describe('#and()', function (): void {
		it('adds an `and` statement', function (): void {
			expect(builder.has('foo').and().has('goo').build()).toBe(
				'foo and goo'
			)
		})
	}) // #and()

	describe('#or()', function (): void {
		it('adds an `or` statement', function (): void {
			expect(builder.has('foo').or().has('goo').build()).toBe(
				'foo or goo'
			)
		})
	}) // #or()

	describe('#not()', function (): void {
		it('adds a `not` statement', function (): void {
			expect(builder.has('foo').and().not('goo').build()).toBe(
				'foo and not goo'
			)
		})
	}) // #not()

	describe('parenthesis', function (): void {
		it('adds start and end parenthesis', function (): void {
			expect(builder.startParens().has('foo').endParens().build()).toBe(
				'(foo)'
			)
		})
	}) // #parenthesis()

	describe('#equals()', function (): void {
		it('add equals comparison', function (): void {
			expect(builder.equals('foo', 'test').build()).toBe('foo == "test"')
		})
	}) // #equals()

	describe('#notEquals()', function (): void {
		it('add not equals comparison', function (): void {
			expect(builder.notEquals('foo', 'test').build()).toBe(
				'foo != "test"'
			)
		})
	}) // #notEquals()

	describe('#lessThan()', function (): void {
		it('add less than comparison', function (): void {
			expect(builder.lessThan('foo', 10).build()).toBe('foo < 10')
		})
	}) // #lessThan()

	describe('#lessThanEquals()', function (): void {
		it('add less equals comparison', function (): void {
			expect(builder.lessThanEquals('foo', 10).build()).toBe('foo <= 10')
		})
	}) // #lessThanEquals()

	describe('#greaterThan()', function (): void {
		it('add greater than comparison', function (): void {
			expect(builder.greaterThan('foo', 10).build()).toBe('foo > 10')
		})
	}) // #greaterThan()

	describe('#greaterThanEquals()', function (): void {
		it('add greater equals comparison', function (): void {
			expect(builder.greaterThanEquals('foo', 10).build()).toBe(
				'foo >= 10'
			)
		})
	}) // #greaterThanEquals()

	describe('values', function (): void {
		it('encodes a Date as an HDate', function (): void {
			expect(
				builder
					.equals('myDate', new Date('2020-05-22T11:34:24.890Z'))
					.build()
			).toBe('myDate == 2020-05-22')
		})
	}) // values

	describe('is', function (): void {
		it('encodes a string for an `is a` relationship', function (): void {
			expect(builder.is('foo').build()).toBe('^foo')
		})

		it('encodes a symbol for an `is a` relationship', function (): void {
			expect(builder.is(HSymbol.make('foo')).build()).toBe('^foo')
		})
	}) // is

	describe('relationship', function (): void {
		it('encodes a string name', function (): void {
			expect(builder.relationship('foo').build()).toBe('foo?')
		})

		it('encodes a symbol name', function (): void {
			expect(builder.relationship(HSymbol.make('foo')).build()).toBe(
				'foo?'
			)
		})

		it('encodes a string term', function (): void {
			expect(builder.relationship('inputs', 'air').build()).toBe(
				'inputs? ^air'
			)
		})

		it('encodes a symbol term', function (): void {
			expect(
				builder.relationship('inputs', HSymbol.make('air')).build()
			).toBe('inputs? ^air')
		})

		it('encodes a ref with a term', function (): void {
			expect(
				builder.relationship('inputs', 'air', HRef.make('foo')).build()
			).toBe('inputs? ^air @foo')
		})

		it('encodes a ref with no term', function (): void {
			expect(
				builder.relationship('inputs', '', HRef.make('foo')).build()
			).toBe('inputs? @foo')
		})
	}) // relationship

	describe('#build()', function (): void {
		it('builds a haystack filter', function (): void {
			expect(
				builder
					.has('foo')
					.and()
					.has('goo')
					.and()
					.equals('curVal', HNum.make(23, 'cm'))
					.build()
			).toBe('foo and goo and curVal == 23cm')
		})

		it('throws an exception for an invalid filter', function (): void {
			expect((): void => {
				builder.startParens().has('foo').and().build()
			}).toThrow()
		})
	}) // #build()

	describe('.isHFilterBuilder()', function (): void {
		it('returns true if the value is an instance of a filter builder', function (): void {
			expect(HFilterBuilder.isHFilterBuilder(builder)).toBe(true)
		})

		it('returns false if the value is not an instance of a filter builder', function (): void {
			expect(HFilterBuilder.isHFilterBuilder('notAnHFilterBuilder')).toBe(
				false
			)
		})
	}) // .isHFilterBuilder()

	describe('#isEmpty()', function (): void {
		it('returns true if the builder is empty', function (): void {
			expect(builder.isEmpty()).toBe(true)
		})

		it('returns false if the builder is not empty', function (): void {
			expect(builder.has('site').isEmpty()).toBe(false)
		})
	}) // #isEmpty()

	describe('#internalBuffer', function (): void {
		it('returns the internal buffer', function (): void {
			expect(builder.has('site').internalBuffer).toBe('site')
		})
	}) // #internalBuffer

	describe('#filter()', function (): void {
		it('adds a filter string', function (): void {
			expect(builder.filter('site').build()).toBe('site')
		})

		it('adds a filter node', function (): void {
			expect(builder.filter(HFilter.parse('site')).build()).toBe('site')
		})

		it('adds an HFilter', function (): void {
			expect(builder.filter(new HFilter('site')).build()).toBe('site')
		})

		it('adds an HFilterBuilder', function (): void {
			expect(
				builder.filter(new HFilterBuilder().has('site')).build()
			).toBe('site')
		})
	}) // #filter()
})

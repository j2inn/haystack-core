/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HFilter } from '../../src/filter/HFilter'
import { GenerateHaystackFilterImpliedVisitor } from '../../src/filter/GenerateHaystackFilterImpliedVisitor'
import { readFile } from '../core/file'
import { TrioReader } from '../../src/core/TrioReader'
import { HNamespace } from '../../src/core/HNamespace'
import { HDict } from '../../src/core/HDict'
import { HSymbol } from '../../src/core/HSymbol'
import { HList } from '../../src/core/HList'

describe('GenerateHaystackFilterImpliedVisitor', function (): void {
	let impliedTag: HDict
	let namespace: HNamespace

	beforeEach(function (): void {
		let trio = readFile('./defs.trio')
		trio += `
---
def:^lib:impliedTest
doc:Implied tag lib experiment
is:[^lib]
lib:^lib:impliedTest
version:"3.9.10"
---
def: ^impliedBy
is: [^association]
tagOn: ^def
lib:^lib:impliedTest
---
def:^impliedTag
doc: "An implied tag"
is:[^entity]
lib:^lib:impliedTest
impliedBy: [^site]
---`.trim()

		const grid = new TrioReader(trio).readGrid()

		namespace = new HNamespace(grid)
		impliedTag = namespace.byName('impliedTag') as HDict
	})

	function parseAndGenerate(filter: string): string {
		const visitor = new GenerateHaystackFilterImpliedVisitor(namespace)
		HFilter.parse(filter).accept(visitor)
		return visitor.filter
	}

	describe('#visitHas()', function (): void {
		it('does not convert anything', function (): void {
			expect(parseAndGenerate('site')).toBe('site')
		})

		it('converts a has from one tag to another', function (): void {
			expect(parseAndGenerate('impliedTag')).toBe('(impliedTag or site)')
		})

		it('converts a has from two tags to another', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag')).toBe(
				'(impliedTag or (site and zone))'
			)
		})

		it('converts a has with a path and one tag', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(parseAndGenerate('impliedTag->id')).toBe(
				'(impliedTag->id or siteRef->id)'
			)
		})

		it('converts a has with a path and two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(parseAndGenerate('impliedTag->id')).toBe(
				'(impliedTag->id or (siteRef->id and zone))'
			)
		})

		it('converts two layers of implied tags', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(parseAndGenerate('impliedTag->impliedTag->id')).toBe(
				'((impliedTag->impliedTag->id or siteRef->impliedTag->id) or impliedTag->siteRef->id)'
			)
		})

		it('converts two layers of implied tags with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(parseAndGenerate('impliedTag->impliedTag->id')).toBe(
				'((impliedTag->impliedTag->id or (siteRef->impliedTag->id and zone)) or (impliedTag->siteRef->id and impliedTag->zone))'
			)
		})
	}) // #visitHas()

	describe('#visitMissing()', function (): void {
		it('does not convert anything', function (): void {
			expect(parseAndGenerate('not site')).toBe('not site')
		})

		it('converts a not from one tag to another', function (): void {
			expect(parseAndGenerate('not impliedTag')).toBe(
				'(not impliedTag or not site)'
			)
		})

		it('converts a not from two tags to another', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('not impliedTag')).toBe(
				'(not impliedTag or (not site and not zone))'
			)
		})

		it('converts a not with a path and one tag', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(parseAndGenerate('not impliedTag->id')).toBe(
				'(not impliedTag->id or not siteRef->id)'
			)
		})

		it('converts a not with a path and two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(parseAndGenerate('not impliedTag->id')).toBe(
				'(not impliedTag->id or (not siteRef->id and not zone))'
			)
		})

		it('converts two layers of implied tags', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(parseAndGenerate('not impliedTag->impliedTag->id')).toBe(
				'((not impliedTag->impliedTag->id or not siteRef->impliedTag->id) or not impliedTag->siteRef->id)'
			)
		})

		it('converts two layers of implied tags with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(parseAndGenerate('not impliedTag->impliedTag->id')).toBe(
				'((not impliedTag->impliedTag->id or (not siteRef->impliedTag->id and not zone)) or (not impliedTag->siteRef->id and not impliedTag->zone))'
			)
		})
	}) // #visitMissing()

	describe('#visitCmp()', function (): void {
		it('does not convert anything', function (): void {
			expect(parseAndGenerate('site == "test"')).toBe('site == "test"')
		})

		it('creates a value comparison with one tag', function (): void {
			expect(parseAndGenerate('impliedTag == "foo"')).toBe(
				'(impliedTag == "foo" or site == "foo")'
			)
		})

		it('converts a value comparsion with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag == "test"')).toBe(
				'(impliedTag == "test" or (site == "test" and zone))'
			)
		})

		it('converts a value comparison with a path and one tag', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(parseAndGenerate('impliedTag->id == "test"')).toBe(
				'(impliedTag->id == "test" or siteRef->id == "test")'
			)
		})

		it('converts a value comparison with a path and two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(parseAndGenerate('impliedTag->id == "test"')).toBe(
				'(impliedTag->id == "test" or (siteRef->id == "test" and zone))'
			)
		})

		it('converts a value comparison with two layers of implied tags', function (): void {
			impliedTag.set('impliedBy', new HList(HSymbol.make('siteRef')))

			expect(
				parseAndGenerate('impliedTag->impliedTag->id == "test"')
			).toBe(
				'((impliedTag->impliedTag->id == "test" or siteRef->impliedTag->id == "test") or impliedTag->siteRef->id == "test")'
			)
		})

		it('converts a value comparison with two layers of implied tags with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('siteRef'), HSymbol.make('zone')])
			)

			expect(
				parseAndGenerate('impliedTag->impliedTag->id == "test"')
			).toBe(
				'((impliedTag->impliedTag->id == "test" or (siteRef->impliedTag->id == "test" and zone)) or (impliedTag->siteRef->id == "test" and impliedTag->zone))'
			)
		})
	}) // #visitCmp()

	describe('#visitIsA()', function (): void {
		it('converts an `is a` query into a implied has', function (): void {
			expect(parseAndGenerate('^impliedTag')).toBe(
				'(^impliedTag or (impliedTag or site))'
			)
		})

		it('converts an `is a` query in a large has query', function (): void {
			expect(parseAndGenerate('^geoPlace')).toBe(
				'(^geoPlace or (geoPlace or site or weatherStation))'
			)
		})
	}) // #visitIsA()

	describe('#visitRelationship()', function (): void {
		it('does not convert anything', function (): void {
			expect(parseAndGenerate('containedBy?')).toBe('containedBy?')
		})

		it('does not convert anything with a ref', function (): void {
			expect(parseAndGenerate('containedBy? @foo')).toBe(
				'containedBy? @foo'
			)
		})

		it('creates a relationship query with one tag', function (): void {
			expect(parseAndGenerate('impliedTag?')).toBe(
				'(impliedTag? or site?)'
			)
		})

		it('creates a relationship query with one tag, a ref and a term', function (): void {
			expect(parseAndGenerate('impliedTag-elec? @foo')).toBe(
				'(impliedTag-elec? @foo or site-elec? @foo)'
			)
		})

		it('creates a relationship query with one tag and a ref', function (): void {
			expect(parseAndGenerate('impliedTag? @foo')).toBe(
				'(impliedTag? @foo or site? @foo)'
			)
		})

		it('converts a relationship query with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag?')).toBe(
				'(impliedTag? or (site? and zone))'
			)
		})

		it('converts a relationship query with two tags and a ref', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag? @foo')).toBe(
				'(impliedTag? @foo or (site? @foo and zone))'
			)
		})

		it('converts a relationship query with two tags, a ref and a term', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag-elec? @foo')).toBe(
				'(impliedTag-elec? @foo or (site-elec? @foo and zone))'
			)
		})
	}) // #visitRelationship()

	describe('#visitWildcardEquals()', function (): void {
		it('does not convert anything', function (): void {
			expect(parseAndGenerate('site *== @test')).toBe('site *== @test')
		})

		it('creates a wildcard equals with one tag', function (): void {
			expect(parseAndGenerate('impliedTag *== @foo')).toBe(
				'(impliedTag *== @foo or site *== @foo)'
			)
		})

		it('converts a value comparsion with two tags', function (): void {
			impliedTag.set(
				'impliedBy',
				new HList([HSymbol.make('site'), HSymbol.make('zone')])
			)
			expect(parseAndGenerate('impliedTag *== @test')).toBe(
				'(impliedTag *== @test or (site *== @test and zone))'
			)
		})
	}) // #visitWildcardEquals()
}) // GenerateHaystackFilterImpliedVisitor

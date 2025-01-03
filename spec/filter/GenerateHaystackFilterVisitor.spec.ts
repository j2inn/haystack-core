/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HFilter } from '../../src/filter/HFilter'
import { GenerateHaystackFilterVisitor } from '../../src/filter/GenerateHaystackFilterVisitor'

describe('GenerateHaystackFilterVisitor', function (): void {
	function parseAndGenerate(filter: string): string {
		const visitor = new GenerateHaystackFilterVisitor()
		HFilter.parse(filter).accept(visitor)
		return visitor.filter
	}

	it('parses a valid query', function (): void {
		const filter =
			'site and foo or goo and not true and (test == true and test != false and ' +
			'test > 34.52 and test < -1 and (test == 1.34342) and test <= 1 and test == "some string" ' +
			'and test == @foo and test == `/foo` and test->foo < 1 and ^foo and inputs? and inputs? ^elec and inputs? ^air-output @foo and site *== @foo)'
		expect(parseAndGenerate(filter)).toBe(filter)
	})

	it('ensure white space is removed from valid query', function (): void {
		const filter = '    test      and   foo       '
		expect(parseAndGenerate(filter)).toBe('test and foo')
	})

	it('throws an error for an invalid query', function (): void {
		expect((): void => {
			parseAndGenerate('test ==')
		}).toThrow()
	})
}) // GenerateHaystackFilterVisitor

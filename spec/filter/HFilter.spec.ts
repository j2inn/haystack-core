/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { EvalContext } from '../../src/filter/EvalContext'
import { HFilter } from '../../src/filter/HFilter'
import { HStr } from '../../src/core/HStr'
import { HBool } from '../../src/core/HBool'
import { HDict } from '../../src/core/HDict'

describe('HFilter', function (): void {
	let haystackFilter: HFilter

	const input = 'site and foo == "boo"'

	beforeEach(function (): void {
		haystackFilter = new HFilter(input)
	})

	describe('constructor', function (): void {
		it('throws an exception for an empty site filter', function (): void {
			expect((): void => {
				new HFilter('')
			}).toThrow()
		})

		it('throws an exception for an invalid site filter', function (): void {
			expect((): void => {
				new HFilter('site and')
			}).toThrow()
		})
	})

	describe('#eval()', function (): void {
		let site: HDict
		let context: EvalContext

		beforeEach(function (): void {
			site = HDict.make()

			site.set('site', HBool.make(true))
			site.set('foo', HStr.make('boo'))

			context = {
				dict: site,
			}
		})

		it('returns true for a matching site filter', function (): void {
			expect(haystackFilter.eval(context)).toBe(true)
		})

		it('returns false for a site filter that does not match', function (): void {
			site.set('foo', HStr.make('something else'))
			expect(haystackFilter.eval(context)).toBe(false)
		})
	}) // #eval()

	describe('#toFilter()', function (): void {
		it('returns a haystack filter', function (): void {
			expect(haystackFilter.toFilter()).toBe(input)
		})
	}) // #toFilter()
}) // HFilter

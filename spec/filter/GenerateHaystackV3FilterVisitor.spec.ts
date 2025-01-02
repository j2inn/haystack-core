/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HFilter } from '../../src/filter/HFilter'
import { GenerateHaystackFilterV3Visitor } from '../../src/filter/GenerateHaystackFilterV3Visitor'
import { readFile } from '../core/file'
import { TrioReader } from '../../src/core/TrioReader'
import { HNamespace } from '../../src/core/HNamespace'

describe('GenerateHaystackFilterV3Visitor', function (): void {
	function parseAndGenerate(filter: string): GenerateHaystackFilterV3Visitor {
		const grid = new TrioReader(readFile('./defs.trio')).readGrid()
		const namespace = new HNamespace(grid)

		const visitor = new GenerateHaystackFilterV3Visitor(namespace)
		HFilter.parse(filter).accept(visitor)
		return visitor
	}

	describe('#visitIsA()', function (): void {
		it('convert an `is a` query into its subtypes', function (): void {
			const filter =
				'((air and output) or airHandlingEquip or ahu or doas or mau or rtu or fcu' +
				' or crac or unitVent or heatPump or airTerminalUnit or cav or vav)'

			expect(parseAndGenerate('^air-output').filter).toBe(filter)
		})
	}) // #visitIsA()

	describe('#visitRelationship()', function (): void {
		it('convert an inputs into its refs', function (): void {
			const filter =
				'(airRef or blowdownWaterRef or chilledWaterRef or condensateRef or condenserWaterRef ' +
				'or domesticWaterRef or elecRef or fuelOilRef or gasolineRef or hotWaterRef or makeupWaterRef' +
				' or naturalGasRef or refrigRef or steamRef)'

			const visitor = parseAndGenerate('inputs?')
			expect(visitor.filter).toBe(filter)
			expect(visitor.requery).toBe(false)
		})

		it('convert an inputs electricity into its ref', function (): void {
			const filter = 'elecRef'
			const visitor = parseAndGenerate('inputs? ^elec')
			expect(visitor.filter).toBe(filter)
			expect(visitor.requery).toBe(false)
		})

		it('convert an inputs liquid into its refs', function (): void {
			const filter =
				'(blowdownWaterRef or chilledWaterRef or condensateRef or' +
				' condenserWaterRef or domesticWaterRef or fuelOilRef or gasolineRef ' +
				'or hotWaterRef or makeupWaterRef)'

			const visitor = parseAndGenerate('inputs? ^liquid')
			expect(visitor.filter).toBe(filter)
			expect(visitor.requery).toBe(false)
		})

		it('convert an inputs with a ref into its refs that requires a requery', function (): void {
			const filter =
				'(airRef or blowdownWaterRef or chilledWaterRef or condensateRef or condenserWaterRef ' +
				'or domesticWaterRef or elecRef or fuelOilRef or gasolineRef or hotWaterRef or makeupWaterRef' +
				' or naturalGasRef or refrigRef or steamRef)'

			const visitor = parseAndGenerate('inputs? @foo')
			expect(visitor.filter).toBe(filter)
			expect(visitor.requery).toBe(true)
		})
	}) // #visitRelationship()

	describe('#visitWildcardEquals()', function (): void {
		it('creates a long dereferenced path statement', function (): void {
			const filter =
				'(equipRef == @ahu or equipRef->equipRef == @ahu or equipRef->equipRef->equipRef == @ahu' +
				' or equipRef->equipRef->equipRef->equipRef == @ahu or equipRef->equipRef->equipRef->equipRef->equipRef == @ahu' +
				' or equipRef->equipRef->equipRef->equipRef->equipRef->equipRef == @ahu or ' +
				'equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef == @ahu or ' +
				'equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef == @ahu ' +
				'or equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef ' +
				'== @ahu or equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef->equipRef == @ahu)'

			const visitor = parseAndGenerate('equipRef *== @ahu')
			expect(visitor.filter).toBe(filter)
		})
	}) // #visitWildcardEquals()
}) // GenerateHaystackFilterV3Visitor

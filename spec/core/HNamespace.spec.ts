/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HNamespace, Reflection } from '../../src/core/HNamespace'
import { HGrid } from '../../src/core/HGrid'
import { HDict } from '../../src/core/HDict'
import { HSymbol } from '../../src/core/HSymbol'
import { ZincReader } from '../../src/core/ZincReader'
import { HRef } from '../../src/core/HRef'
import { HStr } from '../../src/core/HStr'
import { HList } from '../../src/core/HList'
import { HMarker } from '../../src/core/HMarker'
import { HNum } from '../../src/core/HNum'
import { Kind } from '../../src/core/Kind'
import '../../src/core/Array'
import '../matchers'
import '../customMatchers'
import { makeProjectHaystackNormalizer } from '../readDefs'
import { valueIsKind } from '../../src/core/HVal'

describe('HNamespace', function (): void {
	let defs: HNamespace
	let origGrid: HGrid

	beforeAll(async () => {
		const { normalizer } = await makeProjectHaystackNormalizer()
		const ns = await normalizer.normalize()
		origGrid = ns.grid
	})

	beforeEach(() => {
		defs = new HNamespace(origGrid.newCopy())
	})

	describe('.defaultNamespace', function (): void {
		afterEach(function (): void {
			HNamespace.defaultNamespace = new HNamespace(HGrid.make({}))
		})

		it('returns a default empty namespace', function (): void {
			expect(HNamespace.defaultNamespace.grid.length).toBe(0)
		})

		it('sets a default namespace', function (): void {
			HNamespace.defaultNamespace = defs
			expect(HNamespace.defaultNamespace.grid).toBe(defs.grid)
		})
	}) // .defaultNamespace

	describe('#byName()', function (): void {
		it('returns a def using a name', function (): void {
			expect(defs.byName('ahu') instanceof HDict).toBe(true)
		})

		it('returns a def using a symbol', function (): void {
			expect(defs.byName(HSymbol.make('ahu')) instanceof HDict).toBe(true)
		})

		it('returns undefined when the def is not found', function (): void {
			expect(defs.byName('foobar')).toBeUndefined()
		})
	}) // #byName()

	describe('#get()', function (): void {
		it('returns a def using a name', function (): void {
			expect(defs.get('ahu') instanceof HDict).toBe(true)
		})

		it('returns a def using a symbol', function (): void {
			expect(defs.get(HSymbol.make('ahu')) instanceof HDict).toBe(true)
		})

		it('returns undefined when the def is not found', function (): void {
			expect(defs.get('foobar')).toBeUndefined()
		})
	}) // #get()

	describe('#byAllNames()', function (): void {
		it('return an array of defs via the names', function (): void {
			expect(defs.byAllNames('ahu', 'site')).toEqual(
				defs.byAllNames('ahu', 'site')
			)
		})

		it('return an array of defs via the names as symbols', function (): void {
			expect(
				defs.byAllNames(HSymbol.make('ahu'), HSymbol.make('site'))
			).toEqual(defs.byAllNames('ahu', 'site'))
		})

		it('return an array of defs via an array of names', function (): void {
			expect(defs.byAllNames(['ahu', 'site'])).toEqual(
				defs.byAllNames('ahu', 'site')
			)
		})

		it('return an array of defs via an array of names as symbols', function (): void {
			expect(
				defs.byAllNames([HSymbol.make('ahu'), HSymbol.make('site')])
			).toEqual(defs.byAllNames('ahu', 'site'))
		})

		it('throws an error when a def cannot be found', function (): void {
			expect((): void => {
				defs.byAllNames('foobar')
			}).toThrow()
		})
	}) // #byAllNames()

	describe('#hasName()', function (): void {
		it('returns true if the def exists', function (): void {
			expect(defs.hasName('ahu')).toBe(true)
		})

		it('returns true if the def exists via a symbol', function (): void {
			expect(defs.hasName(HSymbol.make('ahu'))).toBe(true)
		})

		it('returns false if the def does not exist', function (): void {
			expect(defs.hasName('foobar')).toBe(false)
		})
	}) // #hasName()

	describe('#has()', function (): void {
		it('returns true if the def exists', function (): void {
			expect(defs.has('ahu')).toBe(true)
		})

		it('returns true if the def exists via a symbol', function (): void {
			expect(defs.has(HSymbol.make('ahu'))).toBe(true)
		})

		it('returns false if the def does not exist', function (): void {
			expect(defs.has('foobar')).toBe(false)
		})
	}) // #has()

	describe('#conjuncts', function (): void {
		it('returns an array of conjunct defs', function (): void {
			const conjuncts = defs.conjuncts

			expect(conjuncts.length).toBeGreaterThan(0)

			for (const def of conjuncts) {
				const name = String(def.get('def'))
				expect(name.indexOf('-')).toBeGreaterThan(-1)
			}
		})
	}) // #conjuncts

	describe('.isConjunct()', function (): void {
		it('returns true if the name is a conjunct', function (): void {
			expect(HNamespace.isConjunct('hot-water')).toBe(true)
		})

		it('returns true if the name as a symbol is a conjunct', function (): void {
			expect(HNamespace.isConjunct(HSymbol.make('hot-water'))).toBe(true)
		})

		it('returns false if the name is not a conjunct', function (): void {
			expect(HNamespace.isConjunct('water')).toBe(false)
		})

		it('returns false if the name as a symbol is not a conjunct', function (): void {
			expect(HNamespace.isConjunct(HSymbol.make('water'))).toBe(false)
		})
	}) // .isConjunct()

	describe('.splitConjunct()', function (): void {
		it('split a conjunct into its names for a string', function (): void {
			expect(HNamespace.splitConjunct('hot-water')).toEqual([
				'hot',
				'water',
			])
		})

		it('split a conjunct into its names for a symbol', function (): void {
			expect(HNamespace.splitConjunct(HSymbol.make('hot-water'))).toEqual(
				['hot', 'water']
			)
		})
	}) // .splitConjunct()

	describe('#conjunctDefs()', function (): void {
		it('returns a conjuncts defs', function (): void {
			expect(defs.conjunctDefs('hot-water')).toEqual(
				defs.byAllNames('hot', 'water')
			)
		})

		it('throws an error if the conjunct contains an invalid def', function (): void {
			expect((): void => {
				defs.conjunctDefs('hot-potato')
			}).toThrow()
		})
	}) // #conjunctDefs()

	describe('#features', function (): void {
		it('returns an array of features defs', function (): void {
			const features = defs.features

			expect(features.length).toBeGreaterThan(0)

			for (const def of features) {
				const name = String(def.get('def'))
				expect(name.indexOf(':')).toBeGreaterThan(-1)
			}
		})
	}) // #features

	describe('.isFeature()', function (): void {
		it('returns true if the name is a feature', function (): void {
			expect(HNamespace.isFeature('feature:key')).toBe(true)
		})

		it('returns true if the name is a feature', function (): void {
			expect(HNamespace.isFeature(HSymbol.make('feature:key'))).toBe(true)
		})

		it('returns false if the name is not a feature', function (): void {
			expect(HNamespace.isFeature(HSymbol.make('water'))).toBe(false)
		})
	}) // .isFeature()

	describe('.getFeature()', function (): void {
		it('returns the feature name for a string', function (): void {
			expect(HNamespace.getFeature('lib:ph')).toBe('lib')
		})

		it('returns the feature name for a symbol', function (): void {
			expect(HNamespace.getFeature(HSymbol.make('lib:ph'))).toBe('lib')
		})

		it('returns an empty string when not a feature', function (): void {
			expect(HNamespace.getFeature(HSymbol.make('foo'))).toBe('')
		})
	}) // .getFeature()

	describe('.getFeatureName()', function (): void {
		it('returns the feature name for a string', function (): void {
			expect(HNamespace.getFeatureName('lib:ph')).toBe('ph')
		})

		it('returns the feature name for a symbol', function (): void {
			expect(HNamespace.getFeatureName(HSymbol.make('lib:ph'))).toBe('ph')
		})

		it('returns an empty string when not a feature', function (): void {
			expect(HNamespace.getFeatureName(HSymbol.make('foo'))).toBe('')
		})
	}) // .getFeatureName()

	describe('#libs', function (): void {
		it('returns a list of lib defs', function (): void {
			expect(defs.libs).toEqual(
				defs.byAllNames(
					'lib:ph',
					'lib:phScience',
					'lib:phIoT',
					'lib:phIct'
				)
			)
		})
	}) // #libs

	describe('#subTypesOf()', function (): void {
		it('returns the subtypes of a def using a name', function (): void {
			expect(defs.subTypesOf('liquid')).toEqual(
				defs.byAllNames(
					'water',
					'condensate',
					'diesel',
					'fuelOil',
					'gasoline'
				)
			)
		})

		it('returns the subtypes of a def using a symbol', function (): void {
			expect(defs.subTypesOf(HSymbol.make('liquid'))).toEqual(
				defs.byAllNames(
					'water',
					'condensate',
					'diesel',
					'fuelOil',
					'gasoline'
				)
			)
		})

		it('returns an empty array when there are no subtypes using a name', function (): void {
			expect(defs.subTypesOf('blowdown-water')).toEqual([])
		})

		it('returns an empty array when there are no subtypes using a symbols', function (): void {
			expect(defs.subTypesOf(HSymbol.make('blowdown-water'))).toEqual([])
		})

		it('returns an empty array for an invalid def using a name', function (): void {
			expect(defs.subTypesOf('foobar')).toEqual([])
		})

		it('returns an empty array for an invalid def using a symbol', function (): void {
			expect(defs.subTypesOf(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #subTypesOf()

	describe('#allSubTypesOf()', function (): void {
		it('returns the subtypes of `point`', function (): void {
			expect(defs.allSubTypesOf('point')).toEqual(
				defs.byAllNames(
					'cur-point',
					'his-point',
					'writable-point',
					'synthetic-point',
					'sim-point',
					'computed-point',
					'ml-point',
					'weather-point'
				)
			)
		})
	}) // #allSubTypesOf()

	describe('#hasSubType()', function (): void {
		it('returns true if a def has a subtype for a name', function (): void {
			expect(defs.hasSubTypes('liquid')).toBe(true)
		})

		it('returns true if a def has a subtype for a symbol', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('liquid'))).toBe(true)
		})

		it('returns false if a def does not have a subtype for a name', function (): void {
			expect(defs.hasSubTypes('hot-water')).toBe(false)
		})

		it('returns false if a def does not have a subtype for a symbol', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('hot-water'))).toBe(false)
		})

		it('returns false if the def does not exist for a name', function (): void {
			expect(defs.hasSubTypes('foobar')).toBe(false)
		})

		it('returns false if the def does not exist for a name', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('foobar'))).toBe(false)
		})
	}) // #hasSubType()

	describe('#superTypesOf()', function (): void {
		it('returns an array of supertypes using a name', function (): void {
			expect(defs.superTypesOf('site')).toEqual(
				defs.byAllNames('entity', 'geoPlace')
			)
		})

		it('returns an array of supertypes using a symbol', function (): void {
			expect(defs.superTypesOf('site')).toEqual(
				defs.byAllNames(
					HSymbol.make('entity'),
					HSymbol.make('geoPlace')
				)
			)
		})
	}) // #superTypesOf()

	describe('#allSuperTypesOf()', function (): void {
		it('returns an flattened array of supertypes using a name', function (): void {
			expect(defs.allSuperTypesOf('site')).toEqual(
				defs.byAllNames('entity', 'marker', 'geoPlace')
			)
		})

		it('returns an flattened array of supertypes using a symbol', function (): void {
			expect(defs.allSuperTypesOf(HSymbol.make('site'))).toEqual(
				defs.byAllNames('entity', 'marker', 'geoPlace')
			)
		})
	}) // #allSuperTypesOf()

	describe('#choicesFor()', function (): void {
		it('returns the choices for a def using a name', function (): void {
			expect(defs.choicesFor('ductSection')).toEqual(
				defs.byAllNames(
					'discharge',
					'economizer',
					'inlet',
					'flue',
					'exhaust',
					'mixed',
					'outside',
					'return',
					'ventilation'
				)
			)
		})

		it('returns the choices for a def using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('ductSection'))).toEqual(
				defs.byAllNames(
					'discharge',
					'economizer',
					'inlet',
					'flue',
					'exhaust',
					'mixed',
					'outside',
					'return',
					'ventilation'
				)
			)
		})

		it('returns an empty array when there are no choices using a name', function (): void {
			expect(defs.choicesFor('exhaust')).toEqual([])
		})

		it('returns an empty array when there are no choices using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('exhaust'))).toEqual([])
		})

		it('returns an empty array when the def is invalid using a name', function (): void {
			expect(defs.choicesFor('foobar')).toEqual([])
		})

		it('returns an empty array when the def is invalid using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #choicesFor()

	describe('#choices', function (): void {
		it('returns all the choices in the namespace', function (): void {
			expect(Object.keys(defs.choices).sort()).toEqual([
				'ahuZoneDelivery',
				'airVolumeAdjustability',
				'atesDesign',
				'chillerMechanism',
				'condenserLoop',
				'coolingProcess',
				'ductConfig',
				'ductDeck',
				'ductSection',
				'heatingProcess',
				'meterScope',
				'pfScope',
				'phaseCount',
				'pipeFluid',
				'pipeSection',
				'plantLoop',
				'pointFunction',
				'pointQuantity',
				'pointSubject',
				'simScenario',
				'tankSubstance',
				'vavAirCircuit',
				'vavModulation',
			])
		})
	}) // #choices

	describe('#featureNames', function (): void {
		it('returns the feature names', function (): void {
			expect(defs.featureNames).toEqual(['filetype', 'lib', 'op'])
		})
	}) // #featureNames

	describe('#tagOnNames', function (): void {
		it('returns the feature names', function (): void {
			expect(defs.tagOnNames).toEqual([
				'def',
				'entity',
				'filetype',
				'geoPlace',
				'point',
				'lib',
				'site',
				'weatherStation',
				'airHandlingEquip',
				'ates',
				'chiller',
				'pipe',
				'valve-actuator',
				'pump-motor',
				'duct',
				'damper-actuator',
				'fan-motor',
				'airTerminalUnit',
				'chilled-water-plant',
				'ac-elec-meter',
				'motor',
				'equip',
				'controller',
				'evse-cable',
				'air-input',
				'blowdown-water-input',
				'condensate-input',
				'chilled-water-input',
				'condenser-water-input',
				'domestic-water-input',
				'elec-input',
				'fuelOil-input',
				'hot-water-input',
				'gasoline-input',
				'makeup-water-input',
				'naturalGas-input',
				'refrig-input',
				'steam-input',
				'meter',
				'cur-point',
				'his-point',
				'writable-point',
				'boiler',
				'chilledBeam',
				'heatingCoil',
				'radiator',
				'radiantFloor',
				'vav',
				'coolingCoil',
				'system',
				'space',
				'floor',
				'sim-point',
				'synthetic-point',
				'mlModel',
				'mlVar',
				'tank',
				'weather-point',
			])
		})
	}) // #tagOnNames

	describe('#tagOnIndices', function (): void {
		it('returns a list of names to tagOn defs', function (): void {
			expect(Object.keys(defs.tagOnIndices)).toEqual([
				'is',
				'tagOn',
				'id',
				'dis',
				'mime',
				'fileExt',
				'geoAddr',
				'geoCoord',
				'geoElevation',
				'geoStreet',
				'geoCity',
				'geoCounty',
				'geoPostalCode',
				'geoState',
				'geoCountry',
				'maxVal',
				'minVal',
				'of',
				'baseUri',
				'doc',
				'enum',
				'depends',
				'mandatory',
				'notInherited',
				'transient',
				'version',
				'wikipedia',
				'kind',
				'tz',
				'unit',
				'airVolumeAdjustability',
				'ahuZoneDelivery',
				'atesDesign',
				'coolingCapacity',
				'chillerMechanism',
				'pipeFluid',
				'pipeSection',
				'plantLoop',
				'ductSection',
				'ductDeck',
				'ductConfig',
				'condenserLoop',
				'phaseCount',
				'equipRef',
				'evseCableType',
				'airRef',
				'blowdownWaterRef',
				'condensateRef',
				'chilledWaterRef',
				'condenserWaterRef',
				'domesticWaterRef',
				'elecRef',
				'fuelOilRef',
				'hotWaterRef',
				'gasolineRef',
				'makeupWaterRef',
				'naturalGasRef',
				'refrigRef',
				'steamRef',
				'meterScope',
				'submeterOf',
				'cur',
				'his',
				'writable',
				'vfd',
				'pointSubject',
				'pointQuantity',
				'pointFunction',
				'curVal',
				'curStatus',
				'curErr',
				'hisMode',
				'hisTotalized',
				'hisStatus',
				'hisErr',
				'writeVal',
				'writeLevel',
				'writeStatus',
				'writeErr',
				'heatingProcess',
				'coolingProcess',
				'yearBuilt',
				'primaryFunction',
				'siteRef',
				'area',
				'floorNum',
				'spaceRef',
				'synthetic',
				'pointRef',
				'syntheticModelRef',
				'simScenario',
				'mlInputVarRefs',
				'mlOutputVarRef',
				'mlIdentificationPeriod',
				'mlModelParameters',
				'mlModelMetrics',
				'mlVarPoint',
				'mlVarFilter',
				'systemRef',
				'tankSubstance',
				'vavModulation',
				'vavAirCircuit',
				'weatherStationRef',
			])
		})
	}) // #tagOnIndices

	describe('#inheritance()', function (): void {
		it("returns a def's inheritance using a name", function (): void {
			expect(defs.inheritance('site')).toEqual(
				defs.byAllNames(['site', 'entity', 'marker', 'geoPlace'])
			)
		})

		it("returns a def's inheritance using a symbol", function (): void {
			expect(defs.inheritance(HSymbol.make('site'))).toEqual(
				defs.byAllNames(['site', 'entity', 'marker', 'geoPlace'])
			)
		})

		it('returns an empty array for an invalid def using a name', function (): void {
			expect(defs.inheritance('foobar')).toEqual([])
		})

		it('returns an empty array for an invalid def using a symbol', function (): void {
			expect(defs.inheritance(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #inheritance()

	describe('#associations()', function (): void {
		it('returns the associations for a equipRef using names', function (): void {
			expect(defs.associations('equipRef', 'tagOn')).toEqual(
				defs.byAllNames('equip', 'point', 'controller')
			)
		})

		it('returns the associations for a equipRef using symbols', function (): void {
			expect(
				defs.associations(
					HSymbol.make('equipRef'),
					HSymbol.make('tagOn')
				)
			).toEqual(defs.byAllNames('equip', 'point', 'controller'))
		})

		it('returns an empty array for an invalid parent using names', function (): void {
			expect(defs.associations('foobar', 'tagOn')).toEqual([])
		})

		it('returns an empty array for an invalid parent using symbols', function (): void {
			expect(
				defs.associations(HSymbol.make('foobar'), HSymbol.make('tagOn'))
			).toEqual([])
		})

		it('returns the associations for a site using names', function (): void {
			expect(defs.associations('site', 'tags')).toEqual(
				defs.byAllNames(
					'id',
					'dis',
					'geoAddr',
					'geoCoord',
					'geoElevation',
					'geoStreet',
					'geoCity',
					'geoCounty',
					'geoPostalCode',
					'geoState',
					'geoCountry',
					'tz',
					'yearBuilt',
					'primaryFunction',
					'area',
					'weatherStationRef'
				)
			)
		})
	}) // #associations()

	describe('#tags()', function (): void {
		it('returns the associations for a site', function (): void {
			expect(defs.tags('site')).toEqual(
				defs.byAllNames([
					'id',
					'dis',
					'geoAddr',
					'geoCoord',
					'geoElevation',
					'geoStreet',
					'geoCity',
					'geoCounty',
					'geoPostalCode',
					'geoState',
					'geoCountry',
					'tz',
					'yearBuilt',
					'primaryFunction',
					'area',
					'weatherStationRef',
				])
			)
		})
	}) // #tags()

	describe('#is()', function (): void {
		it('returns the `is` associations for a ac-elec', function (): void {
			expect(defs.is('ac-elec')).toEqual(defs.byAllNames('elec'))
		})
	}) // #is()

	describe('#tagOn()', function (): void {
		it('returns the `tagOn` associations for a equipRef', function (): void {
			expect(defs.tagOn('equipRef')).toEqual(
				defs.byAllNames('equip', 'point', 'controller')
			)
		})
	}) // #tagOn()

	describe('#reflect()', function (): void {
		describe('Reflection', function (): void {
			let subject: HDict
			let result: Reflection

			beforeEach(function (): void {
				// Take from reflection example https://project-haystack.dev/doc/docHaystack/Reflection
				subject = HDict.make({
					id: HRef.make('hwp'),
					dis: HStr.make('Hot Water Plant'),
					hot: HMarker.make(),
					water: HMarker.make(),
					plant: HMarker.make(),
					equip: HMarker.make(),
				})

				result = defs.reflect(subject)
			})

			describe('#defs', function (): void {
				it('computes the defs the subject implements', function (): void {
					expect(result.defs).toEqual(
						defs.byAllNames(
							'id',
							'ref',
							'scalar',
							'val',
							'dis',
							'str',
							'hot',
							'marker',
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'plant',
							'equip',
							'entity',
							'hot-water-plant',
							'hot-water-output',
							'output',
							'hot-water'
						)
					)
				})

				it('computes the `chilled-water` def from a dict with `chilled` and `water` marker tags', function (): void {
					const res = defs.reflect(
						HDict.make({
							chilled: HMarker.make(),
							water: HMarker.make(),
						})
					)

					expect(res.defs).toEqual(
						defs.byAllNames(
							'chilled',
							'marker',
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'chilled-water'
						)
					)
				})

				it('computes the `chilled-water` def from a dict with `water` and `chilled` marker tags', function (): void {
					const res = defs.reflect(
						HDict.make({
							water: HMarker.make(),
							chilled: HMarker.make(),
						})
					)

					expect(res.defs).toEqual(
						defs.byAllNames(
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'marker',
							'chilled',
							'chilled-water'
						)
					)
				})

				it('computes the correct conjucts of point', function (): void {
					const res = defs.reflect(
						HDict.make({
							weather: HMarker.make(),
							writable: HMarker.make(),
							cur: HMarker.make(),
							point: HMarker.make(),
							his: HMarker.make(),
							curVal: HNum.make(90),
							sensor: HMarker.make(),
							temp: HMarker.make(),
							discharge: HMarker.make(),
							air: HMarker.make(),
						})
					)
					expect(res.defs.map((d) => d.defName)).toEqual(
						expect.arrayContaining([
							'point',
							'cur-point',
							'his-point',
							'weather-point',
							'writable-point',
						])
					)
				})
			}) // #defs

			describe('#subject', function (): void {
				it('returns the original subject', function (): void {
					expect(result.subject).toBe(subject)
				})
			}) // #subject

			describe('#namespace', function (): void {
				it('returns the original namespace', function (): void {
					expect(result.namespace).toBe(defs)
				})
			}) // #namespace

			describe('#fits()', function (): void {
				it('returns true if the result fits the base', function (): void {
					expect(result.fits('equip')).toBe(true)
				})

				it('returns false if the result does not fit the base', function (): void {
					expect(result.fits('site')).toBe(false)
				})
			}) // #fits()

			describe('#toGrid()', function (): void {
				it('returns a grid from the result', function (): void {
					expect(result.toGrid().toJSON()).toEqual(
						HGrid.make({ rows: result.defs as HDict[] }).toJSON()
					)
				})
			}) // #toGrid()

			describe('#type', function (): void {
				it('returns the plant marker type', function (): void {
					expect(result.type.defName).toBe('hot-water-plant')
				})

				it('returns the ahu tag when there is an equip and ahu tag', function (): void {
					result = defs.reflect(
						HDict.make({
							equip: HMarker.make(),
							ahu: HMarker.make(),
						})
					)

					expect(result.type.defName).toBe('ahu')
				})

				it('returns the ahu tag when there is an ahu and equip tag', function (): void {
					result = defs.reflect(
						HDict.make({
							ahu: HMarker.make(),
							equip: HMarker.make(),
						})
					)

					expect(result.type.defName).toBe('ahu')
				})

				it('returns the coolingCoil tag from an entity with all sub type marker tags', function (): void {
					result = defs.reflect(
						HDict.make({
							heatExchanger: HMarker.make(),
							coil: HMarker.make(),
							equip: HMarker.make(),
							coolingCoil: HMarker.make(),
						})
					)

					expect(result.type.defName).toBe('coolingCoil')
				})
			}) // #type
		}) // Reflection
	}) // #reflect()

	describe('#defOfDict()', function (): void {
		it('returns the site marker type', function (): void {
			const subject = HDict.make({
				geoAddr: HMarker.make(),
				site: HMarker.make(),
				id: HMarker.make(),
			})

			expect(defs.defOfDict(subject).defName).toBe('site')
		})

		it('falls back to `dict` if an entity marker type cannot be found', function (): void {
			const subject = HDict.make({
				geoAddr: HMarker.make(),
				id: HMarker.make(),
			})

			expect(defs.defOfDict(subject)).toBe(defs.byName('dict'))
		})
	}) // #defOfDict()

	describe('#fits()', function (): void {
		it('returns true when site fits entity using a name', function (): void {
			expect(defs.fits('site', 'entity')).toBe(true)
		})

		it('returns true when a site fits marker using a name', function (): void {
			expect(defs.fits('site', 'marker')).toBe(true)
		})

		it('returns false when water does not fit entity using a name', function (): void {
			expect(defs.fits('water', 'entity')).toBe(false)
		})

		it('returns false when the def does not exist using a name', function (): void {
			expect(defs.fits('foobar', 'entity')).toBe(false)
		})

		it('returns false when the base does not exist using a name', function (): void {
			expect(defs.fits('site', 'foobar')).toBe(false)
		})

		it('returns true when site fits entity using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('entity'))
			).toBe(true)
		})

		it('returns true when a site fits marker using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('marker'))
			).toBe(true)
		})

		it('returns false when water does not fit entity using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('water'), HSymbol.make('entity'))
			).toBe(false)
		})

		it('returns false when the def does not exist using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('foobar'), HSymbol.make('entity'))
			).toBe(false)
		})

		it('returns false when the base does not exist using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('foobar'))
			).toBe(false)
		})
	}) // #fits()

	describe('#fitsMarker()', function (): void {
		it('returns true for site using a name', function (): void {
			expect(defs.fitsMarker('site')).toBe(true)
		})

		it('returns true for site using a symbol', function (): void {
			expect(defs.fitsMarker(HSymbol.make('site'))).toBe(true)
		})

		it('returns false for def using a name', function (): void {
			expect(defs.fitsMarker('def')).toBe(false)
		})

		it('returns false for def using a symbol', function (): void {
			expect(defs.fitsMarker(HSymbol.make('def'))).toBe(false)
		})
	}) // #fitsMarker()

	describe('#fitsVal()', function (): void {
		it('returns true for def using a name', function (): void {
			expect(defs.fitsVal('def')).toBe(true)
		})

		it('returns true for def using a symbol', function (): void {
			expect(defs.fitsVal(HSymbol.make('def'))).toBe(true)
		})

		it('returns false for site using a name', function (): void {
			expect(defs.fitsVal('site')).toBe(false)
		})

		it('returns false for site using a symbol', function (): void {
			expect(defs.fitsVal(HSymbol.make('site'))).toBe(false)
		})
	}) // #fitsVal()

	describe('#fitsChoice()', function (): void {
		it('returns true for ductSection using a name', function (): void {
			expect(defs.fitsChoice('ductSection')).toBe(true)
		})

		it('returns true for ductSection using a symbol', function (): void {
			expect(defs.fitsChoice(HSymbol.make('ductSection'))).toBe(true)
		})

		it('returns false for site using a name', function (): void {
			expect(defs.fitsChoice('site')).toBe(false)
		})

		it('returns false for site using a symbol', function (): void {
			expect(defs.fitsChoice(HSymbol.make('site'))).toBe(false)
		})
	}) // #fitsChoice()

	describe('#fitsEntity()', function (): void {
		it('returns true for site using a name', function (): void {
			expect(defs.fitsEntity('site')).toBe(true)
		})

		it('returns true for site using a symbol', function (): void {
			expect(defs.fitsEntity(HSymbol.make('site'))).toBe(true)
		})

		it('returns false for ductSection using a name', function (): void {
			expect(defs.fitsEntity('ductSection')).toBe(false)
		})

		it('returns false for ductSection using a symbol', function (): void {
			expect(defs.fitsEntity(HSymbol.make('ductSection'))).toBe(false)
		})
	}) // #fitsEntity()

	describe('#implementation()', function (): void {
		it('returns the implementation for a `tank`', function (): void {
			expect(defs.implementation('tank')).toEqual(
				defs.byAllNames('tank', 'equip')
			)
		})

		it('returns the implementation for a `tank` with extra compulsory tag', function (): void {
			defs.byName('dis')?.set('compulsory', HMarker.make())

			expect(defs.implementation('tank')).toEqual(
				defs.byAllNames('tank', 'equip', 'dis')
			)
		})

		it('returns the implementation for a `hot-water`', function (): void {
			expect(defs.implementation('hot-water')).toEqual(
				defs.byAllNames('hot', 'water')
			)
		})

		it('throws an error if the def is invalid', function (): void {
			expect((): void => {
				defs.implementation('potato')
			}).toThrow()
		})
	}) // #implementation()

	describe('#defToKind()', function (): void {
		it('returns dict kind for `dict`', function (): void {
			expect(defs.defToKind('dict')).toBe(Kind.Dict)
		})

		it('returns grid kind for `grid`', function (): void {
			expect(defs.defToKind('grid')).toBe(Kind.Grid)
		})

		it('returns list kind for `is`', function (): void {
			expect(defs.defToKind('is')).toBe(Kind.List)
		})

		it('returns bool kind for `bool`', function (): void {
			expect(defs.defToKind('bool')).toBe(Kind.Bool)
		})

		it('returns coord kind for `geoCoord`', function (): void {
			expect(defs.defToKind('geoCoord')).toBe(Kind.Coord)
		})

		it('returns undefined kind for `curVal`', function (): void {
			expect(defs.defToKind('curVal')).toBeUndefined()
		})

		it('returns date kind for `date`', function (): void {
			expect(defs.defToKind('date')).toBe(Kind.Date)
		})

		it('returns date time kind for `dateTime`', function (): void {
			expect(defs.defToKind('dateTime')).toBe(Kind.DateTime)
		})

		it('returns na kind for `na`', function (): void {
			expect(defs.defToKind('na')).toBe(Kind.NA)
		})

		it('returns number kind for `area`', function (): void {
			expect(defs.defToKind('area')).toBe(Kind.Number)
		})

		it('returns ref kind for `siteRef`', function (): void {
			expect(defs.defToKind('siteRef')).toBe(Kind.Ref)
		})

		it('returns string kind for `curStatus`', function (): void {
			expect(defs.defToKind('curStatus')).toBe(Kind.Str)
		})

		it('returns symbol kind for `def`', function (): void {
			expect(defs.defToKind('def')).toBe(Kind.Symbol)
		})

		it('returns time kind for `time`', function (): void {
			expect(defs.defToKind('time')).toBe(Kind.Time)
		})

		it('returns uri kind for `baseUri`', function (): void {
			expect(defs.defToKind('baseUri')).toBe(Kind.Uri)
		})

		it('returns undefined kind for `writeVal`', function (): void {
			expect(defs.defToKind('writeVal')).toBeUndefined()
		})

		it('returns xstr kind for `xstr`', function (): void {
			expect(defs.defToKind('xstr')).toBe(Kind.XStr)
		})
	}) // #defToKind()

	describe('protos', function (): void {
		function makeDicts(zinc: string[]): HList<HDict> {
			return zinc
				.map((z: string): HDict => ZincReader.readValue(z) as HDict)
				.toList() as HList<HDict>
		}

		// function printZinc(list: HList<HDict>): HList<HDict> {
		// 	console.log(list.map((dict: HDict): string => dict.toZinc()))
		// 	return list
		// }

		describe('#protos()', function (): void {
			it('returns a list of children for pipe and equip', function (): void {
				const parent = HDict.make({
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{pump motor equip}',
					'{valve actuator equip}',
					'{flow sensor point}',
					'{flow sp point}',
					'{pressure sensor point}',
					'{pressure sp point}',
					'{temp sensor point}',
					'{temp sp point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for steam, leaving, pipe and equip', function (): void {
				const parent = HDict.make({
					steam: HMarker.make(),
					leaving: HMarker.make(),
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{steam leaving pump motor equip}',
					'{steam leaving valve actuator equip}',
					'{steam leaving flow sensor point}',
					'{steam leaving flow sp point}',
					'{steam leaving pressure sensor point}',
					'{steam leaving pressure sp point}',
					'{steam leaving temp sensor point}',
					'{steam leaving temp sp point}',
					'{steam leaving equip}',
					'{steam leaving point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for leaving, naturalGas, pipe and equip', function (): void {
				const parent = HDict.make({
					leaving: HMarker.make(),
					naturalGas: HMarker.make(),
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{naturalGas leaving pump motor equip}',
					'{naturalGas leaving valve actuator equip}',
					'{naturalGas leaving flow sensor point}',
					'{naturalGas leaving flow sp point}',
					'{naturalGas leaving pressure sensor point}',
					'{naturalGas leaving pressure sp point}',
					'{naturalGas leaving temp sensor point}',
					'{naturalGas leaving temp sp point}',
					'{naturalGas leaving equip}',
					'{naturalGas leaving point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for ahu', function (): void {
				const parent = HDict.make({
					ahu: HMarker.make(),
				})

				const children = [
					'{thermostat equip}',
					'{discharge duct equip}',
					'{exhaust duct equip}',
					'{mixed duct equip}',
					'{outside duct equip}',
					'{ventilation duct equip}',
					'{economizer duct equip}',
					'{return duct equip}',
					'{humidifier equip}',
					'{hvacMode sp point}',
					'{cool cmd point}',
					'{heat cmd point}',
					'{filter sensor point}',
					'{freezeStat sensor point}',
					'{economizing cmd point}',
					'{heatWheel cmd point}',
					'{dessicantDehumidifier cmd point}',
					'{faceBypass cmd point}',
					'{bypass damper cmd point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for chiller', function (): void {
				const parent = HDict.make({
					chiller: HMarker.make(),
				})

				const children = [
					'{run cmd point}',
					'{enable cmd point}',
					'{run sensor point}',
					'{enable sensor point}',
					'{load cmd point}',
					'{load sensor point}',
					'{efficiency sensor point}',
					'{alarm sensor point}',
					'{chilled water leaving pipe equip}',
					'{chilled water entering pipe equip}',
					'{chilled water delta temp sensor point}',
					'{chilled water delta flow sensor point}',
					'{chilled water valve isolation cmd point}',
					'{condenser water leaving pipe equip}',
					'{condenser water entering pipe equip}',
					'{condenser water valve isolation cmd point}',
					'{condenser run cmd point}',
					'{condenser run sensor point}',
					'{condenser refrig temp sensor point}',
					'{condenser refrig pressure sensor point}',
					'{evaporator refrig temp sensor point}',
					'{evaporator refrig pressure sensor point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for chiller and ahu', function (): void {
				const parent = HDict.make({
					ahu: HMarker.make(),
					chiller: HMarker.make(),
				})

				const children = [
					'{thermostat equip}',
					'{discharge duct equip}',
					'{exhaust duct equip}',
					'{mixed duct equip}',
					'{outside duct equip}',
					'{ventilation duct equip}',
					'{economizer duct equip}',
					'{return duct equip}',
					'{humidifier equip}',
					'{hvacMode sp point}',
					'{cool cmd point}',
					'{heat cmd point}',
					'{filter sensor point}',
					'{freezeStat sensor point}',
					'{economizing cmd point}',
					'{heatWheel cmd point}',
					'{dessicantDehumidifier cmd point}',
					'{faceBypass cmd point}',
					'{bypass damper cmd point}',
					'{equip}',
					'{point}',
					'{run cmd point}',
					'{enable cmd point}',
					'{run sensor point}',
					'{enable sensor point}',
					'{load cmd point}',
					'{load sensor point}',
					'{efficiency sensor point}',
					'{alarm sensor point}',
					'{chilled water leaving pipe equip}',
					'{chilled water entering pipe equip}',
					'{chilled water delta temp sensor point}',
					'{chilled water delta flow sensor point}',
					'{chilled water valve isolation cmd point}',
					'{condenser water leaving pipe equip}',
					'{condenser water entering pipe equip}',
					'{condenser water valve isolation cmd point}',
					'{condenser run cmd point}',
					'{condenser run sensor point}',
					'{condenser refrig temp sensor point}',
					'{condenser refrig pressure sensor point}',
					'{evaporator refrig temp sensor point}',
					'{evaporator refrig pressure sensor point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns an empty array for an empty dict', function (): void {
				expect(defs.protos(HDict.make({}))).toEqual([])
			})

			it('removes duplicates dicts', function (): void {
				const parent = new HDict({
					space: HMarker.make(),
					site: HMarker.make(),
				})

				expect(
					defs.protos(parent).map((dict) => dict.toZinc())
				).toEqual(['{space}', '{equip}', '{point}'])
			})
		}) // #protos()
	}) // protos

	describe('#toGrid()', function (): void {
		it('returns a grid for the defs', function (): void {
			expect(valueIsKind<HGrid>(defs.toGrid(), Kind.Grid)).toBe(true)
		})
	}) // #toGrid()

	describe('#timezones()', function (): void {
		it('returns a list of timezones', function (): void {
			defs.grid.add(
				new HDict({
					def: 'tz',
					enum: 'Abidjan',
				})
			)

			const tz = defs.timezones[0]

			expect(tz?.value).toBe('Abidjan')
		})
	}) // #timezones()

	describe('#hasRelationship()', function (): void {
		it('returns true when a record has a `hotWaterRef`', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs hot water', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs liquid', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'liquid',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs water', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'water',
				})
			).toBe(true)
		})

		it('returns false when a record has a `hotWaterRef` and inputs air', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'air',
				})
			).toBe(false)
		})

		it('returns true when a record has a `hotWaterRef`, inputs hot water and matches the target value', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
					ref: HRef.make('ahu'),
				})
			).toBe(true)
		})

		it('returns false when a record has a `hotWaterRef`, inputs hot water and does not match the target value', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
					ref: HRef.make('vav'),
				})
			).toBe(false)
		})

		it('returns false when a record does not have any inputs', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
				})
			).toBe(false)
		})

		describe('transitive relationships', function (): void {
			let ahu: HDict
			let fan: HDict
			let status: HDict
			let map: Map<string, HDict>

			const resolve = (ref: HRef): HDict | undefined => map.get(ref.value)

			beforeEach(function (): void {
				map = new Map<string, HDict>()

				ahu = HDict.make({
					id: HRef.make('ahu'),
					ahu: HMarker.make(),
					equip: HMarker.make(),
				})

				map.set('ahu', ahu)

				fan = HDict.make({
					id: HRef.make('fan'),
					discharge: HMarker.make(),
					fan: HMarker.make(),
					equip: HMarker.make(),
					equipRef: HRef.make('ahu'),
				})

				map.set('fan', fan)

				status = HDict.make({
					id: HRef.make('status'),
					speed: HMarker.make(),
					cmd: HMarker.make(),
					point: HMarker.make(),
					equipRef: HRef.make('fan'),
				})

				map.set('status', status)
			})

			it('returns true for a fan that directly references an ahu', function (): void {
				expect(
					defs.hasRelationship({
						subject: fan,
						relName: 'containedBy',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns true for a point that directly references a fan', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('fan'),
						resolve,
					})
				).toBe(true)
			})

			it('returns true for a point that indirectly references an ahu', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns false for a fan that does not reference a point', function (): void {
				expect(
					defs.hasRelationship({
						subject: fan,
						relName: 'containedBy',
						ref: HRef.make('status'),
						resolve,
					})
				).toBe(false)
			})

			it('returns false for a point that references itself', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('status'),
						resolve,
					})
				).toBe(false)
			})
		}) // transitive relationships

		describe('reciprocal relationships', function (): void {
			let hwp: HDict
			let ahu: HDict
			let map: Map<string, HDict>

			const resolve = (ref: HRef): HDict | undefined => map.get(ref.value)

			beforeEach(function (): void {
				map = new Map<string, HDict>()

				// hot water plant entity
				// id: @hwp, hot, water, plant, equip
				hwp = HDict.make({
					id: HRef.make('hwp'),
					hot: HMarker.make(),
					water: HMarker.make(),
					plant: HMarker.make(),
					equip: HMarker.make(),
				})

				map.set('hwp', ahu)

				// AHU entity which inputs hot water from the plant above
				// id: @ahu, ahu, equip, hotWaterHeating, hotWaterRef: @hwp
				ahu = HDict.make({
					id: HRef.make('ahu'),
					ahu: HMarker.make(),
					equip: HMarker.make(),
					hotWaterHeating: HMarker.make(),
					hotWaterRef: HRef.make('hwp'),
				})

				map.set('fan', ahu)
			})

			it('return true when AHU inputs hot water from HWP', function (): void {
				expect(
					defs.hasRelationship({
						subject: ahu,
						relName: 'inputs',
						relTerm: 'hot-water',
						ref: HRef.make('hwp'),
						resolve,
					})
				).toBe(true)
			})

			it('return true when AHU outputs hot water', function (): void {
				expect(
					defs.hasRelationship({
						subject: ahu,
						relName: 'outputs',
						relTerm: 'hot-water',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns false when HWP outputs hot water', function (): void {
				expect(
					defs.hasRelationship({
						subject: hwp,
						relName: 'outputs',
						relTerm: 'hot-water',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(false)
			})
		}) // reciprocal relationships
	}) // #hasRelationship()

	describe('validation', function (): void {
		let dict: HDict

		beforeEach(function (): void {
			dict = new HDict({ ahu: HMarker.make(), equip: HMarker.make() })
		})

		describe('#validateAll()', function (): void {
			it("throws an error for a value that's not a dict", function (): void {
				expect(() => defs.validateAll({})).toThrow()
			})

			it('does not throw an error for a valid ahu record', function (): void {
				expect(() => defs.validateAll(dict)).not.toThrow()
			})

			it('does not throw an error for a record that has a tag that does not exist in the namespace', function (): void {
				dict.set('foobar', HMarker.make())
				expect(() => defs.validateAll(dict)).not.toThrow()
			})

			it('throws an error for an invalid dict', function (): void {
				dict.remove('equip')
				expect(() => defs.validateAll(dict)).toThrow(
					"Cannot find mandatory tag 'equip'"
				)
			})

			it('throws an error for a tag that has the wrong kind', function (): void {
				dict.set('site', HStr.make('wrong kind'))
				expect(() => defs.validateAll(dict)).toThrow(
					"Kind mismatch. 'site' is str not marker"
				)
			})
		}) // #validateAll()

		describe('#validate()', function (): void {
			it("throws an error for a value that's not a dict", function (): void {
				expect(() => defs.validate('ahu', {})).toThrow()
			})

			it('does not throw an error for a valid ahu record', function (): void {
				expect(() => defs.validate('ahu', dict)).not.toThrow()
			})

			it('does not throw an error for a valid record with a marker tag', function (): void {
				expect(() => defs.validate('marker', dict)).not.toThrow()
			})

			it('does not throw an error for a valid record with an entity tag', function (): void {
				expect(() => defs.validate('entity', dict)).not.toThrow()
			})

			it('does not throw an error for a valid ahu record using a symbol', function (): void {
				expect(() =>
					defs.validate(HSymbol.make('ahu'), dict)
				).not.toThrow()
			})

			it('does not throw an error for an ahu record that has a null tag', function (): void {
				dict.set('equip', null)
				expect(() => defs.validate('ahu', dict)).not.toThrow()
			})

			it('throws an error for a tag does not exist in the namespace', function (): void {
				expect(() => defs.validate('foobar', dict)).toThrow(
					"'foobar' does not fit dict"
				)
			})

			it('throws an error for a tag that does not exist in the dict', function (): void {
				dict.remove('ahu')
				expect(() => defs.validate('ahu', dict)).toThrow(
					"'ahu' does not fit dict"
				)
			})

			it('throws an an error when the kind cannot be found for a def', function (): void {
				jest.spyOn(defs, 'defToKind').mockReturnValue(undefined)
				expect(() => defs.validate('ahu', dict)).toThrow(
					"Cannot find kind for 'ahu'"
				)
			})

			it('throws an an error when a tag has the wrong kind', function (): void {
				dict.set('equip', 'a string')
				expect(() => defs.validate('ahu', dict)).toThrow(
					"Kind mismatch. 'equip' is str not marker"
				)
			})

			it('throws an error for a invalid ahu record with a missing mandatory tag', function (): void {
				dict.remove('equip')
				expect(() => defs.validate('ahu', dict)).toThrow(
					"Cannot find mandatory tag 'equip'"
				)
			})

			it('validates a conjunct', function (): void {
				expect(() =>
					defs.validate(
						'mobile-phone',
						new HDict({
							mobile: HMarker.make(),
							phone: HMarker.make(),
							device: HMarker.make(),
						})
					)
				).not.toThrow()
			})

			it('validates a marker tag', function (): void {
				expect(() =>
					defs.validate(
						'active',
						new HDict({
							active: HMarker.make(),
						})
					)
				).not.toThrow()
			})

			it('validates an airHandlingEquip for an ahu', function (): void {
				expect(() =>
					defs.validate('airHandlingEquip', dict)
				).not.toThrow()
			})

			describe('compulsory', function (): void {
				beforeEach(function (): void {
					defs.byName('dis')?.set('compulsory', HMarker.make())
				})

				it('throws an error for a invalid ahu record with missing compulsory tag', function (): void {
					expect(() => defs.validate('ahu', dict)).toThrow(
						"Cannot find compulsory tag 'dis'"
					)
				})

				it('throws an error for a invalid ahu record with a compulsory tag that has the wrong kind', function (): void {
					dict.set('dis', 42)
					expect(() => defs.validate('ahu', dict)).toThrow(
						"Kind mismatch. 'dis' is number not str"
					)
				})

				it('does not throw an error when a compulsory tag is present', function (): void {
					dict.set('dis', 'a display name')
					expect(() => defs.validate('ahu', dict)).not.toThrow()
				})
			}) // compulsory
		}) // #validate()

		describe('#isValid()', function (): void {
			it('returns true for a valid dict', function (): void {
				expect(defs.isValid('ahu', dict)).toBe(true)
			})

			it('returns true for a valid dict using a symbol', function (): void {
				expect(defs.isValid(HSymbol.make('ahu'), dict)).toBe(true)
			})

			it('returns false for an invalid dict', function (): void {
				dict.remove('equip')
				expect(defs.isValid('ahu', dict)).toBe(false)
			})
		}) // #isValid()
	}) // validation

	describe('#newDict()', function (): void {
		it('returns a dict with all of the implementation dicts added', function (): void {
			const tags = defs.newDict(['vav']).keys
			expect(tags).toEqual(['vav', 'equip'])
		})
	}) // #newDict()

	describe('#getContainmentRefs()', function (): void {
		it('returns a list of all the containment refs for a dict', function (): void {
			expect(
				defs
					.getContainmentRefs()
					.map((def) => def.defName)
					.sort()
			).toEqual(['equipRef', 'siteRef', 'spaceRef'])
		})
	}) // #getContainmentRefs()

	describe('#findContainmentRef()', function (): void {
		it('returns the containment ref for a def', function (): void {
			expect(defs.findContainmentRef('site')?.defName).toEqual('siteRef')
		})
	}) // #findContainmentRef()
})

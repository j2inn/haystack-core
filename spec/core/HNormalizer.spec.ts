/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HSymbol } from '../../src/core/HSymbol'
import { HUri } from '../../src/core/HUri'
import { HStr } from '../../src/core/HStr'
import { HDict } from '../../src/core/HDict'
import { HList } from '../../src/core/HList'
import { HMarker } from '../../src/core/HMarker'
import { HNamespace } from '../../src/core/HNamespace'
import { HNum } from '../../src/core/HNum'
import { HBool } from '../../src/core/HBool'
import { HGrid } from '../../src/core/HGrid'
import { Kind } from '../../src/core/Kind'
import { HVal, valueIsKind } from '../../src/core/HVal'
import {
	HNormalizer,
	HLib,
	HLibDict,
	HDefDict,
} from '../../src/core/HNormalizer'
import { NormalizationLogger } from '../../src/core/NormalizationLogger'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { makeValue } from '../../src/core/util'
import { makeProjectHaystackNormalizer } from './readDefs'

const readFile = promisify(fs.readFile)

function makeTestLib(): HLib {
	const lib = HDict.make({
		def: HSymbol.make('lib:test'),
		doc: HStr.make('Some documentation'),
		version: HStr.make('1.0.0'),
		baseUri: HUri.make('https://www.j2inn.com'),
		depends: HList.make<HSymbol>([
			HSymbol.make('lib:ph'),
			HSymbol.make('lib:phScience'),
			HSymbol.make('lib:phIoT'),
			HSymbol.make('lib:phIct'),
		]),
	}) as HLibDict

	return {
		name: 'lib:test',
		lib,
		dicts: [lib],
	}
}

describe('HNormalizer', function (): void {
	let normalizer: HNormalizer
	let libs: HLib[]
	let lib: HLib
	let logger: NormalizationLogger

	beforeEach(async function (): Promise<void> {
		;({ libs, logger, normalizer } = await makeProjectHaystackNormalizer())

		lib = makeTestLib()
		libs.push(lib)
	})

	function addDefs(...dicts: HDict[]): void {
		for (const dict of dicts) {
			lib.dicts.push(dict as HDefDict)
		}
	}

	describe('#normalize()', function (): void {
		describe('scan', function (): void {
			it('logs a warning if an invalid lib is found', async function (): Promise<void> {
				libs.push({} as HLib)
				await normalizer.normalize()

				expect(logger.warning).toHaveBeenCalled()
			})
		}) // scan

		describe('parse', function (): void {
			it('logs a warning if the dict is not a def or defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						foo: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Marker),
					})
				)

				await normalizer.normalize()

				expect(logger.warning).toHaveBeenCalled()
			})

			it('logs an error if the def already exists', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Marker),
					})
				)
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Marker),
					})
				)

				await normalizer.normalize()

				expect(logger.error).toHaveBeenCalled()
			})
		}) // parse

		describe('resolve', function (): void {
			beforeEach(async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Marker),
						dis: HStr.make('some documentation'),
					})
				)
			})

			it('resolves the standard project haystack libraries and tags that exist in another library', async function (): Promise<void> {
				await expect(normalizer.normalize()).resolves.toBeInstanceOf(
					HNamespace
				)
			})

			it('resolves symbol values that exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('symbolVal'),
						is: HSymbol.make('symbol'),
					}),
					HDict.make({
						def: HSymbol.make('foo1'),
						is: HSymbol.make(Kind.Marker),
						symbolVal: HSymbol.make('list'),
					})
				)

				await expect(normalizer.normalize()).resolves.toBeInstanceOf(
					HNamespace
				)
			})

			it('resolves symbol values that exist from a defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('symbolVal'),
						is: HSymbol.make('symbol'),
					}),
					HDict.make({
						defx: HSymbol.make('dict'),
						symbolVal: HSymbol.make('list'),
					})
				)

				await expect(normalizer.normalize()).resolves.toBeInstanceOf(
					HNamespace
				)
			})

			it('resolves symbols in a list that exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('listVal'),
						is: HSymbol.make('list'),
					}),
					HDict.make({
						def: HSymbol.make('foo1'),
						is: HSymbol.make(Kind.Marker),
						listVal: HList.make(HSymbol.make('list')),
					})
				)

				await expect(normalizer.normalize()).resolves.toBeInstanceOf(
					HNamespace
				)
			})

			it('resolves symbols in a list that exist from a defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('listVal'),
						is: HSymbol.make('list'),
					}),
					HDict.make({
						defx: HSymbol.make('dict'),
						listVal: HList.make(HSymbol.make('list')),
					})
				)

				await expect(normalizer.normalize()).resolves.toBeInstanceOf(
					HNamespace
				)
			})

			it('throws an error for a tag that does not exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo1'),
						is: HSymbol.make(Kind.Marker),
						boo: HStr.make('bar'),
					})
				)

				libs.push(lib)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('throws an error for a tag that does not exist for a defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						defx: HSymbol.make('dict'),
						boo: HStr.make('bar'),
					})
				)

				libs.push(lib)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('throws an error for a value symbol that does not exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('symbolVal'),
						is: HSymbol.make('symbol'),
					}),
					HDict.make({
						def: HSymbol.make('foo1'),
						is: HSymbol.make(Kind.Marker),
						symbolVal: HSymbol.make('lit'),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('throws an error for a value symbol that does not exist from a defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('symbolVal'),
						is: HSymbol.make('symbol'),
					}),
					HDict.make({
						defx: HSymbol.make('dict'),
						symbolVal: HSymbol.make('lit'),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('throws an error for a symbol in a list that does not exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('listVal'),
						is: HSymbol.make('list'),
					}),
					HDict.make({
						def: HSymbol.make('foo1'),
						is: HSymbol.make(Kind.Marker),
						listVal: HList.make(HSymbol.make('lit')),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('throws an error for a symbol in a list that does not exist for a defx', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('listVal'),
						is: HSymbol.make('list'),
					}),
					HDict.make({
						defx: HSymbol.make('dict'),
						listVal: HList.make(HSymbol.make('lit')),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})
		}) // resolve

		describe('taxonify', function (): void {
			it('logs an error if a def does not have a `is` tag', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						dis: HStr.make('some documentation'),
					})
				)

				await normalizer.normalize()

				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error if a feature def has an `is` tag', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('feature:foo'),
						is: HSymbol.make(Kind.Marker),
						dis: HStr.make('some documentation'),
					})
				)

				await normalizer.normalize()

				expect(logger.error).toHaveBeenCalled()
			})

			it('throws an error for an invalid feature', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make(':foo'),
						dis: HStr.make('some documentation'),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})
		}) // taxonify

		describe('defx', function (): void {
			it('logs an error if a defx attempts to override an existing tag', async function (): Promise<void> {
				const newDoc = 'Attempt to overwrite the doc comment'

				addDefs(
					HDict.make({
						defx: HSymbol.make('yearBuilt'),
						doc: HStr.make(newDoc),
					})
				)

				await normalizer.normalize()

				expect(logger.error).toHaveBeenCalled()
			})

			it("does not override an existing def tag's value", async function (): Promise<void> {
				const newDoc = 'Attempt to overwrite the doc comment'

				addDefs(
					HDict.make({
						defx: HSymbol.make('yearBuilt'),
						doc: HStr.make(newDoc),
					})
				)

				const namespace = await normalizer.normalize()

				expect(
					namespace.byName('yearBuilt')?.get<HStr>('doc')?.value
				).not.toBe(newDoc)
			})

			it('throws an error if a defx attempts reference a def that does not exist', async function (): Promise<void> {
				addDefs(
					HDict.make({
						defx: HSymbol.make('foo'),
						bee: HMarker.make(),
					})
				)

				await expect(normalizer.normalize()).rejects.toBeInstanceOf(
					Error
				)
			})

			it('accumulates tags with a list', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Str),
						accumulate: HMarker.make(),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('first'),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('first'),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('second'),
					})
				)

				const namespace = await normalizer.normalize()

				expect(namespace.byName('site')?.get('foo')?.toJSON()).toEqual([
					'first',
					'second',
				])
			})

			it('logs an error when the accumulate marker tag is not specified', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Str),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('first'),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('first'),
					}),
					HDict.make({
						defx: HSymbol.make('site'),
						foo: HStr.make('second'),
					})
				)

				await normalizer.normalize()

				expect(logger.error).toHaveBeenCalled()
			})
		}) // defx

		describe('normalizeTags', function (): void {
			it('adds a `lib` tag to each def', async function (): Promise<void> {
				const namespace = await normalizer.normalize()

				for (const def of namespace.grid.getRows()) {
					expect(def.has('lib')).toBe(true)
				}
			})

			it('converts all `tagOns` to a list', async function (): Promise<void> {
				const namespace = await normalizer.normalize()

				for (const def of namespace.grid.getRows()) {
					const tagOn = def.get('tagOn')

					if (tagOn) {
						expect(tagOn.isKind(Kind.List)).toBe(true)
					}
				}
			})

			it('converts all `is` to a list', async function (): Promise<void> {
				const namespace = await normalizer.normalize()

				for (const def of namespace.grid.getRows()) {
					const is = def.get('is')

					if (is) {
						expect(is.isKind(Kind.List)).toBe(true)
					}
				}
			})
		}) // normalizeTags

		describe('inherit', function (): void {
			it('for an El Camino', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('numDoors'),
						is: HSymbol.make(Kind.Number),
					}),
					HDict.make({
						def: HSymbol.make('color'),
						is: HSymbol.make(Kind.Str),
					}),
					HDict.make({
						def: HSymbol.make('engine'),
						is: HSymbol.make(Kind.Str),
					}),
					HDict.make({
						def: HSymbol.make('bedLength'),
						is: HSymbol.make(Kind.Number),
					}),

					// The legendary El Camino as per the example...
					// https://project-haystack.dev/doc/docHaystack/Normalization#inherit
					HDict.make({
						def: HSymbol.make('car'),
						is: HSymbol.make(Kind.Marker),
						numDoors: HNum.make(4),
						color: HStr.make('red'),
						engine: HStr.make('V8'),
					}),
					HDict.make({
						def: HSymbol.make('pickup'),
						is: HSymbol.make(Kind.Marker),
						numDoors: HNum.make(2),
						color: HStr.make('blue'),
						bedLength: HNum.make(80, 'in'),
					}),
					HDict.make({
						def: HSymbol.make('elCamino'),
						is: HList.make<HSymbol>([
							HSymbol.make('pickup'),
							HSymbol.make('car'),
						]),
						color: HStr.make('purple'),
						doc: HStr.make('The El Camino'),
					})
				)

				const namespace = await normalizer.normalize()

				expect(namespace.byName('elCamino')?.toJSON()).toEqual(
					HDict.make({
						def: HSymbol.make('elCamino'),
						is: HList.make<HSymbol>([
							HSymbol.make('pickup'),
							HSymbol.make('car'),
						]),
						color: HStr.make('purple'),
						doc: HStr.make('The El Camino'),
						lib: HSymbol.make('lib:test'),
						numDoors: HNum.make(2), // inherited from pickup first
						bedLength: HNum.make(80, 'in'), // inherited from pickup
						engine: HStr.make('V8'), // inherited from car
					}).toJSON()
				)
			})
		}) // inherit

		describe('validate', function (): void {
			describe("verifies tag values match the def's declared types", function (): void {
				it('logs an error for a bool value that is a string type', async function (): Promise<void> {
					addDefs(
						HDict.make({
							def: HSymbol.make('foo'),
							is: HSymbol.make(Kind.Str),
						}),
						HDict.make({
							def: HSymbol.make('foo2'),
							is: HSymbol.make(Kind.Str),
							foo: HBool.make(true),
						})
					)

					await normalizer.normalize()
					expect(logger.error).toHaveBeenCalled()
				})

				it('logs an error for an accumulated def that has the wrong value type', async function (): Promise<void> {
					addDefs(
						HDict.make({
							def: HSymbol.make('foo'),
							is: HSymbol.make(Kind.Str),
							accumulate: HMarker.make(),
						}),
						HDict.make({
							defx: HSymbol.make('site'),
							foo: HBool.make(true),
						}),
						HDict.make({
							defx: HSymbol.make('site'),
							foo: HStr.make('first'),
						}),
						HDict.make({
							defx: HSymbol.make('site'),
							foo: HStr.make('second'),
						})
					)

					await normalizer.normalize()
					expect(logger.error).toHaveBeenCalled()
				})
			}) // verifies tag values match the def's declared types

			it('logs an error for a def called `index`', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('index'),
						is: HSymbol.make(Kind.Marker),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when a conjunct contains tags that are not markers', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Str),
						accumulate: HMarker.make(),
					}),
					HDict.make({
						def: HSymbol.make('foo-actuator'),
						is: HSymbol.make(Kind.Marker),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when a def contains a computedFromReciprocal tag', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make(Kind.Str),
						tags: HList.make([]),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when a choice `of` target does not extend marker', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make('choice'),
						of: HSymbol.make('str'),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when tagOn is used in a conjunct def', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make('marker'),
					}),
					HDict.make({
						def: HSymbol.make('foo2'),
						is: HSymbol.make('marker'),
					}),
					HDict.make({
						def: HSymbol.make('foo-foo2'),
						is: HSymbol.make('marker'),
						tagOn: HSymbol.make('site'),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when tagOn is used in a feature def', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('feature:foo'),
						is: HSymbol.make('marker'),
						tagOn: HSymbol.make('site'),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})

			it('logs an error when a relationship tag is used on a non-ref', async function (): Promise<void> {
				addDefs(
					HDict.make({
						def: HSymbol.make('foo'),
						is: HSymbol.make('marker'),
						contains: HSymbol.make('site'),
					})
				)

				await normalizer.normalize()
				expect(logger.error).toHaveBeenCalled()
			})
		}) // validate

		describe('generate', function (): void {
			describe('integration test', function (): void {
				it('generates a namespace and matches it against a namespace generated from SkySpark', async function (): Promise<void> {
					for (let i = 0; i < libs.length; ++i) {
						if (libs[i].lib.def.value === 'lib:test') {
							libs.splice(i, 1)
							break
						}
					}

					const grid = makeValue(
						JSON.parse(
							(
								await readFile(
									path.join(
										__dirname,
										'./files/skySparkDefs.json'
									)
								)
							).toString('utf8')
						)
					) as HGrid

					const originalNamespace = new HNamespace(grid)

					const generatedNamespace = await normalizer.normalize()

					expect(originalNamespace.grid.length).toEqual(
						generatedNamespace.grid.length
					)

					// Sort all the list values since the generation of the order
					// of these lists could easily be different.
					function sort(val: HVal | null): void {
						if (valueIsKind<HList>(val, Kind.List)) {
							val.sort()
						}
					}

					for (const name of Object.keys(originalNamespace.defs)) {
						const originalDef = originalNamespace.defs[name]
						const generatedDef = generatedNamespace.defs[name]

						// Remove these tags since newlines currently seem to be handled differently.
						generatedDef.remove('doc')
						originalDef.remove('doc')
						generatedDef.remove('enum')
						originalDef.remove('enum')

						// It appears this information is not generated from defs when
						// generated from SkySpark. Hence we can exclude it for this test.
						if (
							originalDef.defName === 'tz' ||
							originalDef.defName === 'unit'
						) {
							originalDef.remove('enum')
						}

						originalDef.values.forEach(sort)
						generatedDef.values.forEach(sort)

						expect(originalDef.toJSON()).toEqual(
							generatedDef.toJSON()
						)

						const equals = originalDef.equals(generatedDef)

						if (!equals) {
							console.log(`${name} is not equal...`)

							console.group('Original')
							console.log(
								JSON.stringify(originalDef.toJSON(), null, 2)
							)
							console.groupEnd()

							console.group('Generated')
							console.log(
								JSON.stringify(generatedDef.toJSON(), null, 2)
							)
							console.groupEnd()
						}

						expect(equals).toBe(true)

						if (!equals) {
							break
						}
					}
				})
			}) // integration test
		}) // generate
	}) // #normalize()
})

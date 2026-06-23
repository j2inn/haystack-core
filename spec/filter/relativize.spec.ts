/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../../src/core/dict/HDict'
import { HRef } from '../../src/core/HRef'
import {
	makeRelativeHaystackFilter,
	makeRelativeHaystackFilterForTarget,
	RelativizeResolveFunc,
} from '../../src/filter/relativize'
import { HMarker } from '../../src/core/HMarker'
import { HStr } from '../../src/core/HStr'
import { HSymbol } from '../../src/core/HSymbol'
import { HNamespace } from '../../src/core/HNamespace'

describe('haystack', () => {
	describe('makeRelativeHaystackFilter()', () => {
		it('returns a haystack filter with dis', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
					})
				)
			).toEqual('equip and dis == "an equip"')
		})

		it('returns a haystack filter without a display name with the option disabled', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
					}),
					{
						useDisplayName: false,
					}
				)
			).toEqual('equip')
		})

		it('returns a haystack filter with a nav name', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'an equip',
						equip: HMarker.make(),
					})
				)
			).toEqual('equip and navName == "an equip"')
		})

		it('returns a haystack filter with a point kind', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'a point',
						point: HMarker.make(),
						kind: HStr.make('Number'),
					})
				)
			).toEqual('point and navName == "a point" and kind == "Number"')
		})

		it('returns a haystack filter with a point kind and path', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'a point',
						point: HMarker.make(),
						kind: HStr.make('Number'),
					}),
					{ prefixPath: ['foo', 'bar'] }
				)
			).toEqual(
				'foo->bar->point and foo->bar->navName == "a point" and foo->bar->kind == "Number"'
			)
		})

		it('returns a haystack filter without the point kind and the option disabled', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						navName: 'a point',
						point: HMarker.make(),
						kind: HStr.make('Number'),
					}),
					{
						useKind: false,
					}
				)
			).toEqual('point and navName == "a point"')
		})

		it('returns a haystack filter with an absolute id as a fallback', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
					})
				)
			).toEqual('id == @id')
		})

		it('returns a haystack filter without excluded tags', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
						his: HMarker.make(),
						aux: HMarker.make(),
					})
				)
			).toEqual('equip and dis == "an equip"')
		})

		it('returns a haystack filter without connPoint subtype tags', () => {
			const mockNamespace = {
				allSubTypesOf: () => [
					HDict.make({ def: HSymbol.make('demoPoint') }),
				],
			} as unknown as HNamespace

			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
						demoPoint: HMarker.make(),
					}),
					{
						namespace: mockNamespace,
					}
				)
			).toEqual('equip and dis == "an equip"')
		})

		it('returns a haystack filter without custom excluded tags', () => {
			expect(
				makeRelativeHaystackFilter(
					new HDict({
						id: HRef.make('id'),
						dis: 'an equip',
						equip: HMarker.make(),
						customTag: HMarker.make(),
					}),
					{
						getExcludedTags: () => ['customTag'],
					}
				)
			).toEqual('equip and dis == "an equip"')
		})
	}) // makeRelativeHaystackFilter()

	describe('makeRelativeHaystackFilterForTarget()', () => {
		describe('for equip and a point', () => {
			let equip: HDict
			let point: HDict

			beforeAll(() => {
				equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
				})

				point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})
			})

			it('creates relative filters for an equip record', async () => {
				expect(
					await makeRelativeHaystackFilterForTarget(equip, point)
				).toBe(
					'equipRef == $id and point and dis == "a point" and kind == "Number"'
				)
			})
		}) // for equip and a point

		describe('for a room, an equip and a point', () => {
			let room: HDict
			let equip: HDict
			let point: HDict
			let resolve: RelativizeResolveFunc

			beforeAll(() => {
				room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
				})

				equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				resolve = async (ref: HRef) => {
					let result: HDict | undefined

					switch (ref.value) {
						case 'equipId':
							result = equip
							break
						case 'roomId':
							result = room
							break
						case 'pointId':
							result = point
							break
					}

					return result
				}
			})

			it('creates relative filters for a room target', async () => {
				expect(
					await makeRelativeHaystackFilterForTarget(room, point, {
						resolve,
					})
				).toBe(
					'equipRef->spaceRef == $id and point and dis == "a point" and kind == "Number" and equipRef->equip and equipRef->dis == "an equip"'
				)
			})

			it('creates relative filters for an equip target', async () => {
				expect(
					await makeRelativeHaystackFilterForTarget(equip, point, {
						resolve,
					})
				).toBe(
					'equipRef == $id and point and dis == "a point" and kind == "Number"'
				)
			})
		}) // for equip and a point

		describe('options', () => {
			let equip: HDict
			let point: HDict

			beforeAll(() => {
				equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
				})

				point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})
			})

			it('excludes intermediate records when includeIntermediateRecords is false', async () => {
				const room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
				})

				const midEquip = new HDict({
					id: HRef.make('midEquipId'),
					dis: 'mid equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				const nestedPoint = new HDict({
					id: HRef.make('nestedPointId'),
					dis: 'nested point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('midEquipId'),
				})

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					if (ref.value === 'midEquipId') return midEquip
					if (ref.value === 'roomId') return room
					return undefined
				}

				const result = await makeRelativeHaystackFilterForTarget(
					room,
					nestedPoint,
					{
						resolve,
						includeIntermediateRecords: false,
					}
				)

				expect(result).toBe(
					'equipRef->spaceRef == $id and point and dis == "nested point" and kind == "Number"'
				)
			})

			it('excludes target macro when includeTargetMacro is false', async () => {
				const result = await makeRelativeHaystackFilterForTarget(
					equip,
					point,
					{
						includeTargetMacro: false,
					}
				)

				expect(result).toBe(
					'point and dis == "a point" and kind == "Number"'
				)
			})

			it('excludes both target macro and intermediate records', async () => {
				const result = await makeRelativeHaystackFilterForTarget(
					equip,
					point,
					{
						includeTargetMacro: false,
						includeIntermediateRecords: false,
					}
				)

				expect(result).toBe(
					'point and dis == "a point" and kind == "Number"'
				)
			})

			it('respects useDisplayName option', async () => {
				const result = await makeRelativeHaystackFilterForTarget(
					equip,
					point,
					{
						useDisplayName: false,
					}
				)

				expect(result).toBe(
					'equipRef == $id and point and kind == "Number"'
				)
			})

			it('respects useKind option', async () => {
				const result = await makeRelativeHaystackFilterForTarget(
					equip,
					point,
					{
						useKind: false,
					}
				)

				expect(result).toBe(
					'equipRef == $id and point and dis == "a point"'
				)
			})
		}) // options

		describe('edge cases', () => {
			it('throws when target has no id', async () => {
				const target = new HDict({
					dis: 'no id',
					equip: HMarker.make(),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					equipRef: HRef.make('equipId'),
				})

				await expect(
					makeRelativeHaystackFilterForTarget(target, point)
				).rejects.toThrow('Target record must have an id')
			})

			it('throws when record has no parent ref', async () => {
				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
				})

				const orphanRecord = new HDict({
					id: HRef.make('orphanId'),
					dis: 'orphan',
				})

				await expect(
					makeRelativeHaystackFilterForTarget(equip, orphanRecord)
				).rejects.toThrow('does not have a parent reference')
			})

			it('includes record id in no-parent-ref error message', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					equip: HMarker.make(),
				})

				const orphanRecord = new HDict({
					id: HRef.make('myOrphanId'),
					dis: 'orphan',
				})

				await expect(
					makeRelativeHaystackFilterForTarget(target, orphanRecord)
				).rejects.toThrow('Record myOrphanId does not have a parent reference')
			})

			it('throws when parent ref cannot be resolved', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					space: HMarker.make(),
				})

				const record = new HDict({
					id: HRef.make('recordId'),
					dis: 'record',
					equip: HMarker.make(),
					spaceRef: HRef.make('unknownId'),
				})

				const resolve: RelativizeResolveFunc = async () => undefined

				await expect(
					makeRelativeHaystackFilterForTarget(target, record, {
						resolve,
					})
				).rejects.toThrow(
					'Could not resolve parent record for ref unknownId'
				)
			})

			it('throws when containment depth exceeds limit', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					site: HMarker.make(),
				})

				const records: HDict[] = []
				let currentId = 'record0'

				for (let i = 0; i < 15; i++) {
					const nextId = `record${i + 1}`
					records.push(
						new HDict({
							id: HRef.make(currentId),
							dis: `record ${i}`,
							equip: HMarker.make(),
							spaceRef: HRef.make(nextId),
						})
					)
					currentId = nextId
				}

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					return records.find((r) => r.get('id')?.equals(ref))
				}

				await expect(
					makeRelativeHaystackFilterForTarget(target, records[0], {
						resolve,
					})
				).rejects.toThrow('Exceeded maximum containment depth')
			})

			it('supports spaceRef containment hierarchy', async () => {
				const space = new HDict({
					id: HRef.make('spaceId'),
					dis: 'a space',
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('spaceId'),
				})

				const result = await makeRelativeHaystackFilterForTarget(
					space,
					equip
				)

				expect(result).toBe(
					'spaceRef == $id and equip and dis == "an equip"'
				)
			})

			it('supports siteRef containment hierarchy', async () => {
				const site = new HDict({
					id: HRef.make('siteId'),
					dis: 'a site',
					site: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					siteRef: HRef.make('siteId'),
				})

				const result = await makeRelativeHaystackFilterForTarget(
					site,
					equip
				)

				expect(result).toBe(
					'siteRef == $id and equip and dis == "an equip"'
				)
			})

			it('supports floorRef containment hierarchy', async () => {
				const floor = new HDict({
					id: HRef.make('floorId'),
					dis: 'a floor',
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					floorRef: HRef.make('floorId'),
				})

				const result = await makeRelativeHaystackFilterForTarget(
					floor,
					equip
				)

				expect(result).toBe(
					'floorRef == $id and equip and dis == "an equip"'
				)
			})

			it('handles three-level hierarchy correctly', async () => {
				const site = new HDict({
					id: HRef.make('siteId'),
					dis: 'a site',
					site: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					siteRef: HRef.make('siteId'),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Status'),
					equipRef: HRef.make('equipId'),
				})

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					if (ref.value === 'equipId') return equip
					if (ref.value === 'siteId') return site
					return undefined
				}

				const result = await makeRelativeHaystackFilterForTarget(
					site,
					point,
					{ resolve }
				)

				expect(result).toBe(
					'equipRef->siteRef == $id and point and dis == "a point" and kind == "Status" and equipRef->equip and equipRef->dis == "an equip"'
				)
			})
		}) // edge cases

		describe('error propagation', () => {
			it('propagates error from resolve function', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					space: HMarker.make(),
				})

				const record = new HDict({
					id: HRef.make('recordId'),
					dis: 'record',
					equip: HMarker.make(),
					spaceRef: HRef.make('parentId'),
				})

				const resolve: RelativizeResolveFunc = async () => {
					throw new Error('Resolve failed')
				}

				await expect(
					makeRelativeHaystackFilterForTarget(target, record, {
						resolve,
					})
				).rejects.toThrow('Resolve failed')
			})

			it('propagates rejected promise from cache', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					space: HMarker.make(),
				})

				const record = new HDict({
					id: HRef.make('recordId'),
					dis: 'record',
					equip: HMarker.make(),
					spaceRef: HRef.make('parentId'),
				})

				const resolveCache = new Map<string, Promise<HDict | undefined>>()
				resolveCache.set(
					'parentId',
					Promise.reject(new Error('Cached resolve failed'))
				)

				await expect(
					makeRelativeHaystackFilterForTarget(target, record, {
						resolveCache,
					})
				).rejects.toThrow('Cached resolve failed')
			})

			it('throws when resolve is not provided and ref cannot be resolved', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					space: HMarker.make(),
				})

				const equipChild = new HDict({
					id: HRef.make('equipId'),
					dis: 'equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('targetId'),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				await expect(
					makeRelativeHaystackFilterForTarget(target, point)
				).rejects.toThrow('Could not resolve parent record for ref equipId')
			})

			it('throws when record id is missing in parent ref error', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					equip: HMarker.make(),
				})

				const orphanRecord = new HDict({
					dis: 'orphan without id',
				})

				await expect(
					makeRelativeHaystackFilterForTarget(target, orphanRecord)
				).rejects.toThrow('does not have a parent reference')
			})
		}) // error propagation
		describe('resolveCache', () => {
			it('populates the cache for resolved refs', async () => {
				const site = new HDict({
					id: HRef.make('siteId'),
					dis: 'a site',
					site: HMarker.make(),
				})

				const room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
					siteRef: HRef.make('siteId'),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				const resolveCache = new Map<string, Promise<HDict | undefined>>()

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					if (ref.value === 'equipId') return equip
					if (ref.value === 'roomId') return room
					if (ref.value === 'siteId') return site
					return undefined
				}

				await makeRelativeHaystackFilterForTarget(site, point, {
					resolve,
					resolveCache,
				})

				expect(resolveCache.has('equipId')).toBe(true)
				expect(resolveCache.has('roomId')).toBe(true)
				expect(resolveCache.has('siteId')).toBe(false)
			})

			it('avoids resolve calls when cache contains the ref', async () => {
				const room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				let resolveCallCount = 0

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					resolveCallCount++
					if (ref.value === 'equipId') return equip
					if (ref.value === 'roomId') return room
					return undefined
				}

				const resolveCache = new Map<string, Promise<HDict | undefined>>()
				resolveCache.set('equipId', Promise.resolve(equip))

				await makeRelativeHaystackFilterForTarget(room, point, {
					resolve,
					resolveCache,
				})

				expect(resolveCallCount).toBe(0)
			})

			it('shares cache across multiple invocations', async () => {
				const room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				const point1 = new HDict({
					id: HRef.make('point1Id'),
					dis: 'point 1',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				const point2 = new HDict({
					id: HRef.make('point2Id'),
					dis: 'point 2',
					point: HMarker.make(),
					kind: HStr.make('Status'),
					equipRef: HRef.make('equipId'),
				})

				let resolveCallCount = 0

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					resolveCallCount++
					if (ref.value === 'equipId') return equip
					if (ref.value === 'roomId') return room
					return undefined
				}

				const resolveCache = new Map<string, Promise<HDict | undefined>>()

				await makeRelativeHaystackFilterForTarget(room, point1, {
					resolve,
					resolveCache,
				})

				const callsAfterFirst = resolveCallCount
				expect(callsAfterFirst).toBe(1)

				await makeRelativeHaystackFilterForTarget(room, point2, {
					resolve,
					resolveCache,
				})

				expect(resolveCallCount).toBe(1)
			})

			it('uses cached promise when available', async () => {
				const target = new HDict({
					id: HRef.make('targetId'),
					dis: 'target',
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('targetId'),
				})

				const resolve: RelativizeResolveFunc = async (ref: HRef) => {
					if (ref.value === 'equipId') return equip
					if (ref.value === 'targetId') return target
					return undefined
				}

				const resolveCache = new Map<string, Promise<HDict | undefined>>()

				const cachedEquip = new HDict({
					id: HRef.make('equipId'),
					dis: 'cached equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('targetId'),
				})

				resolveCache.set('equipId', Promise.resolve(cachedEquip))

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				const result = await makeRelativeHaystackFilterForTarget(
					target,
					point,
					{
						resolve,
						resolveCache,
					}
				)

				expect(result).toBe(
					'equipRef->spaceRef == $id and point and dis == "a point" and kind == "Number" and equipRef->equip and equipRef->dis == "cached equip"'
				)
			})

			it('does not require resolve function when cache has all refs', async () => {
				const room = new HDict({
					id: HRef.make('roomId'),
					dis: 'a room',
					room: HMarker.make(),
					space: HMarker.make(),
				})

				const equip = new HDict({
					id: HRef.make('equipId'),
					dis: 'an equip',
					equip: HMarker.make(),
					spaceRef: HRef.make('roomId'),
				})

				const point = new HDict({
					id: HRef.make('pointId'),
					dis: 'a point',
					point: HMarker.make(),
					kind: HStr.make('Number'),
					equipRef: HRef.make('equipId'),
				})

				const resolveCache = new Map<string, Promise<HDict | undefined>>()
				resolveCache.set('equipId', Promise.resolve(equip))
				resolveCache.set('roomId', Promise.resolve(room))

				const result = await makeRelativeHaystackFilterForTarget(
					room,
					point,
					{
						resolveCache,
					}
				)

				expect(result).toBe(
					'equipRef->spaceRef == $id and point and dis == "a point" and kind == "Number" and equipRef->equip and equipRef->dis == "an equip"'
				)
			})
		}) // resolveCache
	}) // makeRelativeHaystackFilterForTarget()
})

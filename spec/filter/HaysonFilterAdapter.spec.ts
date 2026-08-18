/*
 * Copyright (c) 2026, J2 Innovations. All Rights Reserved
 */

import { HFilter } from '../../src/filter/HFilter'
import { HAYSON_FILTER_ADAPTER } from '../../src/filter/HaysonFilterAdapter'
import { HDict } from '../../src/core/dict/HDict'
import { HRef } from '../../src/core/HRef'
import { HMarker } from '../../src/core/HMarker'
import { HNum } from '../../src/core/HNum'
import { HList } from '../../src/core/list/HList'
import { HaysonDict } from '../../src/core/hayson'

describe('HaysonFilterAdapter', function (): void {
	function toJson(dict: HDict): HaysonDict {
		return dict.toJSON()
	}

	it('matches a marker tag via `has`', function (): void {
		const json = toJson(HDict.make({ site: HMarker.make() }))
		expect(
			new HFilter('site').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('equip').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
	})

	it('compares a number with a unit', function (): void {
		const json = toJson(HDict.make({ temp: HNum.make(72, '°F') }))
		expect(
			new HFilter('temp > 70°F').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('temp > 80°F').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
		// Mismatched units must not match.
		expect(
			new HFilter('temp == 72°C').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
	})

	it('treats present-but-falsy values (0, false, empty string) as having a value', function (): void {
		const json = toJson(HDict.make({ count: 0, active: false, name: '' }))
		expect(
			new HFilter('count').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('active').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('name').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('count == 0').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('active == false').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
	})

	it('returns true for `missing` when a property is absent', function (): void {
		const json = toJson(HDict.make({ foo: HMarker.make() }))
		expect(
			new HFilter('not goo').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('not foo').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
	})

	it('traverses a nested dict path', function (): void {
		const json = toJson(
			HDict.make({ nested: HDict.make({ foo: HMarker.make() }) })
		)
		expect(
			new HFilter('nested->foo').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('nested->goo').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
	})

	it('resolves a ref path via the resolve callback', function (): void {
		const pointJson = toJson(
			HDict.make({ equipRef: HRef.make('equip'), point: HMarker.make() })
		)
		const equipJson = toJson(HDict.make({ equip: HMarker.make() }))

		const resolve = (ref: HRef): HaysonDict | undefined =>
			ref.value === 'equip' ? equipJson : undefined

		expect(
			new HFilter('equipRef->equip').eval({
				dict: pointJson,
				adapter: HAYSON_FILTER_ADAPTER,
				resolve,
			})
		).toBe(true)
	})

	it('resolves a list of refs', function (): void {
		const pointJson = toJson(
			HDict.make({
				pointsRef: HList.make([HRef.make('a'), HRef.make('b')]),
			})
		)
		const bJson = toJson(HDict.make({ marker: HMarker.make() }))

		const resolve = (ref: HRef): HaysonDict | undefined =>
			ref.value === 'b' ? bJson : undefined

		expect(
			new HFilter('pointsRef->marker').eval({
				dict: pointJson,
				adapter: HAYSON_FILTER_ADAPTER,
				resolve,
			})
		).toBe(true)
	})

	it('matches a wildcard ref equality', function (): void {
		const json = toJson(HDict.make({ equipRef: HRef.make('equip') }))
		expect(
			new HFilter('equipRef*==@equip').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(true)
		expect(
			new HFilter('equipRef*==@other').eval({
				dict: json,
				adapter: HAYSON_FILTER_ADAPTER,
			})
		).toBe(false)
	})

	it('produces the same result as evaluating against the real HDict', function (): void {
		const dict = HDict.make({
			site: HMarker.make(),
			temp: HNum.make(72, '°F'),
		})
		const json = toJson(dict)

		const filter = new HFilter('site and temp > 70°F')

		expect(filter.eval({ dict })).toBe(true)
		expect(
			filter.eval({ dict: json, adapter: HAYSON_FILTER_ADAPTER })
		).toBe(true)
	})
})

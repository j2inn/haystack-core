/*
 * Copyright (c) 2021, J2 Innovations. All Rights Reserved
 */

import { HDate } from '../../src/core/HDate'
import { HDateTime } from '../../src/core/HDateTime'
import { HSpan, SpanMode } from '../../src/core/HSpan'
import { Interval, DateTime } from 'luxon'
import * as Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'

describe('HSpan', function (): void {
	describe('.fromStr()', function (): void {
		it('decodes `today`', function (): void {
			expect(HSpan.fromStr('today')?.toJSON()).toEqual({
				mode: SpanMode.today,
			})
		})

		it('decodes `yesterday`', function (): void {
			expect(HSpan.fromStr('yesterday')?.toJSON()).toEqual({
				mode: SpanMode.yesterday,
			})
		})

		it('decodes singular date', function (): void {
			expect(HSpan.fromStr('2021-04-12')?.toJSON()).toEqual({
				start: HDate.make('2021-04-12').toJSON(),
			})
		})

		it('does not decode singular date time', function (): void {
			expect(HSpan.fromStr('2021-04-12T12:41:59.605Z')).toBeUndefined()
		})

		it('decodes two dates', function (): void {
			expect(HSpan.fromStr('2021-04-12,2021-04-13')?.toJSON()).toEqual({
				start: HDate.make('2021-04-12').toJSON(),
				end: HDate.make('2021-04-13').toJSON(),
			})
		})

		it('decodes two date times', function (): void {
			expect(
				HSpan.fromStr(
					'2021-04-12T12:41:59.605Z UTC,2021-04-13T12:41:59.605Z UTC'
				)?.toJSON()
			).toEqual({
				start: HDateTime.make('2021-04-12T12:41:59.605Z UTC').toJSON(),
				end: HDateTime.make('2021-04-13T12:41:59.605Z UTC').toJSON(),
			})
		})

		it('does not decode with two commas', function (): void {
			expect(HSpan.fromStr('2021-04-12,2021-04-13,')).toBeUndefined()
		})
	}) // .fromStr()

	describe('#toString()', function (): void {
		it('encodes a relative time to a string', function (): void {
			expect(new HSpan({ mode: SpanMode.yesterday }).toString()).toBe(
				SpanMode.yesterday
			)
		})

		it('encodes an absolute date to a string', function (): void {
			expect(
				new HSpan({ start: HDate.make('2021-04-12') }).toString()
			).toBe('2021-04-12')
		})

		it('encodes an absolute date span to a string', function (): void {
			expect(
				new HSpan({
					start: HDate.make('2021-04-12'),
					end: HDate.make('2021-04-13'),
				}).toString()
			).toBe('2021-04-12,2021-04-13')
		})

		it('encodes an absolute date time span to a string', function (): void {
			expect(
				new HSpan({
					start: HDateTime.make('2021-04-12T12:41:59.605Z UTC'),
					end: HDateTime.make('2021-04-13T12:41:59.605Z UTC'),
				}).toString()
			).toBe('2021-04-12T12:41:59.605Z,2021-04-13T12:41:59.605Z')
		})
	}) // #toString()

	describe('#toAxon()', function (): void {
		it('encodes the span to Axon', function (): void {
			expect(new HSpan({ mode: SpanMode.yesterday }).toAxon()).toBe(
				'toSpan("yesterday")'
			)
		})
	}) // #toAxon()

	describe('#isRelative()', function (): void {
		it('returns true for a relative mode', function (): void {
			expect(new HSpan({ mode: SpanMode.lastWeek }).isRelative()).toBe(
				true
			)
		})

		it('returns false for an absolute mode', function (): void {
			expect(
				new HSpan({ start: HDate.make('2021-04-12') }).isRelative()
			).toBe(false)
		})
	}) // #isRelative()

	describe('#toLuxonInterval()', function (): void {
		let now: Date

		beforeEach(function (): void {
			now = new Date('2021-04-08')
		})

		it('returns an interval for the whole of today', function (): void {
			const interval = new HSpan({
				mode: SpanMode.today,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-08T00:00:00.000Z – 2021-04-08T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of yesterday', function (): void {
			const interval = new HSpan({
				mode: SpanMode.yesterday,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-07T00:00:00.000Z – 2021-04-07T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of this week', function (): void {
			const interval = new HSpan({
				mode: SpanMode.thisWeek,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-05T00:00:00.000Z – 2021-04-11T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of last week', function (): void {
			const interval = new HSpan({
				mode: SpanMode.lastWeek,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-03-29T00:00:00.000Z – 2021-04-04T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of this month', function (): void {
			const interval = new HSpan({
				mode: SpanMode.thisMonth,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-01T00:00:00.000Z – 2021-04-30T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of last month', function (): void {
			const interval = new HSpan({
				mode: SpanMode.lastMonth,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-03-01T00:00:00.000Z – 2021-03-31T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of this quarter', function (): void {
			const interval = new HSpan({
				mode: SpanMode.thisQuarter,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-01T00:00:00.000Z – 2021-06-30T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of last quarter', function (): void {
			const interval = new HSpan({
				mode: SpanMode.lastQuarter,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-01-01T00:00:00.000Z – 2021-03-31T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of this year', function (): void {
			const interval = new HSpan({
				mode: SpanMode.thisYear,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-01-01T00:00:00.000Z – 2021-12-31T23:59:59.999Z'
			)
		})

		it('returns an interval for the whole of last year', function (): void {
			const interval = new HSpan({
				mode: SpanMode.lastYear,
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2020-01-01T00:00:00.000Z – 2020-12-31T23:59:59.999Z'
			)
		})

		it('returns an interval for a date', function (): void {
			const interval = new HSpan({
				start: HDate.make(now),
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-08T00:00:00.000Z – 2021-04-08T23:59:59.999Z'
			)
		})

		it('returns an interval for a date range', function (): void {
			const interval = new HSpan({
				start: HDate.make(now),
				end: HDate.make('2021-04-10'),
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-08T00:00:00.000Z – 2021-04-10T23:59:59.999Z'
			)
		})

		it('returns an interval for a date time range', function (): void {
			const interval = new HSpan({
				start: HDateTime.make('2021-04-08T07:17:02.500Z'),
				end: HDateTime.make('2021-04-10T08:10:01.123Z'),
				timezone: 'UTC',
			}).toLuxonInterval({ DateTime, Interval }, now)

			expect(interval.toString()).toContain(
				'2021-04-08T07:17:02.500Z – 2021-04-10T08:10:01.123Z'
			)
		})
	}) // #toLuxonInterval()

	describe('#toMomentRange()', function (): void {
		const moment = extendMoment(Moment)
		moment.locale('en')

		let now: Date

		beforeEach(function (): void {
			now = new Date('2021-04-08')
		})

		it('returns an range for the whole of today', function (): void {
			const range = new HSpan({
				mode: SpanMode.today,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-04-08T00:00:00Z/2021-04-08T23:59:59Z'
			)
		})

		it('returns an range for the whole of yesterday', function (): void {
			const range = new HSpan({
				mode: SpanMode.yesterday,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-04-07T00:00:00Z/2021-04-07T23:59:59Z'
			)
		})

		it('returns an range for this week', function (): void {
			const range = new HSpan({
				mode: SpanMode.thisWeek,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-04-04T00:00:00Z/2021-04-10T23:59:59Z'
			)
		})

		it('returns an range for last week', function (): void {
			const range = new HSpan({
				mode: SpanMode.lastWeek,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-03-28T00:00:00Z/2021-04-03T23:59:59Z'
			)
		})

		it('returns an range for this month', function (): void {
			const range = new HSpan({
				mode: SpanMode.thisMonth,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-04-01T00:00:00Z/2021-04-30T23:59:59Z'
			)
		})

		it('returns an range for last month', function (): void {
			const range = new HSpan({
				mode: SpanMode.lastMonth,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-03-01T00:00:00Z/2021-03-31T23:59:59Z'
			)
		})

		it('returns an range for this quarter', function (): void {
			const range = new HSpan({
				mode: SpanMode.thisQuarter,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-04-01T00:00:00Z/2021-06-30T23:59:59Z'
			)
		})

		it('returns an range for last quarter', function (): void {
			const range = new HSpan({
				mode: SpanMode.lastQuarter,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-01-01T00:00:00Z/2021-03-31T23:59:59Z'
			)
		})

		it('returns an range for this year', function (): void {
			const range = new HSpan({
				mode: SpanMode.thisYear,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2021-01-01T00:00:00Z/2021-12-31T23:59:59Z'
			)
		})

		it('returns an range for last year', function (): void {
			const range = new HSpan({
				mode: SpanMode.lastYear,
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toEqual(
				'2020-01-01T00:00:00Z/2020-12-31T23:59:59Z'
			)
		})

		it('returns an range for a date', function (): void {
			const range = new HSpan({
				start: HDate.make(now),
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toContain(
				'2021-04-08T00:00:00Z/2021-04-08T23:59:59Z'
			)
		})

		it('returns an range for a date range', function (): void {
			const range = new HSpan({
				start: HDate.make(now),
				end: HDate.make('2021-04-10'),
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toContain(
				'2021-04-08T00:00:00Z/2021-04-10T23:59:59Z'
			)
		})

		it('returns an range for a date time range', function (): void {
			const range = new HSpan({
				start: HDateTime.make('2021-04-08T07:17:02.500Z'),
				end: HDateTime.make('2021-04-10T08:10:01.123Z'),
				timezone: 'UTC',
			}).toMomentRange(moment, now)

			expect(range.toString()).toContain(
				'2021-04-08T07:17:02Z/2021-04-10T08:10:01Z'
			)
		})
	}) // #toMomentRange()
}) // HSpan

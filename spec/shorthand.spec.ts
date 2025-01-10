/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import {
	HCoord,
	HDateTime,
	HGrid,
	HMarker,
	HNa,
	HNum,
	HRef,
	HRemove,
	HStr,
	HTime,
	HUri,
	HXStr,
	Kind,
} from '../src/index'
import {
	bool,
	coord,
	date,
	dateTime,
	dict,
	grid,
	list,
	make,
	num,
	ref,
	str,
	symbol,
	time,
	uri,
	xstr,
} from '../src/shorthand'

import { FALSE, MARKER, NA, REMOVE, TRUE } from './../src/shorthand'

import './matchers'
import './customMatchers'

describe('shorthand', () => {
	describe('make', () => {
		it('makes bool', () => {
			expect(make(true)?.valueOf()).toBe(true)
			expect(make(false)?.valueOf()).toEqual(false)

			expect(make(make(true))?.valueOf()).toBe(true)
		})
	}) // make

	describe('bool', () => {
		it('makes bool', () => {
			expect(bool(true).value).toBe(true)
			expect(bool(false).value).toEqual(false)

			expect(bool(bool(true)).value).toBe(true)
		})

		it('constants', () => {
			expect(TRUE.value).toBe(true)
			expect(FALSE.value).toEqual(false)
		})
	}) // bool

	describe('coord', () => {
		it('makes coord', () => {
			expect(coord({ lat: 1, lng: 2 }).toZinc()).toBe(
				coord({ latitude: 1, longitude: 2 }).toZinc()
			)

			expect(coord(HCoord.make({ lat: 1, lng: 2 })).toJSON()).toEqual(
				coord(coord({ latitude: 1, longitude: 2 })).toJSON()
			)
		})
	}) // coord

	describe('date', () => {
		it('makes date', () => {
			expect(date(new Date('2009-11-09T15:39:00Z')).value).toBe(
				'2009-11-09'
			)

			expect(date(date({ year: 2022, month: 10, day: 10 })).value).toBe(
				'2022-10-10'
			)
		})
	}) // date

	describe('dateTime', () => {
		it('makes dateTime', () => {
			expect(dateTime('2009-11-09T15:39:00Z').value).toEqual(
				'2009-11-09T15:39:00Z'
			)

			expect(
				dateTime({
					_kind: Kind.DateTime,
					val: '2010-11-28T07:23:02.773-08:00',
					tz: 'Los_Angeles',
				}).equals(
					dateTime(
						HDateTime.make(
							'2010-11-28T07:23:02.773-08:00 Los_Angeles'
						)
					)
				)
			).toBe(true)
		})
	}) // dateTime

	describe('symbol', () => {
		it('makes symbol', () => {
			expect(symbol('test').value).toEqual('test')

			expect(symbol({ _kind: Kind.Symbol, val: 'test' }).value).toEqual(
				'test'
			)

			expect(symbol(symbol('test')).value).toEqual('test')
		})
	}) // symbol

	describe('dict', () => {
		it('makes dict', () => {
			expect(dict({}).toJSON()).toEqual({})

			expect(dict({ foo: 'Test', bar: MARKER }).toJSON()).toEqual({
				foo: 'Test',
				bar: { _kind: Kind.Marker },
			})

			expect(dict(dict({ foo: 'Test', bar: MARKER })).toJSON()).toEqual(
				dict({
					foo: 'Test',
					bar: { _kind: Kind.Marker },
				}).toJSON()
			)
		})
	}) // dict

	describe('grid', () => {
		it('makes grid', () => {
			expect(grid([{}]).toJSON()).toEqual(new HGrid([{}]).toJSON())

			expect(
				grid({
					_kind: Kind.Grid,
					meta: {},
					cols: [{ name: 'foo' }],
					rows: [{ foo: 'foo' }],
				})
			).toValEqual(
				new HGrid({
					cols: [{ name: 'foo' }],
					rows: [{ foo: 'foo' }],
				})
			)

			expect(
				grid(
					grid({
						_kind: Kind.Grid,
						meta: {},
						cols: [{ name: 'foo' }],
						rows: [{ foo: 'foo' }],
					})
				)
			).toValEqual(
				new HGrid({
					cols: [{ name: 'foo' }],
					rows: [{ foo: 'foo' }],
				})
			)
		})
	}) // grid

	describe('list', () => {
		it('makes list', () => {
			expect(list([{}]).toJSON()).toEqual([{}])

			expect(list([MARKER, 'foo', symbol('foo')]).toJSON()).toEqual([
				{ _kind: 'marker' },
				'foo',
				{ _kind: 'symbol', val: 'foo' },
			])

			expect(list(list([MARKER])).toJSON()).toEqual([{ _kind: 'marker' }])
		})
	}) // list

	describe('MARKER', () => {
		it('makes MARKER', () => {
			expect(MARKER.toJSON()).toEqual({ _kind: 'marker' })

			expect(MARKER).toStrictEqual(HMarker.make())
		})
	}) // MARKER

	describe('NA', () => {
		it('makes NA', () => {
			expect(NA.toJSON()).toEqual({ _kind: 'na' })

			expect(NA).toStrictEqual(HNa.make())
		})
	}) // NA

	describe('REMOVE', () => {
		it('makes REMOVE', () => {
			expect(REMOVE.toJSON()).toEqual({ _kind: 'remove' })

			expect(REMOVE).toStrictEqual(HRemove.make())
		})
	}) // REMOVE

	describe('num', () => {
		it('makes num', () => {
			expect(num(100).value).toEqual(100)

			expect(num(100, 's').toZinc()).toEqual('100s')

			expect(num({ _kind: Kind.Number, val: 100, unit: 's' })).toEqual(
				HNum.make(100, 's')
			)

			expect(num(num(100, 's')).toZinc()).toEqual('100s')
		})
	}) // num

	describe('ref', () => {
		it('makes ref', () => {
			expect(ref('abc').value).toEqual('abc')

			expect(ref({ _kind: Kind.Ref, val: 'abc' })).toEqual(
				HRef.make('abc')
			)

			expect(ref(ref('foo')).toZinc()).toEqual('@foo')
		})
	}) // ref

	describe('str', () => {
		it('makes str', () => {
			expect(str('abc').value).toEqual('abc')

			expect(str(str('foo'))).toEqual(HStr.make('foo'))
		})
	}) // str

	describe('time', () => {
		it('makes time', () => {
			expect(time(new Date('2009-11-09T15:39:00Z')).value).toEqual(
				'15:39:00'
			)

			expect(
				time({
					hours: 12,
					minutes: 1,
					seconds: 2,
				}).value
			).toEqual('12:01:02')

			expect(
				time({
					_kind: Kind.Time,
					val: '12:01:02',
				}).value
			).toEqual('12:01:02')

			expect(time(time('12:00:00'))).toEqual(HTime.make('12:00:00'))
		})
	}) // time

	describe('uri', () => {
		it('makes uri', () => {
			expect(uri('abc').value).toEqual('abc')

			expect(uri({ _kind: Kind.Uri, val: 'abc' })).toEqual(
				HUri.make('abc')
			)

			expect(uri(uri('foo')).toZinc()).toEqual('`foo`')
		})
	}) // uri

	describe('xstr', () => {
		it('makes xstr', () => {
			expect(xstr('foo', 'abc').value).toEqual('abc')

			expect(xstr({ _kind: Kind.XStr, type: 'foo', val: 'abc' })).toEqual(
				HXStr.make('foo', 'abc')
			)

			expect(xstr(xstr('foo')).toZinc()).toEqual('foo("")')
		})
	}) // uri
})

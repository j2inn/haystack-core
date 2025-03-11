/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { TrioWriter } from '../../src/core/TrioWriter'
import { HDict } from '../../src/core/dict/HDict'
import { HMarker } from '../../src/core/HMarker'
import { HStr } from '../../src/core/HStr'
import { HBool } from '../../src/core/HBool'
import { HList } from '../../src/core/list/HList'
import { HGrid } from '../../src/core/grid/HGrid'

describe('TrioWriter', function (): void {
	let writer: TrioWriter

	function makeDict(): HDict {
		return HDict.make({
			marker: HMarker.make(),
			str: HStr.make('A string'),
			list: HList.make([HBool.make(true)]),
			dict: HDict.make({ foo: HStr.make('bar') }),
		})
	}

	beforeEach(function (): void {
		writer = new TrioWriter()
	})

	describe('#addDict()', function (): void {
		it('adds a dict', function (): void {
			const dict = makeDict()

			writer.addDict(dict)

			expect(writer.toTrio()).toBe(
				'marker\nstr: "A string"\nlist: [T]\ndict: {foo:"bar"}\n---'
			)
		})

		it('adds a dict with an inner grid', function (): void {
			const dict = HDict.make({
				grid: HGrid.make([{ foo: 'bar', boo: 1 }]),
			})

			writer.addDict(dict)

			expect(writer.toTrio()).toBe(
				'grid:Zinc:\n  ver:"3.0"\n  foo,boo\n  "bar",1\n---'
			)
		})
	}) // #addDict()

	describe('#addGrid()', function (): void {
		it('adds all the dicts from a grid', function (): void {
			const grid = HGrid.make({ rows: [makeDict(), makeDict()] })

			writer.addGrid(grid)

			expect(writer.toTrio()).toBe(
				'marker\n' +
					'str: "A string"\n' +
					'list: [T]\n' +
					'dict: {foo:"bar"}\n' +
					'---\n' +
					'marker\n' +
					'str: "A string"\n' +
					'list: [T]\n' +
					'dict: {foo:"bar"}\n' +
					'---'
			)
		})
	}) // #addGrid()

	describe('#addComment()', function (): void {
		it('writes a multi-line comment', function (): void {
			writer
				.addComment('This is a comment')
				.addComment('This is another comment')

			expect(writer.toTrio()).toBe(
				'// This is a comment\n// This is another comment'
			)
		})
	}) // #addComment()

	describe('#addNewLine()', function (): void {
		it('writes a new line', function (): void {
			writer
				.addComment('This is a comment')
				.addNewLine()
				.addComment('This is another comment')

			expect(writer.toTrio()).toBe(
				'// This is a comment\n\n// This is another comment'
			)
		})
	}) // #addNewLine()

	describe('#toTrio()', function (): void {
		it('writes a large multi-line trio document with comments and new lines', function (): void {
			writer
				.addComment()
				.addComment('Copyright J2 Innovations')
				.addComment()
				.addNewLine()
				.addDict(makeDict())
				.addNewLine()
				.addComment('The second dict...')
				.addDict(makeDict())

			expect(writer.toTrio()).toBe(
				'//\n' +
					'// Copyright J2 Innovations\n' +
					'//\n' +
					'\n' +
					'marker\n' +
					'str: "A string"\n' +
					'list: [T]\n' +
					'dict: {foo:"bar"}\n' +
					'---\n' +
					'\n' +
					'// The second dict...\n' +
					'marker\n' +
					'str: "A string"\n' +
					'list: [T]\n' +
					'dict: {foo:"bar"}\n' +
					'---'
			)
		})
	}) // #toTrio()

	describe('.toTrioDict()', function (): void {
		it('writes a dict file to trio', function (): void {
			const trio = TrioWriter.toTrioDict(makeDict())

			expect(trio).toBe(
				'marker\n' +
					'str: "A string"\n' +
					'list: [T]\n' +
					'dict: {foo:"bar"}'
			)
		})

		it('writes multi-line strings', function (): void {
			const dict = HDict.make({
				bool: true,
				str: HStr.make('{\n  "foo": "bar"\n}'),
				num: 42,
			})

			const trio = TrioWriter.toTrioDict(dict, { multilineStrings: true })

			expect(trio).toBe(`bool: T
str: 
  {
    "foo": "bar"
  }
num: 42`)
		})

		it('writes multi-line strings for an empty string', function (): void {
			const dict = HDict.make({
				bool: true,
				str: HStr.make(''),
				num: 42,
			})

			const trio = TrioWriter.toTrioDict(dict, { multilineStrings: true })

			expect(trio).toBe(`bool: T
str: 
  
num: 42`)
		})
	}) // .toTrioDict()

	describe('#toString()', function (): void {
		it('calls #toTrio()', function (): void {
			jest.spyOn(writer, 'toTrio').mockReturnValue('')
			writer.toString()
			expect(writer.toTrio).toHaveBeenCalled()
		})
	}) // #toString()
})

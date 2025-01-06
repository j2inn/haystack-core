/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { TrioReader } from '../../src/core/TrioReader'
import { HMarker } from '../../src/core/HMarker'
import { HNum } from '../../src/core/HNum'
import { HBool } from '../../src/core/HBool'
import { HStr } from '../../src/core/HStr'
import { HUri } from '../../src/core/HUri'
import { HRef } from '../../src/core/HRef'
import { HDate } from '../../src/core/HDate'
import { HDict } from '../../src/core/dict/HDict'
import { HSymbol } from '../../src/core/HSymbol'
import { HGrid } from '../../src/core/HGrid'
import { HList } from '../../src/core/HList'
import { Kind } from '../../src/core/Kind'
import '../matchers'
import '../customMatchers'
import { readFile } from '../file'

describe('TrioReader', function (): void {
	let trioColls: string
	let trioDict0: HDict
	let trioDict1: HDict
	let trioDict2: HDict

	beforeEach(function (): void {
		trioColls =
			'// Trio\n' +
			'type:list\n' +
			'val:[1,2,3]\n' +
			'\n' +
			'---\n' +
			'type:dict\n' +
			'val:{ dis:"Dict!" foo}\n' +
			'---\n' +
			'type:grid\n' +
			'val:Zinc:\n' +
			'  ver:"3.0"\n' +
			'  b,a\n' +
			'  20,10\n'

		trioDict0 = HDict.make({ type: 'list', val: [1, 2, 3] })
		trioDict1 = HDict.make({
			type: 'dict',
			val: { dis: 'Dict!', foo: { _kind: Kind.Marker } },
		})
		trioDict2 = HDict.make({
			type: 'grid',
			val: {
				_kind: Kind.Grid,
				rows: [{ b: 20, a: 10 }],
			},
		})
	})

	describe('#readDict()', function (): void {
		it('returns undefined for an empty string input', function (): void {
			expect(new TrioReader('').readDict()).toBeUndefined()
		})

		describe('reads a dict with a', function (): void {
			it('marker tag', function (): void {
				expect(new TrioReader('marker').readDict()).toValEqual(
					HDict.make({ marker: HMarker.make() })
				)
			})

			it('numeric value', function (): void {
				expect(new TrioReader('num:1').readDict()).toValEqual(
					HDict.make({ num: HNum.make(1) })
				)
			})

			it('numeric value with some space', function (): void {
				expect(new TrioReader('num: 1').readDict()).toValEqual(
					HDict.make({ num: HNum.make(1) })
				)
			})

			it('numeric value and unit', function (): void {
				expect(new TrioReader('num:123.4m').readDict()).toValEqual(
					HDict.make({ num: HNum.make(123.4, 'm') })
				)
			})

			it('boolean', function (): void {
				expect(new TrioReader('bool:T').readDict()).toValEqual(
					HDict.make({ bool: HBool.make(true) })
				)
			})

			it('null', function (): void {
				expect(new TrioReader('nullVal:N').readDict()).toValEqual(
					HDict.make({ nullVal: null })
				)
			})

			describe('string', function (): void {
				it('parses an inline string with quotes', function (): void {
					expect(
						new TrioReader('str:"this is a string"').readDict()
					).toValEqual(
						HDict.make({ str: HStr.make('this is a string') })
					)
				})

				it('parses a safe string without quotes', function (): void {
					expect(
						new TrioReader('str: this is a string').readDict()
					).toValEqual(
						HDict.make({ str: HStr.make('this is a string') })
					)
				})

				it('parses a multi-line string with double spaces', function (): void {
					expect(
						new TrioReader(
							'str:\n  first line\n  second line\n  third line'
						).readDict()
					).toValEqual(
						HDict.make({
							str: HStr.make(
								'first line\nsecond line\nthird line'
							),
						})
					)
				})

				it('parses a multi-line string with tabs', function (): void {
					expect(
						new TrioReader(
							'str:\n	first line\n	second line\n	third line'
						).readDict()
					).toValEqual(
						HDict.make({
							str: HStr.make(
								'first line\nsecond line\nthird line'
							),
						})
					)
				})

				it('parses a multi-line string with multiple new lines', function (): void {
					expect(
						new TrioReader(
							'str:\n	first line\n\n \n	second line\n	third line'
						).readDict()
					).toValEqual(
						HDict.make({
							str: HStr.make(
								'first line\nsecond line\nthird line'
							),
						})
					)
				})
			}) // string

			it('uri', function (): void {
				expect(new TrioReader('uri:`/foo`').readDict()).toValEqual(
					HDict.make({ uri: HUri.make('/foo') })
				)
			})

			it('ref', function (): void {
				expect(new TrioReader('ref:@foo').readDict()).toValEqual(
					HDict.make({ ref: HRef.make('foo') })
				)
			})

			it('symbol', function (): void {
				expect(new TrioReader('symbol:^foo').readDict()).toValEqual(
					HDict.make({ symbol: HSymbol.make('foo') })
				)
			})

			it('dict', function (): void {
				expect(new TrioReader('dict:{foo}').readDict()).toValEqual(
					HDict.make({ dict: HDict.make({ foo: HMarker.make() }) })
				)
			})

			it('list', function (): void {
				expect(new TrioReader('dict:[M]').readDict()).toValEqual(
					HDict.make({ dict: HList.make([HMarker.make()]) })
				)
			})

			describe('grid', function (): void {
				const dict = HDict.make({
					dict: HGrid.make({
						rows: [
							HDict.make({
								firstName: HStr.make('Jack'),
								bday: HDate.make('1973-07-23'),
							}),
							HDict.make({
								firstName: HStr.make('Jill'),
								bday: HDate.make('1975-11-15'),
							}),
						],
					}),
				})

				it('with an ending newline', function (): void {
					const trio =
						'dict:Zinc:\n' +
						'  ver:"3.0"\n' +
						'  firstName,bday\n' +
						'  "Jack",1973-07-23\n' +
						'  "Jill",1975-11-15\n'

					expect(new TrioReader(trio).readDict()).toValEqual(dict)
				})

				it('with no ending newline', function (): void {
					const trio =
						'dict:Zinc:\n' +
						'  ver:"3.0"\n' +
						'  firstName,bday\n' +
						'  "Jack",1973-07-23\n' +
						'  "Jill",1975-11-15'

					expect(new TrioReader(trio).readDict()).toValEqual(dict)
				})
			}) // grid

			it('multiple values', function (): void {
				expect(
					new TrioReader('marker\nstr: "a string"\nboo: T').readDict()
				).toValEqual(
					HDict.make({
						marker: HMarker.make(),
						str: HStr.make('a string'),
						boo: HBool.make(true),
					})
				)
			})

			describe('multi-line list', function (): void {
				it('parses a list of dicts', function (): void {
					// As taken from comment https://project-haystack.org/forum/topic/781
					expect(
						new TrioReader(
							'list: [\n  {this is one dict},\n  // this is a comment\n  {here is another},\n  ]'
						).readDict()
					).toValEqual(
						HDict.make({
							list: HList.make([
								HDict.make({
									this: HMarker.make(),
									is: HMarker.make(),
									one: HMarker.make(),
									dict: HMarker.make(),
								}),
								HDict.make({
									here: HMarker.make(),
									is: HMarker.make(),
									another: HMarker.make(),
								}),
							]),
						})
					)
				})

				it('parses a list of dicts that have commas', function (): void {
					// As taken from comment https://project-haystack.org/forum/topic/781
					expect(
						new TrioReader(
							'list: [\n  {this, is, one, dict},\n  {here, is, another},\n  ]'
						).readDict()
					).toValEqual(
						HDict.make({
							list: HList.make([
								HDict.make({
									this: HMarker.make(),
									is: HMarker.make(),
									one: HMarker.make(),
									dict: HMarker.make(),
								}),
								HDict.make({
									here: HMarker.make(),
									is: HMarker.make(),
									another: HMarker.make(),
								}),
							]),
						})
					)
				})
			}) // list

			it('skips a starting comment block and then reads a dict', function (): void {
				const trio = `// Test\n\n---------\ndef: ^lib:ph`

				expect(new TrioReader(trio).readDict()).toValEqual(
					HDict.make({ def: HSymbol.make('lib:ph') })
				)
			})
		}) // reads a dict

		it('ignores comments', function (): void {
			expect(new TrioReader('// A comment\nfoo').readDict()).toValEqual(
				HDict.make({ foo: HMarker.make() })
			)
		})

		describe('reads multiple dicts', function (): void {
			it('with a single dash separator', function (): void {
				const reader = new TrioReader('foo\n-\nboo')

				expect(reader.readDict()).toValEqual(
					HDict.make({ foo: HMarker.make() })
				)

				expect(reader.readDict()).toValEqual(
					HDict.make({ boo: HMarker.make() })
				)
			})

			it('with a multiple dashes', function (): void {
				const reader = new TrioReader('foo\n----------\nboo')

				expect(reader.readDict()).toValEqual(
					HDict.make({ foo: HMarker.make() })
				)

				expect(reader.readDict()).toValEqual(
					HDict.make({ boo: HMarker.make() })
				)
			})

			it('with different collections', function (): void {
				// Example from https://project-haystack.org/doc/Trio
				const reader = new TrioReader(trioColls)

				expect(reader.readDict()).toValEqual(trioDict0)
				expect(reader.readDict()).toValEqual(trioDict1)
				expect(reader.readDict()).toValEqual(trioDict2)
			})
		})
	}) // #readDict()

	describe('reads a trio file', function (): void {
		it('reads `axon.trio`', function (): void {
			const dicts = new TrioReader(readFile('axon.trio')).readAllDicts()

			expect(dicts.length).toBe(3)
		})

		it('reads `pointsAndEquip.trio`', function (): void {
			const dicts = new TrioReader(
				readFile('pointsAndEquip.trio')
			).readAllDicts()

			expect(dicts.length).toBe(1282)
		})
	})

	describe('#readAllDicts()', function (): void {
		it('returns an array of dicts', function (): void {
			const dicts = new TrioReader(trioColls).readAllDicts()

			expect(dicts.length).toBe(3)
			expect(dicts[0]).toValEqual(trioDict0)
			expect(dicts[1]).toValEqual(trioDict1)
			expect(dicts[2]).toValEqual(trioDict2)
		})
	}) // #readAllDicts()

	describe('.readAllDicts()', function (): void {
		it('returns an array of dicts', function (): void {
			const dicts = TrioReader.readAllDicts(trioColls)

			expect(dicts.length).toBe(3)
			expect(dicts[0]).toValEqual(trioDict0)
			expect(dicts[1]).toValEqual(trioDict1)
			expect(dicts[2]).toValEqual(trioDict2)
		})
	}) // .readAllDicts()

	describe('#readGrid()', function (): void {
		it('returns a grid of dicts', function (): void {
			expect(new TrioReader(trioColls).readGrid()).toValEqual(
				HGrid.make({
					rows: [trioDict0, trioDict1, trioDict2],
				})
			)
		})
	}) // #readGrid()

	describe('.readGrid()', function (): void {
		it('returns a grid of dicts', function (): void {
			expect(TrioReader.readGrid(trioColls)).toValEqual(
				HGrid.make({
					rows: [trioDict0, trioDict1, trioDict2],
				})
			)
		})
	}) // .readGrid()

	it('iterates dicts', function (): void {
		let count = 0

		const reader = new TrioReader(trioColls)

		for (const dict of reader) {
			if (count === 0) {
				expect(dict).toValEqual(trioDict0)
			} else if (count === 1) {
				expect(dict).toValEqual(trioDict1)
			} else if (count === 2) {
				expect(dict).toValEqual(trioDict2)
			}

			count++
		}

		expect(count).toBe(3)
	}) // iterates dicts
})

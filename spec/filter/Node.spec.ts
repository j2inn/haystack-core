/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-empty-function: "off" */

import {
	Node,
	CondOrNode,
	NodeType,
	CondAndNode,
	HasNode,
	ParensNode,
	MissingNode,
	CmpNode,
	ParentNode,
	LeafNode,
	isNode,
	IsANode,
	RelationshipNode,
	WildcardEqualsNode,
} from '../../src/filter/Node'
import { EvalContext } from '../../src/filter/EvalContext'
import { Token } from '../../src/filter/Token'
import { tokens } from '../../src/filter/tokens'
import { TokenObj } from '../../src/filter/TokenObj'
import { TokenValue } from '../../src/filter/TokenValue'
import { TokenType } from '../../src/filter/TokenType'
import { GenerateHaystackFilterVisitor } from '../../src/filter/GenerateHaystackFilterVisitor'
import { Kind } from '../../src/core/Kind'
import { HNum } from '../../src/core/HNum'
import { HStr } from '../../src/core/HStr'
import { HBool } from '../../src/core/HBool'
import { HRef } from '../../src/core/HRef'
import { TokenPaths } from '../../src/filter/TokenPaths'
import { makeValue } from '../../src/core/util'
import { HDict } from '../../src/core/dict/HDict'
import { HaysonDict } from '../../src/core/hayson'
import { HSymbol } from '../../src/core/HSymbol'
import { HMarker } from '../../src/core/HMarker'
import { TrioReader } from '../../src/core/TrioReader'
import { TokenRelationship } from '../../src/filter/TokenRelationship'
import { makeProjectHaystackNormalizer } from '../readDefs'

const {
	equals,
	notEquals,
	greaterThan,
	greaterThanOrEqual,
	lessThan,
	lessThanOrEqual,
} = tokens

describe('Node', function (): void {
	const trueBool = new TokenValue(TokenType.boolean, HBool.make(true))
	const falseBool = new TokenValue(TokenType.boolean, HBool.make(false))

	let context: EvalContext

	function makeContext(data: HaysonDict): EvalContext {
		return { dict: makeValue(data) as HDict }
	}

	beforeEach(function (): void {
		context = makeContext({})
	})

	describe('.isNode()', function (): void {
		it('returns true when object is a node', function (): void {
			expect(isNode(new CondOrNode([]))).toBe(true)
		})

		it('returns false when object is null', function (): void {
			expect(isNode(null)).toBe(false)
		})

		it('returns false when object is undefined', function (): void {
			expect(isNode(undefined)).toBe(false)
		})

		it('returns false when object is an object', function (): void {
			expect(isNode({})).toBe(false)
		})
	}) // .isNode()

	describe('ParentNode', function (): void {
		let node: TestParentNode

		class TestParentNode extends ParentNode {
			constructor(nodes: Node[]) {
				super(nodes)
			}

			get type(): NodeType {
				return NodeType.condOr
			}

			set childNodes(nodes: Node[]) {
				this.$nodes = nodes
			}

			accept(): void {}

			eval(): boolean {
				return false
			}
		}

		beforeEach(function (): void {
			node = new TestParentNode([new CondOrNode([])])
		})

		describe('#toJSON()', function (): void {
			it('creates JSON with child nodes encoded', function (): void {
				expect(node.toJSON()).toEqual({
					type: 'condOr',
					nodes: [
						{
							type: 'condOr',
						},
					],
				})
			})
		}) // #toJSON()

		describe('#acceptChildNodes()', function (): void {
			it('invokes accept on all child nodes', function (): void {
				const childNode = { accept: jest.fn() } as unknown as Node
				node.childNodes = [childNode]

				const visitor = new GenerateHaystackFilterVisitor()
				node.acceptChildNodes(visitor)

				expect(childNode.accept).toHaveBeenCalledWith(visitor)
			})
		}) // #acceptChildNodes()
	}) // ParentNode

	describe('LeafNode', function (): void {
		let node: Node

		class TestLeafNode extends LeafNode {
			constructor(tokens: Token[]) {
				super(tokens)
			}

			get type(): NodeType {
				return NodeType.condOr
			}

			accept(): void {}

			eval(): boolean {
				return false
			}
		}

		beforeEach(function (): void {
			node = new TestLeafNode([new TokenObj(TokenType.text, 'foo')])
		})

		describe('#toJSON()', function (): void {
			it('creates JSON with tokens encoded', function (): void {
				expect(node.toJSON()).toEqual({
					type: 'condOr',
					tokens: [
						{
							type: 'text',
							text: 'foo',
						},
					],
				})
			})
		}) // #toJSON()
	}) // LeafNode

	describe('CondOr', function (): void {
		let condOr: CondOrNode

		beforeEach(function (): void {
			condOr = new CondOrNode([])
		})

		describe('#eval()', function (): void {
			function setCondAnds(results: boolean[]): void {
				condOr.condAnds = results.map((res: boolean): CondAndNode => {
					const condAnd = { eval: jest.fn() }
					condAnd.eval.mockReturnValue(res)
					return condAnd as unknown as CondAndNode
				})
			}

			it('returns false if there are no child nodes', function (): void {
				expect(condOr.eval(context)).toBe(false)
			})

			it('returns true if only one child node returns true', function (): void {
				setCondAnds([true])
				expect(condOr.eval(context)).toBe(true)
			})

			it('returns true if one child out of many returns true', function (): void {
				setCondAnds([false, true, false])
				expect(condOr.eval(context)).toBe(true)
			})

			it('returns true if all children return true', function (): void {
				setCondAnds([true, true, true])
				expect(condOr.eval(context)).toBe(true)
			})

			it('returns false if all children return false', function (): void {
				setCondAnds([false, false, false])
				expect(condOr.eval(context)).toBe(false)
			})
		})
	}) // CondOr

	describe('CondAnd', function (): void {
		let condAnd: CondAndNode

		beforeEach(function (): void {
			condAnd = new CondAndNode([])
		})

		describe('#eval()', function (): void {
			function setTerms(results: boolean[]): void {
				condAnd.terms = results.map((res: boolean): HasNode => {
					const has = { eval: jest.fn() }
					has.eval.mockReturnValue(res)
					return has as unknown as HasNode
				})
			}

			it('returns false if there are no child nodes', function (): void {
				expect(condAnd.eval(context)).toBe(false)
			})

			it('returns true if only one child node returns true', function (): void {
				setTerms([true])
				expect(condAnd.eval(context)).toBe(true)
			})

			it('returns false if one child out of many returns true', function (): void {
				setTerms([false, true, false])
				expect(condAnd.eval(context)).toBe(false)
			})

			it('returns true if all children return true', function (): void {
				setTerms([true, true, true])
				expect(condAnd.eval(context)).toBe(true)
			})

			it('returns false if all children return false', function (): void {
				setTerms([false, false, false])
				expect(condAnd.eval(context)).toBe(false)
			})
		})
	}) // CondAnd

	describe('ParensNode', function (): void {
		let parens: ParensNode
		let condOr: CondOrNode

		beforeEach(function (): void {
			condOr = new CondOrNode([])
			jest.spyOn(condOr, 'eval')
			parens = new ParensNode(condOr)
		})

		describe('#eval()', function (): void {
			it('evaluates the condOr node', function (): void {
				parens.eval(context)
				expect(condOr.eval).toHaveBeenCalledWith(context)
			})
		})
	}) // ParensNode

	describe('HasNode', function (): void {
		let has: HasNode

		beforeEach(function (): void {
			has = new HasNode(new TokenObj(TokenType.text, 'foo'))
		})

		describe('#eval()', function (): void {
			it('returns false if the property does not exist', function (): void {
				expect(has.eval(context)).toBe(false)
			})

			it('returns true if the property exists', function (): void {
				context = makeContext({
					foo: true,
				})
				expect(has.eval(context)).toBe(true)
			})

			describe('for multiple levels', function (): void {
				beforeEach(function (): void {
					has = new HasNode(new TokenPaths(['foo', 'boo']))
				})

				it('returns true if the property exists at two levels', function (): void {
					context = makeContext({
						foo: {
							boo: true,
						},
					})

					expect(has.eval(context)).toBe(true)
				})

				it('returns false if the property does not exist at the first level', function (): void {
					context = makeContext({
						doo: {
							boo: true,
						},
					})

					expect(has.eval(context)).toBe(false)
				})

				it('returns false if the property does not exist at the second level', function (): void {
					context = makeContext({
						foo: {
							doo: true,
						},
					})

					expect(has.eval(context)).toBe(false)
				})
			}) // for multiple levels
		})
	}) // HasNode

	describe('MissingNode', function (): void {
		let missing: MissingNode

		beforeEach(function (): void {
			missing = new MissingNode(new TokenObj(TokenType.text, 'foo'))
		})

		describe('#eval()', function (): void {
			it('returns true if the property does not exist', function (): void {
				expect(missing.eval(context)).toBe(true)
			})

			it('returns false if the property exists', function (): void {
				context = makeContext({
					foo: true,
				})

				expect(missing.eval(context)).toBe(false)
			})

			describe('for multiple levels', function (): void {
				beforeEach(function (): void {
					missing = new MissingNode(new TokenPaths(['foo', 'boo']))
				})

				it('returns false if the property exists at two levels', function (): void {
					context = makeContext({
						foo: {
							boo: true,
						},
					})

					expect(missing.eval(context)).toBe(false)
				})

				it('returns true if the property does not exist at the first level', function (): void {
					context = makeContext({
						doo: {
							boo: true,
						},
					})

					expect(missing.eval(context)).toBe(true)
				})

				it('returns true if the property does not exist at the second level', function (): void {
					context = makeContext({
						foo: {
							doo: true,
						},
					})

					expect(missing.eval(context)).toBe(true)
				})
			}) // for multiple levels
		})
	}) // MissingNode

	describe('CmpNode', function (): void {
		let cmp: CmpNode

		beforeEach(function (): void {
			cmp = new CmpNode(
				new TokenObj(TokenType.text, 'foo'),
				equals,
				trueBool
			)
		})

		function setCmp(cmpOp: TokenObj, val: TokenValue): void {
			cmp.cmpOp = cmpOp
			cmp.val = val
		}

		it('returns false if the path does not exist', function (): void {
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path exists for boolean equals', function (): void {
			context = makeContext({
				foo: true,
			})

			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path exists for boolean equals and values differ in type', function (): void {
			context = makeContext({
				foo: 'true',
			})

			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path exists for boolean not equals', function (): void {
			context = makeContext({
				foo: true,
			})
			setCmp(notEquals, trueBool)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path exists for string equals', function (): void {
			context = makeContext({
				foo: 'test',
			})
			setCmp(equals, new TokenValue(TokenType.string, HStr.make('test')))
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path exists for string equals and values differ in type', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(equals, new TokenValue(TokenType.string, HStr.make('test')))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path exists for string not equals', function (): void {
			context = makeContext({
				foo: 'test',
			})
			setCmp(
				notEquals,
				new TokenValue(TokenType.string, HStr.make('test'))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path exists for number equals', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(equals, new TokenValue(TokenType.number, HNum.make(123)))
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path exists for number equals but the units differ', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				equals,
				new TokenValue(TokenType.number, HNum.make(123, 'm'))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path and units exists for number equals but there are no units', function (): void {
			context = makeContext({
				foo: { _kind: Kind.Number, val: 123, unit: 'm' },
			})
			setCmp(equals, new TokenValue(TokenType.number, HNum.make(123)))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path exists for number equals and the units match', function (): void {
			context = makeContext({
				foo: { _kind: Kind.Number, val: 123, unit: 'm' },
			})
			setCmp(
				equals,
				new TokenValue(TokenType.number, HNum.make(123, 'm'))
			)
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path exists for number equals and values differ in type', function (): void {
			context = makeContext({
				foo: '123',
			})
			setCmp(equals, new TokenValue(TokenType.number, HNum.make(123)))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path exists for number not equals', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(notEquals, new TokenValue(TokenType.number, HNum.make(123)))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path value is greater than value for greater than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThan,
				new TokenValue(TokenType.number, HNum.make(122))
			)
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path value is equal to value for greater than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThan,
				new TokenValue(TokenType.number, HNum.make(123))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path value is less than value for greater than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThan,
				new TokenValue(TokenType.number, HNum.make(124))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path value is greater than value for greater than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(122))
			)
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns true when path value is equal to value for greater than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(123))
			)
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path value is less than value for greater than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				greaterThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(124))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path value is greater than value for less than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(lessThan, new TokenValue(TokenType.number, HNum.make(122)))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns false when path value is equal to value for less than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(lessThan, new TokenValue(TokenType.number, HNum.make(123)))
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path value is less than value for less than', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(lessThan, new TokenValue(TokenType.number, HNum.make(124)))
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns false when path value is greater than value for less than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				lessThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(122))
			)
			expect(cmp.eval(context)).toBe(false)
		})

		it('returns true when path value is equal to value for less than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				lessThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(123))
			)
			expect(cmp.eval(context)).toBe(true)
		})

		it('returns true when path value is less than value for less than or equal', function (): void {
			context = makeContext({
				foo: 123,
			})
			setCmp(
				lessThanOrEqual,
				new TokenValue(TokenType.number, HNum.make(124))
			)
			expect(cmp.eval(context)).toBe(true)
		})
	}) // CmpNode

	describe('IsANode', function (): void {
		let isa: IsANode

		beforeEach(async () => {
			isa = new IsANode(
				new TokenValue(TokenType.symbol, HSymbol.make('air-output'))
			)

			const { normalizer } = await makeProjectHaystackNormalizer()
			const namespace = await normalizer.normalize()

			context = {
				dict: HDict.make({
					ahu: HMarker.make(),
					equip: HMarker.make(),
				}),
				namespace,
			}
		})

		it('returns true for an ahu that is a type of air-output', function (): void {
			expect(isa.eval(context)).toBe(true)
		})

		it('returns false for a point that is not a type of air-output', function (): void {
			context.dict = HDict.make({
				point: HMarker.make(),
			})
			expect(isa.eval(context)).toBe(false)
		})
	}) // IsANode

	describe('RelationshipNode', function (): void {
		let rel: RelationshipNode

		beforeEach(async () => {
			rel = new RelationshipNode(
				new TokenRelationship('inputs'),
				new TokenValue(TokenType.symbol, HSymbol.make('air'))
			)

			const { normalizer } = await makeProjectHaystackNormalizer()
			const namespace = await normalizer.normalize()

			context = {
				dict: HDict.make({
					ahu: HMarker.make(),
					airRef: HRef.make('@foo'),
				}),
				namespace,
			}
		})

		it('returns true when a entity outputs air', function (): void {
			expect(rel.eval(context)).toBe(true)
		})

		it('returns false when an entity does not output air', function (): void {
			context.dict.remove('airRef')
			expect(rel.eval(context)).toBe(false)
		})
	}) // RelationshipNode

	describe('WildcardEqualsNode', function (): void {
		let wc: WildcardEqualsNode
		let dicts: HDict[]
		let duct: HDict
		let fan: HDict
		let point: HDict

		const trio = `
			id: @ahu 
			ahu 
			equip
			---
			id: @duct 
			discharge 
			duct 
			equip 
			equipRef: @ahu
			---
			id: @fan 
			discharge 
			fan 
			motor 
			equip 
			equipRef: @duct
			---
			id: @point 
			discharge 
			fan 
			enable 
			cmd 
			point 
			equipRef: @fan`

		beforeEach(function (): void {
			wc = new WildcardEqualsNode(
				new TokenObj(TokenType.text, 'equipRef'),
				new TokenValue(TokenType.ref, HRef.make('ahu'))
			)

			dicts = new TrioReader(trio).readAllDicts()
			;[, duct, fan, point] = dicts

			context = {
				dict: point,
				resolve: (ref) => {
					for (const dict of dicts) {
						if (dict.get('id')?.equals(ref)) {
							return dict
						}
					}
					return undefined
				},
			}
		})

		it('returns true for an point that follows an ahu', function (): void {
			expect(wc.eval(context)).toBe(true)
		})

		it('returns true for an fan that follows an ahu', function (): void {
			context.dict = fan
			expect(wc.eval(context)).toBe(true)
		})

		it('returns true for a duct that follows an ahu', function (): void {
			context.dict = fan
			expect(wc.eval(context)).toBe(true)
		})

		it('returns true for an ahu that follows an ahu', function (): void {
			context.dict = fan
			expect(wc.eval(context)).toBe(true)
		})

		it('returns false for a fan that follows a point', function (): void {
			context.dict = fan
			wc = new WildcardEqualsNode(
				new TokenObj(TokenType.text, 'equipRef'),
				new TokenValue(TokenType.ref, HRef.make('point'))
			)

			expect(wc.eval(context)).toBe(false)
		})

		it('returns false for a duct that follows a point', function (): void {
			context.dict = duct
			wc = new WildcardEqualsNode(
				new TokenObj(TokenType.text, 'equipRef'),
				new TokenValue(TokenType.ref, HRef.make('point'))
			)

			expect(wc.eval(context)).toBe(false)
		})

		it('returns false when a circular ref loop happens (point->fan->point)', function (): void {
			// point references the fan so make the fan reference the point to form a loop.
			fan.set('equipRef', HRef.make('@point'))
			expect(wc.eval(context)).toBe(false)
		})
	}) // WildcardEqualsNode

	describe('EvalContext', function (): void {
		let valContext: EvalContext

		beforeEach(function (): void {
			valContext = makeContext({
				foo: true,
			})
		})

		it('returns true when foo is true', function (): void {
			const cmp = new CmpNode(
				new TokenObj(TokenType.text, 'foo'),
				equals,
				trueBool
			)

			expect(cmp.eval(valContext)).toBe(true)
		})

		it('returns false when foo is false', function (): void {
			const cmp = new CmpNode(
				new TokenObj(TokenType.text, 'foo'),
				equals,
				falseBool
			)

			expect(cmp.eval(valContext)).toBe(false)
		})

		it('returns false when foo does not exist', function (): void {
			const cmp = new CmpNode(
				new TokenObj(TokenType.text, 'goo'),
				equals,
				falseBool
			)

			expect(cmp.eval(valContext)).toBe(false)
		})

		it('returns true when a boolean is found at two levels', function (): void {
			valContext = makeContext({
				dict: {
					foo: true,
				},
			})

			const cmp = new CmpNode(
				new TokenPaths(['dict', 'foo']),
				equals,
				trueBool
			)

			expect(cmp.eval(valContext)).toBe(true)
		})

		it('returns false when a value is not found at a second level', function (): void {
			valContext = makeContext({
				dict: {
					foo: true,
				},
			})

			const cmp = new CmpNode(
				new TokenPaths(['dict', 'goo']),
				equals,
				trueBool
			)

			expect(cmp.eval(valContext)).toBe(false)
		})
	}) // EvalContext

	describe('ref list', function (): void {
		let dicts: HDict[]
		let ahu: HDict
		let duct: HDict
		let fan: HDict

		const trio = `
				id: @ahu
				dis: "ahu"
				testRef: [@floor, @point]
				---
				id: @duct
				dis: "duct"
				testRef: [@equip, @pipe]
				---
				id: @fan
				testRef: [@ahu, @duct]
				---
				id: @pipe
				dis: "pipe"
				---
				id: @equip
				dis: "equip"
				---
				id: @floor
				dis: "floor"
				---
				id: @point
				dis: "point"`

		beforeEach(function (): void {
			dicts = new TrioReader(trio).readAllDicts()
			;[ahu, duct, fan] = dicts

			context = {
				dict: fan,
				resolve: (ref) => {
					for (const dict of dicts) {
						if (dict.get('id')?.equals(ref)) {
							return dict
						}
					}
					return undefined
				},
			}
		})

		describe('has', function (): void {
			let has: HasNode

			beforeEach(function (): void {
				has = new HasNode(new TokenPaths(['testRef', 'foo']))
			})

			it('returns false when there is no foo tag on ahu or duct', function (): void {
				expect(has.eval(context)).toBe(false)
			})

			it('returns true when ahu has the foo marker tag', function (): void {
				ahu.set('foo', HMarker.make())
				expect(has.eval(context)).toBe(true)
			})

			it('returns true when duct has the foo marker tag', function (): void {
				duct.set('foo', HMarker.make())
				expect(has.eval(context)).toBe(true)
			})

			it('returns true when duct and ahu have the foo marker tag', function (): void {
				ahu.set('foo', HMarker.make())
				duct.set('foo', HMarker.make())
				expect(has.eval(context)).toBe(true)
			})
		}) // has

		describe('equals', function (): void {
			it('returns true when the filter dis equals "ahu" with single ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('ahu'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns true when the filter dis equals "ahu" with single ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('duct'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns false when the filter dis equals "foo" with single ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('foo'))
				)

				expect(cmp.eval(context)).toBe(false)
			})

			it('returns true when the filter dis not equals "foo" with single ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'dis']),
					tokens.notEquals,
					new TokenValue(TokenType.string, HStr.make('foo'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns true when the filter dis equals "pipe" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('pipe'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns true when the filter dis equals "pipe" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('equip'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns true when the filter dis equals "floor" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('floor'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns true when the filter dis equals "point" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('point'))
				)

				expect(cmp.eval(context)).toBe(true)
			})

			it('returns false when the filter dis equals "ahu" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.equals,
					new TokenValue(TokenType.string, HStr.make('ahu'))
				)

				expect(cmp.eval(context)).toBe(false)
			})

			it('returns true when the filter dis not equals "ahu" with double ref', function (): void {
				const cmp = new CmpNode(
					new TokenPaths(['testRef', 'testRef', 'dis']),
					tokens.notEquals,
					new TokenValue(TokenType.string, HStr.make('ahu'))
				)

				expect(cmp.eval(context)).toBe(true)
			})
		}) // equals single ref
	}) // ref list
}) // Node

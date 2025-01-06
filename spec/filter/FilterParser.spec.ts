/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

/* eslint no-console: "off" */

import { FilterParser } from '../../src/filter/FilterParser'
import { NodeData } from '../../src/filter/Node'
import { Token } from '../../src/filter/Token'
import { TokenObj } from '../../src/filter/TokenObj'
import { tokens } from '../../src/filter/tokens'
import { TokenType } from '../../src/filter/TokenType'
import { TokenPaths } from '../../src/filter/TokenPaths'
import { TokenValue } from '../../src/filter/TokenValue'
import { HBool } from '../../src/core/HBool'
import { HSymbol } from '../../src/core/HSymbol'
import { HRef } from '../../src/core/HRef'
import { TokenRelationship } from '../../src/filter/TokenRelationship'

const {
	eof,
	leftBrace,
	rightBrace,
	greaterThan,
	greaterThanOrEqual,
	lessThan,
	lessThanOrEqual,
	notEquals,
	equals,
	not,
	and,
	or,
	wildcardEq,
} = tokens

describe('FilterParser', function (): void {
	describe('#parse()', function (): void {
		let tokens: Token[]

		beforeEach(function (): void {
			tokens = []
		})

		function parseToJson(): NodeData {
			return new FilterParser((): Token => tokens.shift() || eof)
				.parse()
				.toJSON()
		}

		// function parseToJsonAndPrint(): NodeData {
		// 	const data = parseToJson()

		// 	console.log()
		// 	console.log(JSON.stringify(data, null, 2))
		// 	console.log()

		// 	return data
		// }

		it("parse 'foo'", function (): void {
			tokens = [new TokenObj(TokenType.text, 'foo')]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parse 'foo'

		it("parses 'foo or boo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				or,
				new TokenObj(TokenType.text, 'boo'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
								],
							},
						],
					},
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'boo',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo or boo'

		it("throws an error when parsing 'foo or'", function (): void {
			tokens = [new TokenObj(TokenType.text, 'foo'), or]

			expect((): void => {
				parseToJson()
			}).toThrow()
		}) // throws an errow when parsing 'foo or'

		it("parses 'foo or boo and goo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				or,
				new TokenObj(TokenType.text, 'boo'),
				and,
				new TokenObj(TokenType.text, 'goo'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
								],
							},
						],
					},
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'boo',
									},
								],
							},
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'goo',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo or boo and goo'

		it("parses 'foo and not boo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				and,
				new TokenObj(TokenType.text, 'not'),
				new TokenObj(TokenType.text, 'boo'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
								],
							},
							{
								type: 'missing',
								tokens: [
									{
										type: 'text',
										text: 'boo',
									},
								],
							},
						],
					},
				],
			}) // expect                                                                                                                                   )
		}) // parses 'foo and not boo'

		it("parses 'foo and (boo or goo)'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				and,
				leftBrace,
				new TokenObj(TokenType.text, 'boo'),
				or,
				new TokenObj(TokenType.text, 'goo'),
				rightBrace,
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'has',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
								],
							},
							{
								type: 'parens',
								nodes: [
									{
										type: 'condOr',
										nodes: [
											{
												type: 'condAnd',
												nodes: [
													{
														type: 'has',
														tokens: [
															{
																type: 'text',
																text: 'boo',
															},
														],
													},
												],
											},
											{
												type: 'condAnd',
												nodes: [
													{
														type: 'has',
														tokens: [
															{
																type: 'text',
																text: 'goo',
															},
														],
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo and (boo or goo)'

		it("throws an error when parsing 'foo and (boo or goo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				and,
				leftBrace,
				new TokenObj(TokenType.text, 'boo'),
				or,
				new TokenObj(TokenType.text, 'goo'),
			]

			expect((): void => {
				parseToJson()
			}).toThrow()
		}) // throws an error when parsing 'foo and (boo or goo'

		it("parses 'foo > 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				greaterThan,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'greaterThan',
										text: '>',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo > 23.3'

		it("parses 'foo >= 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				greaterThanOrEqual,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'greaterThanOrEqual',
										text: '>=',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo >= 23.3'

		it("parses 'foo < 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				lessThan,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'lessThan',
										text: '<',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo < 23.3'

		it("parses 'foo <= 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				lessThanOrEqual,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'lessThanOrEqual',
										text: '<=',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo <= 23.3'

		it("parses 'foo == 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				equals,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'equals',
										text: '==',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo = 23.3'

		it("parses 'foo != 23.3'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				notEquals,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'notEquals',
										text: '!=',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo != 23.3'

		it("parses 'foo == 23:50:32'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				equals,
				new TokenObj(TokenType.time, '23:50:32'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'equals',
										text: '==',
									},
									{
										type: 'time',
										text: '23:50:32',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo == 23:50:32'

		it("parses 'foo == 1979-05-28'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				equals,
				new TokenObj(TokenType.date, '1979-05-28'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'equals',
										text: '==',
									},
									{
										type: 'date',
										text: '1979-05-28',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo == 1979-05-28'

		it("parses 'foo == `/foo/boo`", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				equals,
				new TokenObj(TokenType.uri, '/foo/boo'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'text',
										text: 'foo',
									},
									{
										type: 'equals',
										text: '==',
									},
									{
										type: 'uri',
										text: '/foo/boo',
									},
								],
							},
						],
					},
				],
			}) // expect
		}) // parses 'foo == `/foo/boo`'

		it("parses '((test == true))'", function (): void {
			tokens = [
				leftBrace,
				leftBrace,
				new TokenObj(TokenType.text, 'test'),
				equals,
				new TokenValue(TokenType.boolean, HBool.make(true)),
				rightBrace,
				rightBrace,
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'parens',
								nodes: [
									{
										type: 'condOr',
										nodes: [
											{
												type: 'condAnd',
												nodes: [
													{
														type: 'parens',
														nodes: [
															{
																type: 'condOr',
																nodes: [
																	{
																		type: 'condAnd',
																		nodes: [
																			{
																				type: 'cmp',
																				tokens: [
																					{
																						type: 'text',
																						text: 'test',
																					},
																					{
																						type: 'equals',
																						text: '==',
																					},
																					{
																						type: 'boolean',
																						val: true,
																					},
																				],
																			},
																		],
																	},
																],
															},
														],
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			}) // export
		}) // ((test == true))

		it('throws an error when parsing an invalid not expression', function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				and,
				not,
				leftBrace,
				new TokenObj(TokenType.text, 'test'),
				equals,
				new TokenObj(TokenType.string, 'me'),
				rightBrace,
			]

			expect((): void => {
				parseToJson()
			}).toThrow()
		})

		it("throws an error when parsing 'foo boo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				new TokenObj(TokenType.text, 'goo'),
			]

			expect((): void => {
				parseToJson()
			}).toThrow()
		})

		it("throws an error when parsing 'foo = goo'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'foo'),
				equals,
				new TokenObj(TokenType.text, 'goo'),
			]

			expect((): void => {
				parseToJson()
			}).toThrow()
		}) // throws an error when parsing 'foo = goo'

		it("throws an error when parsing 'foo or'", function (): void {
			tokens = [new TokenObj(TokenType.text, 'foo'), or]

			expect((): void => {
				parseToJson()
			}).toThrow()
		}) // throws an error when parsing 'foo > goo'

		it("parses 'foo->boo == 23'", function (): void {
			tokens = [
				new TokenPaths(['foo', 'boo']),
				equals,
				new TokenObj(TokenType.number, '23.3'),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'cmp',
								tokens: [
									{
										type: 'paths',
										paths: ['foo', 'boo'],
									},
									{
										type: 'equals',
										text: '==',
									},
									{
										type: 'number',
										text: '23.3',
									},
								],
							},
						],
					},
				],
			})
		}) // parses 'foo->boo == 23'

		it("parses '^foo'", function (): void {
			tokens = [new TokenValue(TokenType.symbol, HSymbol.make('foo'))]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'isa',
								tokens: [
									{
										type: 'symbol',
										val: {
											_kind: 'symbol',
											val: 'foo',
										},
									},
								],
							},
						],
					},
				],
			})
		}) // parses '^foo'

		it("parses 'inputs?'", function (): void {
			tokens = [new TokenRelationship('inputs')]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'rel',
								tokens: [
									{
										type: 'rel',
										relationship: 'inputs',
									},
								],
							},
						],
					},
				],
			})
		}) // parses 'inputs?'

		it("parses 'equipRef *== @ahu'", function (): void {
			tokens = [
				new TokenObj(TokenType.text, 'equipRef'),
				wildcardEq,
				new TokenValue(TokenType.ref, HRef.make('ahu')),
			]

			expect(parseToJson()).toEqual({
				type: 'condOr',
				nodes: [
					{
						type: 'condAnd',
						nodes: [
							{
								type: 'wildcardEq',
								tokens: [
									{
										type: 'text',
										text: 'equipRef',
									},
									{
										type: 'ref',
										val: {
											_kind: 'ref',
											val: 'ahu',
										},
									},
								],
							},
						],
					},
				],
			})
		}) // parses 'equipRef *== @ahu'

		it("throws an error when 'equipRef *=='", function (): void {
			tokens = [new TokenPaths(['equipRef']), wildcardEq]

			expect((): void => {
				parseToJson()
			}).toThrow()
		}) // parses 'equipRef *== @ahu'
	}) // #parse()
}) // Parser

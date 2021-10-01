/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	Visitor,
	CondOrNode,
	CondAndNode,
	HasNode,
	MissingNode,
	ParensNode,
	CmpNode,
	IsANode,
} from '../../src/filter/Node'
import { tokens } from '../../src/filter/tokens'
import { TokenType } from '../../src/filter/TokenType'
import { HBool } from '../../src/core/HBool'
import { TokenValue } from '../../src/filter/TokenValue'
import { HSymbol } from '../../src/core/HSymbol'
const { eof } = tokens

describe('Visitor', function (): void {
	const trueBool = new TokenValue(TokenType.boolean, HBool.make(true))
	let visitor: Visitor

	beforeEach(function (): void {
		visitor = {
			visitCondOr: jest.fn(),
			visitCondAnd: jest.fn(),
			visitTerm: jest.fn(),
			visitHas: jest.fn(),
			visitMissing: jest.fn(),
			visitParens: jest.fn(),
			visitCmp: jest.fn(),
			visitIsA: jest.fn(),
		} as unknown as Visitor
	})

	it('visits a condition or node', function (): void {
		const node = new CondOrNode([])
		node.accept(visitor)
		expect(visitor.visitCondOr).toHaveBeenCalledWith(node)
	}) // visits a condition or node

	it('visits a condition and node', function (): void {
		const node = new CondAndNode([])
		node.accept(visitor)
		expect(visitor.visitCondAnd).toHaveBeenCalledWith(node)
	}) // visits a condition and node

	it('visits a has node', function (): void {
		const node = new HasNode(eof)
		node.accept(visitor)
		expect(visitor.visitHas).toHaveBeenCalledWith(node)
	}) // visits a has node

	it('visits a missing node', function (): void {
		const node = new MissingNode(eof)
		node.accept(visitor)
		expect(visitor.visitMissing).toHaveBeenCalledWith(node)
	}) // visits a missing node

	it('visits a parens node', function (): void {
		const node = new ParensNode(new CondOrNode([]))
		node.accept(visitor)
		expect(visitor.visitParens).toHaveBeenCalledWith(node)
	}) // visits a parens node

	it('visits a cmp node', function (): void {
		const node = new CmpNode(eof, eof, trueBool)
		node.accept(visitor)
		expect(visitor.visitCmp).toHaveBeenCalledWith(node)
	}) // visits a cmp node

	it('visits an isa node', function (): void {
		const node = new IsANode(
			new TokenValue(TokenType.symbol, HSymbol.make('foo'))
		)

		node.accept(visitor)
		expect(visitor.visitIsA).toHaveBeenCalledWith(node)
	}) // visits an isa node
}) // Visitor

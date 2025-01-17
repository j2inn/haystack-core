/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

/* eslint  @typescript-eslint/no-explicit-any: "off", @typescript-eslint/explicit-module-boundary-types: "off", 
  @typescript-eslint/no-empty-function: "off" */

import { Token } from './Token'
import { TokenObj } from './TokenObj'
import { TokenValue } from './TokenValue'
import { TokenType } from './TokenType'
import { TokenPaths } from './TokenPaths'
import { HaysonVal } from '../core/hayson'
import { EvalContext } from './EvalContext'
import { HVal } from '../core/HVal'
import { valueIsKind } from '../core/HVal'
import { Kind } from '../core/Kind'
import { HDict } from '../core/dict/HDict'
import { HRef } from '../core/HRef'
import { HSymbol } from '../core/HSymbol'
import { TokenRelationship } from './TokenRelationship'
import { HList } from '../core/list/HList'

/**
 * AWT Node Implementation for a Haystack Filter.
 *
 * Please see `Parser` for a description of the grammar being used.
 *
 * @module
 */

/**
 * Defines all the different node types in the hierarchy.
 *
 * Each type of node should declare and use a unique node type enumeration.
 */
export enum NodeType {
	condOr,
	condAnd,
	has,
	missing,
	parens,
	cmp,
	isa,
	rel,
	wildcardEq,
}

/**
 * JSON data representation of an AST node.
 */
export interface NodeData {
	/**
	 * The type of node. Each node has a unique identifier.
	 */
	type: string

	/**
	 * Any tokens the node might have.
	 */
	tokens?: {
		type: string
		[prop: string]: string | string[] | HaysonVal
	}[]

	/**
	 * Any child nodes the node might have.
	 */
	nodes?: NodeData[]
}

/**
 * A visitor interface used for working with a generated AST.
 *
 * Each type of node has a assign method that invokes the relevant visitor method.
 */
export interface Visitor {
	visitCondOr(node: CondOrNode): void

	visitCondAnd(node: CondAndNode): void

	visitParens(node: ParensNode): void

	visitHas(node: HasNode): void

	visitMissing(node: MissingNode): void

	visitCmp(node: CmpNode): void

	visitIsA(node: IsANode): void

	visitRelationship(node: RelationshipNode): void

	visitWildcardEquals(node: WildcardEqualsNode): void
}

/**
 * Returns true is the argument is a node.
 *
 * This method acts as a type guard for Node.
 *
 * @param node The object to test.
 * @returns true if the object is a node.
 */
export function isNode(node: any): node is Node {
	return !!(
		node &&
		typeof node.accept === 'function' &&
		typeof node.eval === 'function'
	)
}

const EMPTY_HVAL_ARRAY: readonly HVal[] = Object.freeze([])

/**
 * Get all the values from a path.
 *
 * @param context The evaluation context.
 * @param paths The path to find.
 * @returns The values found.
 */
function get(context: EvalContext, paths: string[]): readonly HVal[] {
	if (!paths.length) {
		return EMPTY_HVAL_ARRAY
	}

	const hvalue = context.dict.get(paths[0])

	if (!hvalue) {
		return EMPTY_HVAL_ARRAY
	}

	let hvalList: HVal[] = [hvalue]

	for (let i = 1; i < paths.length; ++i) {
		const newHvalList: HVal[] = []

		for (const hval of hvalList) {
			if (valueIsKind<HDict>(hval, Kind.Dict)) {
				// If a dict then simply look up a property.
				const newHval = hval.get(paths[i])

				if (newHval) {
					newHvalList.push(newHval)
				}
			} else if (typeof context.resolve === 'function') {
				if (valueIsKind<HRef>(hval, Kind.Ref)) {
					// If the value is a ref then look up the record. Then
					// resolve record before resolving the value from it.
					const newHVal = context.resolve(hval)?.get(paths[i])

					if (newHVal) {
						newHvalList.push(newHVal)
					}
				} else if (valueIsKind<HList>(hval, Kind.List)) {
					// If the value is a ref list then iterate through each
					// ref in the list.
					for (const val of hval) {
						if (valueIsKind<HRef>(val, Kind.Ref)) {
							const newHVal = context.resolve(val)?.get(paths[i])

							if (newHVal) {
								newHvalList.push(newHVal)
							}
						}
					}
				}
			}
		}

		hvalList = newHvalList

		if (!hvalList.length) {
			break
		}
	}

	return hvalList
}

/**
 * The interface for a Node.
 */
export interface Node {
	/**
	 * The type of node.
	 */
	type: NodeType

	/**
	 * @returns A JSON representation of the node.
	 */
	toJSON(): NodeData

	/**
	 * A list of tokens for this node.
	 */
	tokens: readonly Token[]

	/**
	 * A list of child nodes for this node.
	 */
	nodes: readonly Node[]

	/**
	 * Accept a visitor for this.
	 *
	 * Please note, each new subtype of Node must have a corresponding
	 * enumeration and visitor method.
	 *
	 * @param visitor The visitor for this node.
	 */
	accept(visitor: Visitor): void

	/**
	 * Accept the visitor on all child nodes.
	 *
	 * @param visitor The visitor for the child nodes.
	 */
	acceptChildNodes(visitor: Visitor): void

	/**
	 * Evaluate the node against the evaluation context
	 * and return the result.
	 *
	 * @param context The evaluation context.
	 * @returns the resultant evaluation.
	 */
	eval(context: EvalContext): boolean
}

/**
 * A node that contains child nodes and no tokens.
 */
export abstract class ParentNode implements Node {
	protected $nodes: Node[]

	protected constructor(nodes: Node[]) {
		this.$nodes = nodes
	}

	abstract get type(): NodeType

	get tokens(): readonly Token[] {
		return []
	}

	get nodes(): readonly Node[] {
		return this.$nodes
	}

	toJSON(): NodeData {
		const data: NodeData = {
			type: NodeType[this.type],
		}

		const nodes = this.nodes

		if (nodes && nodes.length) {
			data.nodes = nodes.map((node: Node): NodeData => node.toJSON())
		}

		return data
	}

	abstract accept(visitor: Visitor): void

	acceptChildNodes(visitor: Visitor): void {
		// By default, visit all child nodes.
		this.nodes.forEach((node: Node): void => node.accept(visitor))
	}

	abstract eval(context: EvalContext): boolean
}

/**
 * A node that contains no child nodes and has one of more tokens.
 */
export abstract class LeafNode implements Node {
	protected $tokens: Token[]

	protected constructor(tokens: Token[]) {
		this.$tokens = tokens
	}

	abstract get type(): NodeType

	get tokens(): readonly Token[] {
		return this.$tokens
	}

	get nodes(): readonly Node[] {
		return []
	}

	toJSON(): NodeData {
		const data: NodeData = {
			type: NodeType[this.type],
		}

		const tokens = this.tokens

		if (tokens && tokens.length) {
			data.tokens = tokens.map(
				(
					token: Token
				): {
					type: string
					[prop: string]: string | string[] | HaysonVal
				} => token.toJSON()
			)
		}

		return data
	}

	abstract accept(visitor: Visitor): void

	acceptChildNodes(): void {}

	abstract eval(context: EvalContext): boolean
}

/**
 * An OR condition node.
 */
export class CondOrNode extends ParentNode {
	constructor(condAnds: CondAndNode[]) {
		super(condAnds)
	}

	get type(): NodeType {
		return NodeType.condOr
	}

	get condAnds(): CondAndNode[] {
		return this.$nodes as CondAndNode[]
	}

	set condAnds(condAnds: CondAndNode[]) {
		this.$nodes = condAnds
	}

	accept(visitor: Visitor): void {
		visitor.visitCondOr(this)
	}

	eval(context: EvalContext): boolean {
		for (const condAnd of this.$nodes) {
			if (condAnd.eval(context)) {
				return true
			}
		}
		return false
	}
}

export type TermNode =
	| HasNode
	| MissingNode
	| ParensNode
	| CmpNode
	| IsANode
	| RelationshipNode
	| WildcardEqualsNode

/**
 * An AND condition node.
 */
export class CondAndNode extends ParentNode {
	constructor(terms: TermNode[]) {
		super(terms)
	}

	get type(): NodeType {
		return NodeType.condAnd
	}

	get terms(): TermNode[] {
		return this.$nodes as TermNode[]
	}

	set terms(terms: TermNode[]) {
		this.$nodes = terms
	}

	accept(visitor: Visitor): void {
		visitor.visitCondAnd(this)
	}

	eval(context: EvalContext): boolean {
		if (this.$nodes.length) {
			for (const node of this.$nodes) {
				if (!node.eval(context)) {
					return false
				}
			}
			return true
		}
		return false
	}
}

/**
 * A parentheses node.
 */
export class ParensNode extends ParentNode {
	constructor(condOr: CondOrNode) {
		super([condOr])
	}

	get type(): NodeType {
		return NodeType.parens
	}

	get condOr(): CondOrNode {
		return this.$nodes[0] as CondOrNode
	}

	set condOr(condOr: CondOrNode) {
		this.$nodes = [condOr]
	}

	accept(visitor: Visitor): void {
		visitor.visitParens(this)
	}

	eval(context: EvalContext): boolean {
		return this.$nodes[0].eval(context)
	}
}

/**
 * A has node.
 */
export class HasNode extends LeafNode {
	constructor(path: TokenObj | TokenPaths) {
		super([path])
	}

	get type(): NodeType {
		return NodeType.has
	}

	get path(): TokenObj | TokenPaths {
		return this.$tokens[0] as TokenObj
	}

	set path(path: TokenObj | TokenPaths) {
		this.$tokens[0] = path as TokenObj | TokenPaths
	}

	accept(visitor: Visitor): void {
		visitor.visitHas(this)
	}

	eval(context: EvalContext): boolean {
		return !!get(context, this.path.paths).length
	}
}

/**
 * A missing node.
 */
export class MissingNode extends LeafNode {
	constructor(path: TokenObj | TokenPaths) {
		super([path])
	}

	get type(): NodeType {
		return NodeType.missing
	}

	get path(): TokenObj | TokenPaths {
		return this.$tokens[0] as TokenObj | TokenPaths
	}

	set path(path: TokenObj | TokenPaths) {
		this.$tokens[0] = path as TokenObj | TokenPaths
	}

	accept(visitor: Visitor): void {
		visitor.visitMissing(this)
	}

	eval(context: EvalContext): boolean {
		return !get(context, this.path.paths).length
	}
}

/**
 * A comparison node.
 */
export class CmpNode extends LeafNode {
	constructor(path: TokenObj | TokenPaths, cmpOp: TokenObj, val: TokenValue) {
		super([path, cmpOp, val])
	}

	get path(): TokenObj | TokenPaths {
		return this.$tokens[0] as TokenObj | TokenPaths
	}

	set path(path: TokenObj | TokenPaths) {
		this.$tokens[0] = path as TokenObj | TokenPaths
	}

	get cmpOp(): TokenObj {
		return this.$tokens[1] as TokenObj
	}

	set cmpOp(cmpOp: TokenObj) {
		this.$tokens[1] = cmpOp
	}

	get val(): TokenValue {
		return this.$tokens[2] as TokenValue
	}

	set val(val: TokenValue) {
		this.$tokens[2] = val
	}

	get type(): NodeType {
		return NodeType.cmp
	}

	accept(visitor: Visitor): void {
		visitor.visitCmp(this)
	}

	eval(context: EvalContext): boolean {
		const value = this.val.value

		for (const pathValue of get(context, this.path.paths)) {
			if (pathValue.isKind(value.getKind())) {
				switch (this.cmpOp.type) {
					case TokenType.equals:
						if (pathValue.equals(value)) {
							return true
						}
						break
					case TokenType.notEquals:
						if (!pathValue.equals(value)) {
							return true
						}
						break
					case TokenType.greaterThan:
						if (pathValue.compareTo(value) === 1) {
							return true
						}
						break
					case TokenType.greaterThanOrEqual:
						if (pathValue.compareTo(value) >= 0) {
							return true
						}
						break
					case TokenType.lessThan:
						if (pathValue.compareTo(value) === -1) {
							return true
						}
						break
					case TokenType.lessThanOrEqual:
						if (pathValue.compareTo(value) <= 0) {
							return true
						}
						break
				}
			}
		}

		return false
	}
}

/**
 * An 'is a' node.
 */
export class IsANode extends LeafNode {
	constructor(val: TokenValue) {
		super([val])
	}

	get type(): NodeType {
		return NodeType.isa
	}

	get val(): TokenValue {
		return this.$tokens[0] as TokenValue
	}

	set val(val: TokenValue) {
		this.$tokens[0] = val
	}

	accept(visitor: Visitor): void {
		visitor.visitIsA(this)
	}

	eval(context: EvalContext): boolean {
		const value = this.val.value as HSymbol
		return !!context?.namespace?.reflect(context.dict)?.fits(value)
	}
}

function toRelationshipTokens(
	rel: TokenRelationship,
	term?: TokenValue,
	ref?: TokenValue
): Token[] {
	const tokens: Token[] = [rel]

	if (term) {
		tokens.push(term)
	}

	if (ref) {
		tokens.push(ref)
	}

	return tokens
}

/**
 * A relationship node.
 */
export class RelationshipNode extends LeafNode {
	constructor(rel: TokenRelationship, term?: TokenValue, ref?: TokenValue) {
		super(toRelationshipTokens(rel, term, ref))
	}

	get type(): NodeType {
		return NodeType.rel
	}

	get rel(): TokenRelationship {
		return this.$tokens[0] as TokenRelationship
	}

	set rel(val: TokenRelationship) {
		this.$tokens[0] = val
	}

	get term(): TokenValue | undefined {
		return this.$tokens.find((t) => t.type === TokenType.symbol) as
			| TokenValue
			| undefined
	}

	set term(term: TokenValue | undefined) {
		this.$tokens = toRelationshipTokens(this.rel, term, this.ref)
	}

	get ref(): TokenValue | undefined {
		return this.$tokens.find((t) => t.type === TokenType.ref) as
			| TokenValue
			| undefined
	}

	set ref(ref: TokenValue | undefined) {
		this.$tokens = toRelationshipTokens(this.rel, this.term, ref)
	}

	accept(visitor: Visitor): void {
		visitor.visitRelationship(this)
	}

	eval(context: EvalContext): boolean {
		const relName = this.rel.relationship
		const relTerm = this.term?.value as HSymbol
		const ref = this.ref?.value as HRef

		return !!context?.namespace?.hasRelationship({
			subject: context.dict,
			relName,
			relTerm,
			ref,
			resolve: context?.resolve,
		})
	}
}

/**
 * A wildcard equality node.
 */
export class WildcardEqualsNode extends LeafNode {
	constructor(path: TokenObj, ref: TokenValue) {
		super([path, ref])
	}

	get type(): NodeType {
		return NodeType.wildcardEq
	}

	get id(): TokenObj {
		return this.$tokens[0] as TokenObj
	}

	set id(path: TokenObj) {
		this.$tokens[0] = path as TokenObj
	}

	get ref(): TokenValue {
		return this.$tokens[1] as TokenValue
	}

	accept(visitor: Visitor): void {
		visitor.visitWildcardEquals(this)
	}

	eval(context: EvalContext): boolean {
		const wcRef = this.ref.value as HRef
		const paths = this.id.paths

		// Stop circular dependencies.
		const allRefs = new Set<string>()

		// Keep resolving until we find the reference we're looking.
		// Please note, this is purposely short circuited to only use the first value.
		// Therefore ref lists are not supported in this context.
		let ref = get(context, paths)[0]

		let matched = false

		while (valueIsKind<HRef>(ref, Kind.Ref)) {
			if (ref.equals(wcRef)) {
				matched = true
				break
			}

			if (context.resolve) {
				if (allRefs.has(ref.value)) {
					break
				}

				allRefs.add(ref.value)

				const dict = context.resolve(ref)

				if (dict) {
					ref = get({ ...context, dict }, paths)[0]
				} else {
					break
				}
			} else {
				break
			}
		}

		return matched
	}
}

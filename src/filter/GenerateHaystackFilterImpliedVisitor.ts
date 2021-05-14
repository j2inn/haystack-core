/*
 * Copyright (c) 2021, J2 Innovations. All Rights Reserved
 */

import { Kind } from '../core/Kind'
import { HList } from '../core/HList'
import { HSymbol } from '../core/HSymbol'
import { HNamespace } from '../core/HNamespace'
import { HDict } from '../core/HDict'
import { GenerateHaystackFilterVisitor } from './GenerateHaystackFilterVisitor'
import {
	HasNode,
	MissingNode,
	CmpNode,
	IsANode,
	RelationshipNode,
	WildcardEqualsNode,
} from './Node'
import { TokenPaths } from './TokenPaths'
import { valueIsKind } from '../core/HVal'
import { GenerateHaystackFilterV3Visitor } from './GenerateHaystackFilterV3Visitor'
import { HFilter } from './HFilter'
import { IMPLIED_BY } from '../core/util'

/**
 * Generates a Haystack Filter String by processing any implied tags rules.
 *
 * For instance, a haystack filter that uses implied tags can query a database
 * that contains records without the implied tags present.
 *
 * Warning: implied tags are currently considered experimental.
 */
export class GenerateHaystackFilterImpliedVisitor extends GenerateHaystackFilterVisitor {
	/**
	 * The readonly namespace.
	 */
	readonly #namespace: HNamespace

	/**
	 * The implied tags to look up.
	 *
	 * @param namespace The namespace used to query implied tags.
	 */
	public constructor(namespace: HNamespace) {
		super()
		this.#namespace = namespace
	}

	public visitHas(node: HasNode): void {
		let filter = node.path.toFilter()
		const paths = node.path.paths

		for (let i = 0; i < paths.length; ++i) {
			const impliedFilter = this.replaceImpliedTags(paths, i)

			if (impliedFilter) {
				filter = `(${filter} or ${impliedFilter})`
			}
		}

		this.append(filter)
	}

	public visitMissing(node: MissingNode): void {
		let filter = `not ${node.path.toFilter()}`
		const paths = node.path.paths

		for (let i = 0; i < paths.length; ++i) {
			const impliedFilter = this.replaceImpliedTags(paths, i, 'not ')

			if (impliedFilter) {
				filter = `(${filter} or ${impliedFilter})`
			}
		}

		this.append(filter)
	}

	public visitCmp(node: CmpNode): void {
		const paths = node.path.paths
		const valuePostfix = ` ${node.cmpOp.text} ${node.val.toFilter()}`

		let filter = `${node.path.toFilter()}${valuePostfix}`

		for (let i = 0; i < paths.length; ++i) {
			const impliedFilter = this.replaceImpliedTags(
				paths,
				i,
				'',
				valuePostfix
			)

			if (impliedFilter) {
				filter = `(${filter} or ${impliedFilter})`
			}
		}

		this.append(filter)
	}

	public visitIsA(node: IsANode): void {
		const filter = node.val.toFilter()

		// Convert the is a query to a large `has` query using Haystack v4 to v3 transpilation.
		const v3Node = HFilter.parse(filter)
		const v3Visitor = new GenerateHaystackFilterV3Visitor(this.#namespace)
		v3Node.accept(v3Visitor)
		const hasFilter = v3Visitor.filter

		// Now convert from the large `has` query into an implied filter check.
		// using an instance of this filter.
		const hasNode = HFilter.parse(hasFilter)
		const impliedVisitor = new GenerateHaystackFilterImpliedVisitor(
			this.#namespace
		)
		hasNode.accept(impliedVisitor)

		this.append(`(${filter} or ${impliedVisitor.filter})`)
	}

	public visitRelationship(node: RelationshipNode): void {
		const relationship = node.rel.relationship
		const valuePostfix = `${node.rel.term ? `-${node.rel.term}` : ''}?${
			node.ref ? ` ${node.ref.toFilter()}` : ''
		}`

		let filter = node.rel.toFilter()
		if (node.ref) {
			filter += ` ${node.ref.toFilter()}`
		}

		const impliedFilter = this.replaceImpliedTags(
			[relationship],
			0,
			'',
			valuePostfix
		)

		if (impliedFilter) {
			filter = `(${filter} or ${impliedFilter})`
		}

		this.append(filter)
	}

	public visitWildcardEquals(node: WildcardEqualsNode): void {
		const id = node.id.toFilter()
		const valuePostfix = ` *== ${node.ref.toFilter()}`

		let filter = `${id}${valuePostfix}`

		const impliedFilter = this.replaceImpliedTags([id], 0, '', valuePostfix)

		if (impliedFilter) {
			filter = `(${filter} or ${impliedFilter})`
		}

		this.append(filter)
	}

	/**
	 * Replace any implied tags with the necessary rules and values.
	 *
	 * @param paths The paths to the value being tested.
	 * @param index The current index of the path.
	 * @param prefix Any prefix to add before each path.
	 * @param valuePostfix Any postfix to include after the value.
	 * @returns The updated filter.
	 */
	private replaceImpliedTags(
		paths: string[],
		index: number,
		prefix = '',
		valuePostFix = ''
	): string {
		let filter = ''

		const path = paths[index]
		const impliedBy = this.getImpliedBy(this.#namespace.byName(path))

		if (impliedBy.length) {
			filter =
				prefix +
					impliedBy
						?.map((symbol, i) => {
							const newPaths = [...paths]
							newPaths[index] = symbol
							if (i > 0) {
								newPaths.splice(index + 1, newPaths.length)
							}
							let newFilter = new TokenPaths(newPaths).toFilter()
							if (i === 0) {
								newFilter = `${newFilter}${valuePostFix}`
							}
							return newFilter
						})
						.join(` and ${prefix}`) ?? path

			if (impliedBy.length > 1) {
				filter = `(${filter})`
			}
		}

		return filter
	}

	/**
	 * Returns a list of tags to imply the rule against.
	 *
	 * @param def The def to test.
	 * @returns An array of tag names.
	 */
	private getImpliedBy(def: HDict | undefined): string[] {
		const impliedBy = def?.get(IMPLIED_BY)

		return valueIsKind<HList<HSymbol>>(impliedBy, Kind.List)
			? impliedBy.map((symbol) => symbol.value)
			: []
	}
}

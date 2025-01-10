/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import {
	Visitor,
	CondOrNode,
	CondAndNode,
	ParensNode,
	HasNode,
	MissingNode,
	CmpNode,
	IsANode,
	RelationshipNode,
	WildcardEqualsNode,
} from './Node'

/**
 * Generates a Haystack Filter String.
 */
export class GenerateHaystackFilterVisitor implements Visitor {
	protected $filter = ''

	get filter(): string {
		return this.$filter
	}

	visitCondOr(node: CondOrNode): void {
		const condAnds = node.condAnds
		for (let i = 0; i < condAnds.length; ++i) {
			if (i > 0) {
				this.append('or')
			}
			condAnds[i].accept(this)
		}
	}

	visitCondAnd(node: CondAndNode): void {
		const terms = node.terms
		for (let i = 0; i < terms.length; ++i) {
			if (i > 0) {
				this.append('and')
			}
			terms[i].accept(this)
		}
	}

	visitParens(node: ParensNode): void {
		this.append('(')
		node.acceptChildNodes(this)
		this.$filter += ')'
	}

	visitHas(node: HasNode): void {
		this.append(node.path.toFilter())
	}

	visitMissing(node: MissingNode): void {
		this.append('not')
		this.append(node.path.toFilter())
	}

	visitCmp(node: CmpNode): void {
		this.append(node.path.toFilter())
		this.append(node.cmpOp.text)
		this.append(node.val.toFilter())
	}

	visitIsA(node: IsANode): void {
		this.append(node.val.toFilter())
	}

	visitRelationship(node: RelationshipNode): void {
		this.append(node.rel.toFilter())

		if (node.term) {
			this.append(node.term.toFilter())
		}

		if (node.ref) {
			this.append(node.ref.toFilter())
		}
	}

	visitWildcardEquals(node: WildcardEqualsNode): void {
		this.append(node.id.toFilter())
		this.append('*==')
		this.append(node.ref.toFilter())
	}

	protected append(str: string): void {
		if (this.$filter && this.lastChar !== '(') {
			this.$filter += ' '
		}

		this.$filter += str
	}

	protected get lastChar(): string {
		return this.$filter[this.$filter.length - 1]
	}
}

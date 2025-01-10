/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { TokenType } from './TokenType'
import { Token } from './Token'
import { HaysonVal } from '../core/hayson'

/**
 * A token that identifies a relationship query.
 */
export class TokenRelationship implements Token {
	/**
	 * The token type.
	 */
	readonly type: TokenType = TokenType.rel

	/**
	 * The relationship.
	 */
	readonly relationship: string

	/**
	 * Flag used to identify a token relationship object.
	 */
	readonly _isATokenRelationship = true

	/**
	 * Contructs a new token value.
	 *
	 * @param relationship The relationship.
	 * @param term The relationship term.
	 */
	constructor(relationship: string) {
		this.relationship = relationship
	}

	/**
	 * Returns true if the type matches this token's type.
	 *
	 * @param type The token type.
	 * @return True if the type matches.
	 */
	is(type: TokenType): boolean {
		return this.type === type
	}

	/**
	 * Returns true if the object matches this one.
	 *
	 * @param type The token type.
	 * @param text The text.
	 * @return True if the objects are equal.
	 */
	equals(token: Token): boolean {
		if (!_isATokenRelationship(token)) {
			return false
		}

		if (this.type !== token.type) {
			return false
		}

		if (this.relationship !== token.relationship) {
			return false
		}

		return true
	}

	/**
	 * @returns A string representation of the token.
	 */
	toString(): string {
		return this.toFilter()
	}

	/**
	 * @returns The encoded value that can be used in a haystack filter.
	 */
	toFilter(): string {
		return `${this.relationship}?`
	}

	/**
	 * @returns A JSON representation of the token.
	 */
	toJSON(): {
		type: string
		[prop: string]: string | string[] | HaysonVal
	} {
		return {
			type: TokenType[this.type],
			relationship: this.relationship,
		}
	}
}

/**
 * Test to see if the value is an instance of a token object.
 */
export function _isATokenRelationship(
	value: unknown
): value is TokenRelationship {
	return !!(value && (value as TokenRelationship)._isATokenRelationship)
}

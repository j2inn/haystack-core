/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-namespace: "off" */

import { HVal, isHVal } from '../src/core/HVal'

/**
 * A custom matcher for jest that compares two haystack values.
 *
 * @module
 */

export const matchers = {
	toValEqual: (
		actual: HVal,
		expected: HVal
	): { pass: boolean; message: () => string } => {
		if (!isHVal(actual)) {
			return {
				pass: false,
				message: (): string => 'Expected actual to be haystack value',
			}
		}

		if (!isHVal(expected)) {
			return {
				pass: false,
				message: (): string =>
					'Expected `expected` to be haystack value',
			}
		}

		if (actual.equals(expected)) {
			return {
				pass: true,
				message: (): string => 'Test passed',
			}
		} else {
			return {
				pass: false,
				message: (): string =>
					'Failed equality test for haystack values',
			}
		}
	},
}

expect.extend(matchers)

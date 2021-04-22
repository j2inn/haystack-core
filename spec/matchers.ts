/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

/* eslint @typescript-eslint/no-namespace: "off", 
	@typescript-eslint/no-explicit-any: "off", 
	@typescript-eslint/no-unused-vars: "off" */

export {}
export * from './customMatchers'

declare global {
	namespace jest {
		interface Matchers<R, T> {
			toValEqual(expected: any, expectationFailOutput?: any): boolean
		}
	}
}

/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { profile } from '../../src/util/profile'

class TestProfile {
	num = 1

	@profile()
	add(a: number, b: number): number {
		return a + b
	}

	@profile()
	async addAsync(a: number, b: number): Promise<number> {
		return a + b
	}

	@profile()
	async asyncError(): Promise<number> {
		throw new Error('Test error')
	}

	@profile()
	get numGetter(): number {
		return this.num
	}

	@profile()
	set numSetter(num: number) {
		this.num = num
	}
}

describe('profile', function (): void {
	let testProfile: TestProfile

	describe('ensure all profiled methods are called through properly', function (): void {
		beforeEach(function (): void {
			testProfile = new TestProfile()
		})

		it('adds two numbers together and returns the value', function (): void {
			expect(testProfile.add(1, 2)).toBe(3)
		})

		it('asynchronously adds two numbers together and returns the value', async function (): Promise<void> {
			await expect(testProfile.addAsync(1, 2)).resolves.toBe(3)
		})

		it('asynchronously throws an error', async function (): Promise<void> {
			await expect(testProfile.asyncError()).rejects.toEqual(
				new Error('Test error')
			)
		})

		it('gets a number', function (): void {
			expect(testProfile.numGetter).toBe(1)
		})

		it('sets a number', function (): void {
			testProfile.numSetter = 2
			expect(testProfile.num).toBe(2)
		})
	})
})

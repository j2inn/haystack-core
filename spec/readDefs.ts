/*
 * Copyright (c) 2024, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../src/core/dict/HDict'
import {
	HLib,
	HLibDict,
	HDefDict,
	HNormalizer,
	LibScanner,
} from '../src/core/HNormalizer'
import * as path from 'node:path'
import { readFile, readdir } from 'node:fs/promises'
import { TrioReader } from '../src/core/TrioReader'
import { NormalizationLogger } from '../src/core/NormalizationLogger'

/*
 * Please note, the defs for SkySpark are created via `bin/defc -output json /Users/garethjohnson/work/j2repos/haystack/haystack-defs`
 */

/**
 * Make a new normalizer that maps to the local project haystack trio files.
 */
export async function makeProjectHaystackNormalizer(): Promise<{
	libs: HLib[]
	scanner: LibScanner
	logger: NormalizationLogger
	normalizer: HNormalizer
}> {
	const libs: HLib[] = [
		await readLib('ph'),
		await readLib('phScience'),
		await readLib('phIoT'),
		await readLib('phIct'),
	]

	const scanner = (): Iterable<Promise<HLib>> =>
		libs.map(async (lib): Promise<HLib> => lib)

	const logger = {
		warning: jest.fn(),
		error: jest.fn(),
		fatal: jest.fn().mockReturnValue(new Error()),
	}

	const normalizer = new HNormalizer(scanner, logger)

	return { libs, scanner, logger, normalizer }
}

/**
 * Asynchronously read a lib from the file system.
 *
 * @param libName The name of the lib to read.
 * @returns A lib.
 */
export async function readLib(libName: string): Promise<HLib> {
	const trioDirPath = path.join(__dirname, `./files/libs/${libName}`)

	let dirs = await readdir(trioDirPath)

	dirs = dirs.filter((dir) => path.extname(dir).toLowerCase() === '.trio')

	const lib = new TrioReader(
		(await readFile(path.join(trioDirPath, './lib.trio'))).toString('utf8')
	).readDict() as HLibDict

	const dicts = (
		await Promise.all(
			dirs.map(
				(dir): Promise<Buffer> => readFile(path.join(trioDirPath, dir))
			)
		)
	)
		.map((buf): HDict[] => TrioReader.readAllDicts(buf.toString('utf8')))
		.reduce((prev, cur) => prev.concat(cur), []) as HDefDict[]

	return {
		name: libName,
		lib,
		dicts,
	}
}

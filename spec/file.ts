/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */
const fs = require('fs')
const path = require('path')

/**
 * Read a file's text content and return it.
 *
 * @param file The file to read.
 * @returns The text from the file.
 */
export function readFile(file: string): string {
	const buff = fs.readFileSync(path.join(__dirname, `./files/${file}`))
	return buff.toString('utf8')
}

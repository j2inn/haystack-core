/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

const { readFile } = require('fs/promises')
const { HGrid, GridJsonStore } = require('../dist/index.es')

async function run() {
	const file = await readFile('./spec/files/skySparkDefs.json', 'utf-8')
	const json = JSON.parse(file)

	function doGrid(grid) {
		grid.meta.set('foo', 'bar')

		grid.length
		// for (const dict of grid.getRows()) {
		// 	dict.get('def')
		// }

		grid.toJSON()
	}

	function testOld() {
		const grid = HGrid.make({
			meta: json.meta,
			rows: json.rows,
			columns: json.cols,
		})
		doGrid(grid)
	}

	function testNew() {
		const grid = new HGrid(new GridJsonStore(json))
		doGrid(grid)
	}

	console.log('Priming (triggers JIT)...')
	for (let i = 0; i < 10_000; ++i) {
		testOld()
		testNew()
	}

	console.log('Running tests...')
	{
		const t0 = performance.now()
		testOld()
		const t1 = performance.now()
		console.log('Performance test old way: ' + (t1 - t0) + ' milliseconds.')
	}

	{
		let t0 = performance.now()
		testNew()
		const t1 = performance.now()
		console.log('Performance test new way: ' + (t1 - t0) + ' milliseconds.')
	}
}

run()

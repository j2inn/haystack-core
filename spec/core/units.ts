/*
 * Copyright (c) 2019, J2 Innovations. All Rights Reserved
 */

import { HUnit } from '../../src/core/HUnit'

export const celsius = new HUnit({
	ids: ['celsius', '°C'],
	scale: 1,
	offset: 273.15,
	dimensions: { kg: 0, m: 0, sec: 0, K: 1, A: 0, mol: 0, cd: 0 },
	quantity: 'temperature',
})

export const centimeter = new HUnit({
	ids: ['centimeter', 'cm'],
	scale: 0.01,
	offset: 0,
	dimensions: { kg: 0, m: 1, sec: 0, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'length',
})

export const fahrenheit = new HUnit({
	ids: ['fahrenheit', '°F'],
	scale: 0.5555555555555556,
	offset: 255.37222222222223,
	dimensions: { kg: 0, m: 0, sec: 0, K: 1, A: 0, mol: 0, cd: 0 },
	quantity: 'temperature',
})

export const hour = new HUnit({
	ids: ['hour', 'hr', 'h'],
	scale: 3600,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const joule = new HUnit({
	ids: ['joule', 'J'],
	scale: 1,
	offset: 0,
	dimensions: { kg: 1, m: 2, sec: -2, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'energy',
})

export const meter = new HUnit({
	ids: ['meter', 'm'],
	scale: 1,
	offset: 0,
	dimensions: { kg: 0, m: 1, sec: 0, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'length',
})

export const millisecond = new HUnit({
	ids: ['millisecond', 'ms'],
	scale: 0.001,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const minute = new HUnit({
	ids: ['minute', 'min'],
	scale: 60,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const second = new HUnit({
	ids: ['second', 'sec', 's'],
	scale: 1,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const square_centimeter = new HUnit({
	ids: ['square_centimeter', 'cm²'],
	scale: 0.0001,
	offset: 0,
	dimensions: { kg: 0, m: 2, sec: 0, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'area',
})

export const pound = new HUnit({
	ids: ['pound_sterling', 'GBP', '£'],
	scale: 1,
	offset: 0,
	quantity: 'currency',
})

export const square_mile = new HUnit({
	ids: ['square_mile', 'mile²'],
	scale: 2589988.110336,
	offset: 0,
	dimensions: { kg: 0, m: 2, sec: 0, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'area',
})

export const mile = new HUnit({
	ids: ['mile'],
	scale: 1609.344,
	offset: 0,
	dimensions: { kg: 0, m: 1, sec: 0, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'length',
})

export const byte = HUnit.define({
	ids: ['byte'],
	scale: 1,
	offset: 0,
	quantity: 'bytes',
})

export const megabyte = HUnit.define({
	ids: ['megabyte', 'MB'],
	scale: 1048576,
	offset: 0,
	quantity: 'bytes',
})

/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HUnit } from './HUnit'

/**
 * @module
 *
 * Defines all the time units required for number comparison.
 */

export const nanosecond = HUnit.define({
	ids: ['nanosecond', 'ns'],
	scale: 1e-9,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const microsecond = HUnit.define({
	ids: ['microsecond', 'µs'],
	scale: 0.000001,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const millisecond = HUnit.define({
	ids: ['millisecond', 'ms'],
	scale: 0.001,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const hundredthsSecond = HUnit.define({
	ids: ['hundredths_second', 'cs'],
	scale: 0.01,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const tenthsSecond = HUnit.define({
	ids: ['tenths_second', 'ds'],
	scale: 0.1,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const second = HUnit.define({
	ids: ['second', 'sec', 's'],
	scale: 1,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const minute = HUnit.define({
	ids: ['minute', 'min'],
	scale: 60,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const hour = HUnit.define({
	ids: ['hour', 'hr', 'h'],
	scale: 3600,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const day = HUnit.define({
	ids: ['day'],
	scale: 86400,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const week = HUnit.define({
	ids: ['week', 'wk'],
	scale: 604800,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const julianMonth = HUnit.define({
	ids: ['julian_month', 'mo'],
	scale: 2629800,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

export const year = HUnit.define({
	ids: ['year', 'yr'],
	scale: 31536000,
	offset: 0,
	dimensions: { kg: 0, m: 0, sec: 1, K: 0, A: 0, mol: 0, cd: 0 },
	quantity: 'time',
})

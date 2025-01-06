/*
 * Copyright (c) 2025, J2 Innovations. All Rights Reserved
 */

import { HDict } from '../dict/HDict'

export interface GridObj<DictVal extends HDict = HDict> {
	meta?: HDict
	columns?: { name: string; meta?: HDict }[]
	rows?: DictVal[]
	version?: string
}

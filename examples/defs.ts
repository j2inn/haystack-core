/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import * as hs from '../src/index'
import '../src/core/Array'
import { HGrid } from '../src/core/HGrid'
import { HDict } from '../src/core/HDict'
import { readFile } from '../spec/core/file'

const zinc = readFile('defsWithFeatures.zinc')
const grid = hs.zinc(zinc) as HGrid
const defs = hs.defs(grid)

// Play with defs...

const dicts = defs.subTypesOf('ahu')

console.log(dicts.map((dict: HDict): string => dict.defName))

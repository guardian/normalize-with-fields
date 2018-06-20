// @flow

import type { ChildrenMap } from './helpers';

import { normalize } from './normalize';
import { denormalize } from './denormalize';
import { createType, createFieldType } from './helpers';

const build = (schema: ChildrenMap) => ({
  normalize: normalize(schema),
  denormalize: denormalize(schema)
});

export { createType, createFieldType, build };

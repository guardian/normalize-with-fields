// @flow

/**
 * Creates a schema node
 */

type ChildrenMap = {
  [string]: SchemaNode
};

type SchemaNode = {
  type: string,
  children: ChildrenMap,
  field: ?Field,
  idKey: string,
  preProcess: (node: Object) => Object
};

type SchemaNodeOptions = {
  field?: ?Field,
  idKey?: string,
  preProcess?: (node: Object) => Object
};

const createType = (
  type: string,
  {
    field,
    idKey = 'id',
    preProcess = (node: Object) => ({ ...node })
  }: SchemaNodeOptions = {}
) => (children: ChildrenMap = {}): SchemaNode => ({
  type,
  children,
  field,
  idKey,
  preProcess
});

type Field = {
  type: string,
  key: string,
  // what we call children under a field level
  childrenKey?: string,
  // what we group these fields by, otherwise we'll keep the child key the same
  groupKey:? string,
  valueKey: string,
  uuid: ?() => string
};

type FieldOptions = {
  key?: string,
  childrenKey?: string,
  groupKey?: string,
  valueKey?: string,
  uuid?: () => string
};

/**
 * Creates a field spec
 */
const createFieldType = (
  type: string,
  {
    key = type,
    childrenKey,
    groupKey,
    valueKey = 'id',
    uuid
  }: FieldOptions = {}
): Field => ({
  type,
  key,
  childrenKey,
  groupKey,
  valueKey,
  uuid
});

export type { ChildrenMap, SchemaNode, Field };

export { createType, createFieldType };

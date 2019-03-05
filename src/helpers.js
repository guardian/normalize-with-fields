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
  preProcess: (node: Object, parents: Object[]) => Object,
  postProcess: (node: Object) => Object
};

type SchemaNodeOptions = {
  field?: ?Field,
  idKey?: string,
  preProcess?: (node: Object, parents: Object[]) => Object,
  postProcess?: (node: Object) => Object
};

const createType = (
  type: string,
  {
    field,
    idKey = 'id',
    preProcess = (node: Object) => ({ ...node }),
    postProcess = (node: Object) => ({ ...node })
  }: SchemaNodeOptions = {}
) => (children: ChildrenMap = {}): SchemaNode => ({
  type,
  children,
  field,
  idKey,
  preProcess,
  postProcess
});

type Field = {
  type: string,
  key: string,
  // what we call children under a field level
  childrenKey?: string,
  // what we group these fields by, otherwise we'll keep the child key the same
  groupKey: ?string,
  valueKey: string,
  uuid: ?() => string,
  defaultValue?: string
};

type FieldOptions = {
  key?: string,
  childrenKey?: string,
  groupKey?: string,
  valueKey?: string,
  uuid?: () => string,
  defaultValue?: string
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
    uuid,
    defaultValue
  }: FieldOptions = {}
): Field => ({
  type,
  key,
  childrenKey,
  groupKey,
  valueKey,
  uuid,
  defaultValue
});

export type { ChildrenMap, SchemaNode, Field };

export { createType, createFieldType };

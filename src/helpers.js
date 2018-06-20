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
  childrenKey: string,
  valueKey: string,
  uuid: ?() => string
};

type FieldOptions = {
  key?: string,
  childrenKey?: string,
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
    childrenKey = `${type}s`,
    valueKey = 'id',
    uuid
  }: FieldOptions = {}
): Field => ({
  type,
  key,
  childrenKey,
  valueKey,
  uuid
});

export type { ChildrenMap, SchemaNode, Field };

export { createType, createFieldType };

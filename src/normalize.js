// @flow

import { get, set, removeKey } from './utils/ObjectUtils';
import { createType } from './helpers';
import type { ChildrenMap, SchemaNode, Field } from './helpers';

/**
 * This adds a new schema level at the top of this schema node (which may not be
 * the root node) that is based around a field.
 * This function is aimed to create a schema that reflects the model created by
 * addFieldModelLevel, which adds a group into the heirarchy of the actual model
 */
const addFieldSchemaLevel = (schema, childKey) => {
  const {
    field: { type, valueKey, childrenKey, uuid },
    children,
    type: t,
    ...opts
  } = schema;
  return createType(type, { idKey: uuid ? 'uuid' : valueKey })({
    [childrenKey || t]: createType(t, { ...opts, field: null })(children)
  });
};

/** Creates a node in the heriarchy that represents a field, moving the value
 * from `field.key` to `field.valueKey` and creating a UUID if specified
 */
const createBaseFieldNodeFromChild = (child: Object, field) => ({
  [field.valueKey]: get(child, field.key),
  ...(field.uuid ? { uuid: field.uuid() } : {})
});

/**
 * This turns an array of children of a type to an array of parents representing
 * a field on that type with children pushed down to children of this (this
 * makes no sense)
 */
const addFieldModelLevel = (children, childSchema) => {
  const { field, type } = childSchema;
  const map = children.reduce(
    (childrenMap: { [string]: Object }, child: Object) => {
      const key = get(child, field.key);
      const prev =
        childrenMap[key] || createBaseFieldNodeFromChild(child, field);

      return {
        ...childrenMap,
        [key]: set(
          prev,
          field.childrenKey || type, // can be `a.b`
          [...(get(prev, field.childrenKey || type) || []), removeKey(child, field.key)]
        )
      };
    },
    {}
  );
  return Object.keys(map).map(key => (map[key]: Object));
};

type SchemaNodeWithField = $Diff<SchemaNode, { field: ?Field }> & {
  field: Field
};

/**
 * Does all the splicing in of a new 'field level' in the tree
 */
const modifyCandidatesForField = (
  childSchema: SchemaNodeWithField,
  model,
  children,
  childKey
) => ({
  childSchema: addFieldSchemaLevel(childSchema, childKey),
  model,
  children: addFieldModelLevel(children, childSchema)
});

type ChildrenSpecs = {
  [string]: string[]
};

type EnitityMap = {
  [string]: {
    [string]: Object
  }
};

/**
 * Takes a bunch of 'child specs' (keys and ids) and adds them to an entity
 */
const addChildIdsToEntity = (entity: Object, childrenSpec: ChildrenSpecs) =>
  Object.keys(childrenSpec).reduce(
    (acc: Object, key: string) => set(acc, key, childrenSpec[key]),
    entity
  );

/**
 * Adds an entity to a normalized state at a type / id position
 */
const addEntityToState = (state: EnitityMap, type, id: string, entity) => ({
  ...state,
  [type]: {
    ...state[type],
    [id]: entity
  }
});

/**
 * Adds an childId of type to children specs
 */
const addChildIdToChildrenSpecs = (
  childrenSpecs,
  childKey,
  id: string
): ChildrenSpecs => ({
  ...childrenSpecs,
  [childKey]: [...(childrenSpecs[childKey] || []), id]
});

/**
 * The core normalize function
 */
const normalize = (rootChildSchemas: ChildrenMap) => (rootModel: Object) => {
  const recurse = (childSchemas, model, state = {}) =>
    Object.keys(childSchemas).reduce(
      ([candidateModel, prevState, prevChildrenSpecs], childKey) => {
        const candidateChildSchema = childSchemas[childKey];
        const candidateChildren = get(candidateModel, childKey) || [];

        const { childSchema, model, children } = candidateChildSchema.field
          ? modifyCandidatesForField(
              ((candidateChildSchema: any): SchemaNodeWithField),
              candidateModel,
              candidateChildren,
              childKey
            )
          : {
              childSchema: candidateChildSchema,
              model: candidateModel,
              children: candidateChildren
            };

        const { type, idKey, preProcess } = childSchema;

        return [
          model,
          ...children.map(preProcess).reduce(
            ([state, childrenSpecs], candidateChild) => {
              const [child, childState, childChildrenSpecs] = recurse(
                childSchema.children || {},
                candidateChild,
                state
              );
              return [
                addEntityToState(
                  childState,
                  type,
                  child[idKey],
                  addChildIdsToEntity(child, childChildrenSpecs)
                ),
                addChildIdToChildrenSpecs(
                  childrenSpecs,
                  childKey,
                  child[childSchema.idKey]
                )
              ];
            },
            [prevState, prevChildrenSpecs]
          )
        ];
      },
      [model, state, {}]
    );

  const [model, state, childrenSpecs] = recurse(rootChildSchemas, rootModel);

  return {
    entities: state,
    result: addChildIdsToEntity(model, childrenSpecs)
  };
};

export { normalize };

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
const addFieldSchemaLevel = schema => {
  const { field, children, type, ...opts } = schema;
  return createType(field.type, {
    idKey: field.uuid ? 'uuid' : field.valueKey
  })({
    [field.childrenKey || type]: createType(type, { ...opts, field: null })(
      children
    )
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

      // TODO: if we build the schema when we call `build` we won't have to make
      // these checks every time we do this
      const childrenKey = field.childrenKey || type;

      return {
        ...childrenMap,
        [key]: set(
          prev,
          childrenKey, // can be `a.b`
          [...(get(prev, childrenKey) || []), removeKey(child, field.key)]
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
  children,
  childKey
) => ({
  childSchema: addFieldSchemaLevel(childSchema),
  children: addFieldModelLevel(children, childSchema),
  childKey: childSchema.field.groupKey || childKey
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

const removeChildChildKeys = (model: Object, childrenMap) =>
  (Object.keys(childrenMap): string[]).reduce(
    (acc, key): Object => removeKey(acc, key),
    model
  );

/**
 * The core normalize function
 */
const normalize = (rootChildSchemas: ChildrenMap) => (rootModel: Object) => {
  const recurse = (childSchemas, model, state = {}) =>
    Object.keys(childSchemas).reduce(
      ([model, prevState, prevChildrenSpecs], candidateChildKey) => {
        const candidateChildSchema = childSchemas[candidateChildKey];
        const candidateChildren = get(model, candidateChildKey) || [];

        const { childSchema, childKey, children } = candidateChildSchema.field
          ? modifyCandidatesForField(
              ((candidateChildSchema: any): SchemaNodeWithField),
              candidateChildren,
              candidateChildKey
            )
          : {
              childSchema: candidateChildSchema,
              children: candidateChildren,
              childKey: candidateChildKey
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
                  addChildIdsToEntity(
                    removeChildChildKeys(child, childSchema.children),
                    childChildrenSpecs
                  )
                ),
                addChildIdToChildrenSpecs(
                  childrenSpecs,
                  childKey,
                  child[childSchema.idKey]
                )
              ];
            },
            [
              prevState,
              {
                ...prevChildrenSpecs,
                [childKey]: []
              }
            ]
          )
        ];
      },
      [model, state, {}]
    );

  const [model, state, childrenSpecs] = recurse(rootChildSchemas, rootModel);

  return {
    entities: state,
    result: addChildIdsToEntity(
      removeChildChildKeys(model, rootChildSchemas),
      childrenSpecs
    )
  };
};

export { normalize };

const { get, set, removeKey } = require('./utils/ObjectUtils');
const { createType } = require('./helpers');

/**
 * This adds a new schema level at the top of this schema node (which may not be
 * the root node) that is based around a field.
 * This function is aimed to create a schema that reflects the model created by
 * addFieldModelLevel, which adds a group into the heirarchy of the actual model
 */
const addFieldSchemaLevel = (
  schema,
  { childrenKey, valueKey, uuid },
  childKey
) =>
  createType(childrenKey, { idKey: uuid ? 'uuid' : valueKey })({
    [childKey]: createType(
      schema.type,
      ['field', 'children', 'type'].reduce(
        (acc, key) => removeKey(acc, key),
        schema
      )
    )(schema.children)
  });

/** Creates a node in the heriarchy that represents a field, moving the value
 * from `field.key` to `field.valueKey` and creating a UUID if specified
 */
const createBaseFieldNodeFromChild = (child, field) => ({
  [field.valueKey]: get(child, field.key),
  ...(field.uuid ? { uuid: field.uuid() } : {})
});

/**
 * This turns an array of children of a type to an array of parents representing
 * a field on that type with children pushed down to children of this (this
 * makes no sense)
 */
const addFieldModelLevel = (children, field, childKey) =>
  Object.values(
    children.reduce(
      (childrenMap, child) => ({
        ...childrenMap,
        [get(child, field.key)]: set(
          createBaseFieldNodeFromChild(child, field),
          childKey, // can be `a.b`
          [
            ...(get(childrenMap[get(child, field.key)] || {}, childKey) || []),
            removeKey(child, field.key)
          ]
        )
      }),
      {}
    )
  );

/**
 * Does all the splicing in of a new 'field level' in the tree
 */
const modifyCandidatesForField = (childSchema, model, children, childKey) => ({
  childSchema: addFieldSchemaLevel(childSchema, childSchema.field, childKey),
  model: removeKey(model, childKey),
  children: addFieldModelLevel(children, childSchema.field, childKey),
  childKey: childSchema.field.childrenKey
});

/**
 * Takes a bunch of 'child specs' (keys and ids) and adds them to an entity
 */
const addChildIdsToEntity = (entity, childrenSpec) =>
  Object.entries(childrenSpec).reduce(
    (acc, [key, ids]) => set(acc, key, ids),
    entity
  );

/**
 * Adds an entity to a normalized state at a type / id position 
 */
const addEntityToState = (state, type, id, entity) => ({
  ...state,
  [type]: {
    ...state[type],
    [id]: entity
  }
});

/**
 * The core normalize function
 */
const normalize = rootSchema => rootModel => {
  const recurse = (parentSchema, model, state = {}) => {
    const { type, idKey } = parentSchema;

    const [childState, model1, childrenSpec] = Object.keys(
      parentSchema.children
    ).reduce(
      ([prevState, candidateModel, prevChildren], candidateChildKey) => {
        const candidateChildSchema = parentSchema.children[candidateChildKey];
        const candidateChildren = get(candidateModel, candidateChildKey) || [];

        const {
          childSchema,
          model,
          children,
          childKey
        } = candidateChildSchema.field
          ? modifyCandidatesForField(
              candidateChildSchema,
              candidateModel,
              candidateChildren,
              candidateChildKey
            )
          : {
              childSchema: candidateChildSchema,
              model: candidateModel,
              children: candidateChildren,
              childKey: candidateChildKey
            };

        const [childState, childIds] = children
          .map(childSchema.preProcess)
          .reduce(
            ([state, childIds], child) => [
              recurse(childSchema, child, state),
              [...childIds, child[childSchema.idKey]]
            ],
            [prevState, []]
          );

        return [
          childState,
          model,
          {
            ...prevChildren,
            [childKey]: [...(prevChildren[childKey] || []), ...childIds]
          }
        ];
      },
      [state, model, {}]
    );

    return addEntityToState(
      childState,
      type,
      model1[idKey],
      addChildIdsToEntity(model1, childrenSpec)
    );
  };

  return recurse(rootSchema, rootSchema.preProcess(rootModel));
};

module.exports = {
  normalize
};

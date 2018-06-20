const { get, set, removeKey } = require('./utils/ObjectUtils');

/**
 * Turns a model with a field spliced into the heirarchy back into a field
 */
const flattenLevelToField = (model, state, field, childKey) => ({
  ...model,
  [childKey]: (model[field.type] || []).reduce(
    (acc, fieldId) => [
      ...acc,
      ...(state[field.type][fieldId][childKey] || []).map(id => ({
        id,
        field: {
          key: field.key,
          value: state[field.type][fieldId][field.valueKey]
        }
      }))
    ],
    []
  )
});

const getEntityFromIdOrRef = (schema, state, ref) => {
  const { id, field } = typeof ref === 'object' ? ref : { id: ref };
  return field
    ? set(
        {
          ...state[schema.type][id]
        },
        field.key,
        field.value
      )
    : state[schema.type][id];
};

/**
 * Takes all the field keys off the model
 */
const removeFieldData = (model, childSchemas) =>
  Object.keys(childSchemas).reduce((model1, childKey) => {
    const childSchema = childSchemas[childKey];

    return childSchema.field
      ? removeKey(model1, childSchema.field.type)
      : model1;
  }, model);

/**
 * The core denormalize function
 */
const denormalize = rootChildSchemas => (rootEntity, _entities) => {
  const recurse = (childSchemas, entity, entities) => {
    const model = Object.keys(childSchemas).reduce(
      (candidateModel, childKey) => {
        const childSchema = childSchemas[childKey];

        const model = childSchema.field
          ? flattenLevelToField(
              candidateModel,
              entities,
              childSchema.field,
              childKey
            )
          : candidateModel;

        const childIds = get(model || {}, childKey) || [];

        const children = childIds.map(childId =>
          recurse(
            childSchemas[childKey].children,
            getEntityFromIdOrRef(childSchema, entities, childId),
            entities
          )
        );

        return set(model, childKey, children);
      },
      entity
    );
    return removeFieldData(model, childSchemas);
  };

  return recurse(rootChildSchemas, rootEntity, _entities);
};

module.exports = {
  denormalize
};

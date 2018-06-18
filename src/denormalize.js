const { get, set, removeKey } = require('./utils/ObjectUtils');

const flattenLevelToField = (model, state, field, childKey) => ({
  ...model,
  [childKey]: model[field.childrenKey].reduce(
    (acc, fieldId) => [
      ...acc,
      ...(state[field.childrenKey][fieldId][childKey] || []).map(id => ({
        id,
        field: {
          key: field.key,
          value: state[field.childrenKey][fieldId][field.valueKey]
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

const buildEntityChildren = (entity, schema, state, recurse) =>
  Object.keys(schema.children).reduce((candidateModel, childKey) => {
    const childSchema = schema.children[childKey];

    const model = childSchema.field
      ? flattenLevelToField(candidateModel, state, childSchema.field, childKey)
      : candidateModel;

    const childIds = get(model || {}, childKey) || [];

    const children = childIds.map(childId =>
      recurse(schema.children[childKey], state, childId, recurse)
    );

    return set(model, childKey, children);
  }, entity);

const removeFieldData = (model, schema) =>
  Object.keys(schema.children).reduce((model1, childKey) => {
    const childSchema = schema.children[childKey];

    return childSchema.field
      ? removeKey(model1, childSchema.field.childrenKey)
      : model1;
  }, model);

const denormalize = rootSchema => (rootState, rootId) => {
  const recurse = (schema, state, ref) => {
    const entity = getEntityFromIdOrRef(schema, state, ref);
    const model = buildEntityChildren(entity, schema, state, recurse);
    return removeFieldData(model, schema);
  };

  return recurse(rootSchema, rootState, rootId);
};

module.exports = {
  denormalize
};

// @flow

import { get, set, removeKey } from './utils/ObjectUtils';
import type { ChildrenMap, SchemaNode, Field } from './helpers';

type SchemaNodeWithField = $Diff<SchemaNode, { field: ?Field }> & {
  field: Field
};

/**
 * Turns a model with a field spliced into the heirarchy back into a field
 */
const flattenLevelToField = (model, childKey, state, { field, type }) => ({
  ...model,
  [childKey]: (model[field.groupKey || childKey] || []).reduce(
    (acc, fieldId: string) => [
      ...acc,
      ...(state[field.type][fieldId][field.childrenKey || type] || []).map(
        (id: string) => ({
          id,
          field: {
            key: field.key,
            value: state[field.type][fieldId][field.valueKey]
          }
        })
      )
    ],
    []
  )
});

type Ref = string | { id: string, field: { key: string, value: string } };

const getEntityFromIdOrRef = (schema, state, ref: Ref) => {
  const { id, field } =
    typeof ref === 'object' ? ref : { id: ref, field: null };
  return field
    ? set(state[schema.type][id], field.key, field.value)
    : state[schema.type][id];
};

/**
 * Takes all the field keys off the model
 */
const removeFieldData = (model, childSchemas) =>
  Object.keys(childSchemas).reduce((model1, childKey, _, arr) => {
    const { type, field } = childSchemas[childKey];

    if (!field) {
      return model1;
    }

    const fieldChildrenKey = field.childrenKey || type;
    const fieldParentKey = field.groupKey || childKey;

    return ([fieldChildrenKey, fieldParentKey]: string[])
      .filter(key => arr.indexOf(key) === -1)
      .reduce((acc, key): Object => removeKey(acc, key), model1);
  }, model);

type EnitityMap = {
  [string]: {
    [string]: Object
  }
};

/**
 * The core denormalize function
 */
const denormalize = (rootChildSchemas: ChildrenMap) => (
  rootEntity: Object,
  _entities: EnitityMap
) => {
  const recurse = (childSchemas, entity, entities) => {
    const model = Object.keys(childSchemas).reduce(
      (candidateModel, childKey) => {
        const childSchema = childSchemas[childKey];

        const model = childSchema.field
          ? flattenLevelToField(
              candidateModel,
              childKey,
              entities,
              ((childSchema: any): SchemaNodeWithField)
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

export { denormalize };

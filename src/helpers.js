/**
 * Creates a schema node
 */

const createType = (
  type,
  { field = null, idKey = 'id', preProcess = node => ({ ...node }) } = {}
) => (children = {}) => ({
  type,
  children,
  field,
  idKey,
  preProcess
});

/**
 * Creates a field spec
 */
const createField = (
  type,
  { key = type, childrenKey = `${type}s`, valueKey = 'id', uuid = null } = {}
) => ({
  type,
  key,
  childrenKey,
  valueKey,
  uuid
});

module.exports = {
  createType,
  createField
};

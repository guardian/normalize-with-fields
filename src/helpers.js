const createType = type => (
  children = {},
  { field = null, idKey = 'id', preProcess = node => ({ ...node }) } = {}
) => ({
  type,
  children,
  field,
  idKey,
  preProcess
});

const createField = type => ({
  key = type,
  childrenKey = `${type}s`,
  valueKey = 'id',
  uuid = null
} = {}) => ({
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

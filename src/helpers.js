const createType = type => (
  children = {},
  { field = null, idKey = "id" } = {}
) => ({
  type,
  children,
  field,
  idKey
});

const createField = type => ({
  key = type,
  childrenKey = `${type}s`,
  valueKey = "id",
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

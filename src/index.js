const { normalize } = require('./normalize');
const { denormalize } = require('./denormalize');
const { createType, createField } = require('./helpers');

const build = schema => ({
  normalize: normalize(schema),
  denormalize: denormalize(schema)
});

module.exports = { createType, createField, build };

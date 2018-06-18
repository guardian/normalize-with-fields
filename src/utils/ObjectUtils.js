const NONE_PROPERTY = Symbol();

const NONE = {
  [NONE_PROPERTY]: true
};

const get = (obj, key) => {
  const val = key.split('.').reduce((acc, key) => acc[key] || NONE, obj);

  return val[NONE_PROPERTY] ? null : val;
};

const set = (obj, key, val) => {
  const keys = key.split('.');

  const run = (o, ks, v) => {
    const [k, ...ks1] = ks;
    const val = ks1.length ? run(o[k] || {}, ks1, v) : v;
    return {
      ...o,
      [k]: val
    };
  };

  return run(obj, keys, val);
};

const removeKey = (obj, key) => {
  const keys = key.split('.');

  const run = (o, ks) => {
    const [k, ...ks1] = ks;
    const child = ks1.length ? run(o[k] || {}, ks1) : null;

    if (child) {
      return {
        ...o,
        [k]: child
      };
    }

    const { [k]: omit, ...o1 } = o;
    return o1;
  };

  return run(obj, keys);
};

module.exports = {
  get,
  set,
  removeKey
};

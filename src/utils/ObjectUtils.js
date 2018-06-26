// @flow

const NONE_PROPERTY = Symbol();

const NONE = {
  // $FlowFixMe computed properties
  [NONE_PROPERTY]: true
};

const get = (obj: Object, key: string) => {
  const val = key.split('.').reduce((acc, key) => acc[key] || NONE, obj);

  // $FlowFixMe computed properties
  return val[NONE_PROPERTY] ? null : (val: any);
};

const set = (obj: Object, key: string, val: any): Object => {
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

const removeKey = (obj: Object, key: string): Object => {
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

export { get, set, removeKey };

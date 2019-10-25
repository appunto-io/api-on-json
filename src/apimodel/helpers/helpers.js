const onUndefined = (value, defaultValue) => value === undefined ? defaultValue : value;

const objectMap = (object, mapFn) =>
  Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key], key);
    return result;
  }, {});

const keysMap = (array, mapFn) =>
  array.reduce((result, key) => {
    result[key] = mapFn(key);
    return result;
  }, {});

module.exports = {
  onUndefined,
  objectMap,
  keysMap
}

const mergeModels = (...models) => {
  const merge = (accumulator, source) => {

    if (accumulator === undefined) {return source;}

    if (source === undefined) {return accumulator;}

    if (Array.isArray(source) || Array.isArray(accumulator)) {
      source      = Array.isArray(source)      ? source      : [source];
      accumulator = Array.isArray(accumulator) ? accumulator : [accumulator];

      var merged = accumulator.concat(source);

      if (merged.length > 1) {
        merged = merged.filter((elem) => elem != false);
      }
      return merged
    }

    if (typeof accumulator !== 'object' || typeof source !== 'object') {
      return source;
    }

    Object.entries(source).forEach(([key, value]) => {
      if (value === null) {
        delete accumulator[key];
      }
      else {
        accumulator[key] = merge(accumulator[key], value);
      }
    });

    return accumulator;
  };

  return models.reduce((merging, model) => merge(merging, model), {});
};

module.exports = {
  mergeModels
}

const { objectMap } = require('../../apimodel/helpers/helpers.js');

const CALLBACK_PATTERN = '::';

const hydrate = (model, library, pattern = CALLBACK_PATTERN) =>
  (cbk => Array.isArray(model) ? model.map(cbk) : objectMap(model, cbk))(
    value => {
      if (typeof value === 'string' && value.startsWith(pattern)) {
        return library[value.split(pattern)[1]] || value;
      }
      else if (typeof value === 'object') {
        return hydrate(value, library, pattern);
      }
      return value;
    }
  );

module.exports = {
  CALLBACK_PATTERN,
  hydrate
}

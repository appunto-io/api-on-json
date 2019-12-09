const pick = require('lodash.pick');
const omit = require('lodash.omit');

const sanitizeAllow = (...args) => (data, flow) => flow.continue(pick(data, args));
const sanitizeRemove = (...args) => (data, flow) => flow.continue(omit(data, args));

module.exports = {
  sanitizeAllow,
  sanitizeRemove
}

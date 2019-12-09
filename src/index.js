const { DataModel, hydrate } = require('./datamodel/datamodel.js');
const { ApiModel }  = require('./apimodel/apimodel.js');
const { Server }    = require('./server/server.js');
const { Rethink,
        Mongo }     = require('./databases/databases.js')

const sanitizeAllow = (...args) => async (data, flow) => {
  const obj = {};
  args.forEach(name => {
    if (data[name]) {
      obj[name] = data[name];
    }
  });

  return flow.continue(obj);
}

const sanitizeRemove = (...args) => async (data, flow) => {
  const obj = {};

  Object.entries(data).forEach((name, value) => {
    if (!args.includes(name)) {
      obj[name] = value;
    }
  });

  return flow.continue(obj);
}

module.exports = {
  DataModel,
  ApiModel,
  Server,
  Rethink,
  Mongo,
  hydrate,
  sanitizeAllow,
  sanitizeRemove
};

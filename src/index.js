const { DataModel } = require('./datamodel/datamodel.js');
const { ApiModel }  = require('./apimodel/apimodel.js');
const { Server }    = require('./server/server.js');
const { Rethink,
        Mongo }     = require('./databases/databases.js')


module.exports = {
  DataModel,
  ApiModel,
  Server,
  Rethink,
  Mongo,
};

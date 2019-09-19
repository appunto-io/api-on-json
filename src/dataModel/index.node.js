const { compileDataModel } = require('./compiler.js');
const { dataModelToMongoose } = require('./mongoose');

module.exports = {
  compileDataModel,
  dataModelToMongoose
}

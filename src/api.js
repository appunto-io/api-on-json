const mongoose                                  = require('mongoose');
const { createServer }                          = require('./backend/index.js')
const { dataModelToMongoose, compileDataModel } = require('./dataModel/index.node.js');
const {
        createLibraryFromDataModel,
        createApiFromDataModel,
        compileApiModel,
        mergeModels,
        hydrate }                               = require('./apiModel/index.node.js');


class API {
  constructor(dataModel)
  {
    this.dataModels = [];
    this.apiModels  = [];

    this.addDataModel(dataModel);

    return this;
  }

  addDataModel(model) {
    const compiledDataModel = compileDataModel(model);

    this.dataModels.push(compiledDataModel);

    return this;
  }

  addApiModel(model) {
    const apiModel = compileApiModel(model);

    return this;
  }

  listen(port) {
    const mergedDataModel = this.dataModels.reduce(
      (reduced, model) => mergeModels(reduced, model),
      {}
    );

    const options = { useNewUrlParser : true , useUnifiedTopology: true, useFindAndModify: false};
    mongoose.connect("mongodb://localhost:27017/database", options);
    var db = mongoose.connection;

    const dbModel          = dataModelToMongoose(mergedDataModel, mongoose);
    const library          = createLibraryFromDataModel(dbModel);
    const apiModel         = createApiFromDataModel(mergedDataModel);
    const compiledApiModel = compileApiModel(apiModel);
    const api              = hydrate(compiledApiModel, library);

    this.apiModels.unshift(api);

    const mergedApiModel = this.apiModels.reduce(
      (reduced, model) => mergeModels(reduced, model),
      {}
    );

    const server = createServer(mergedApiModel);
    server.listen(port);

    return this;
  }
}

module.exports = API

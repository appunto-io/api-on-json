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
  constructor(dataModel, db)
  {
    this.dataModels = [];
    this.apiModels  = [];
    this.db = db;

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


    mongoose.connect(this.db.url, this.db.options);
    mongoose.connection;

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

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
    this.jwtSecret  = '--default-jwt-secret--';
    this.server;

    if (dataModel) {
      this.addDataModel(dataModel);
    }

    return this;
  }

  addDataModel(model) {
    const compiledDataModel = compileDataModel(model);

    this.dataModels.push(compiledDataModel);

    return this;
  }

  addApiModel(model) {
    this.apiModels.push(model);
    return this;
  }

  setJwtSecret(secret) {
    this.jwtSecret = secret;

    return this;
  }

  listen(port, mongoose) {
    const mergedDataModel = this.dataModels.reduce(
      (reduced, model) => mergeModels(reduced, model),
      {}
    );

    mongoose.connection;

    const dbModel          = dataModelToMongoose(mergedDataModel, mongoose); //////db
    const library          = createLibraryFromDataModel(dbModel);   //////DB
    const apiModel         = createApiFromDataModel(mergedDataModel);
    const compiledApiModel = compileApiModel(apiModel);
    const api              = hydrate(compiledApiModel, library);

    this.apiModels.unshift(api);

    const mergedApiModel = this.apiModels.reduce(
      (reduced, model) => mergeModels(reduced, model),
      {}
    );

    const server = createServer(mergedApiModel, {
      jwtSecret : this.jwtSecret
    });
    this.server = server;
    this.server.listen(port);
  }

  close() {
    this.server.close();
  }
}

module.exports = API

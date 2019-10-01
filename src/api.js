const { createServer }           = require('./server/server.js')
const { compileDataModel }       = require('./dataModel/index.node.js');
const {
        createLibraryFromDataModel,
        createApiFromDataModel,
        compileApiModel,
        mergeModels,
        hydrate }                = require('./apiModel/index.node.js');


class API {
  constructor(dataModel)
  {
    this.dataModels = [];
    this.apiModels  = [];
    this.jwtSecret  = '--default-jwt-secret--';
    this.server;
    this.database;

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

  setDatabase(db) {
    this.database = db;
    return this;
  }

  async listen(port) {
    /*
      Data model
     */
    const mergedDataModel = this.dataModels.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    /*
      API model
    */
    const apiModelFromDataModel         = createApiFromDataModel(mergedDataModel);
    const compiledApiModelFromDataModel = compileApiModel(apiModelFromDataModel);
    const dataModelLibrary              = createLibraryFromDataModel(mergedDataModel);
    const hydratedApiModel              = hydrate(compiledApiModelFromDataModel, dataModelLibrary);


    const mergedApiModel = [hydratedApiModel, ...this.apiModels].reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    /*
      Database
     */
    await this.database.connect();
    await this.database.init(mergedDataModel);

    /*
      Server
    */
    const server = createServer(
      mergedApiModel,
      {
        jwtSecret : this.jwtSecret,
        db        : this.database
      }
    );

    this.server = server;
    this.server.listen(port);
  }

  close() {
    this.server.close();
  }
}

module.exports = API

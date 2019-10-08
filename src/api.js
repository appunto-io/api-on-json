const { createServer }              = require('./server/server.js')
const { compileDataModel }          = require('./dataModel/compiler.js');
const { compileApiModel }           = require('./apiModel/compiler.js');
const { mergeModels }               = require('./apiModel/merge')
const { hydrate }                   = require('./apiModel/hydrate.js');
const { createLibraryFromDataModel,
        createApiFromDataModel }    = require('./apiModel/datamodel/data.js');


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
    const app = createServer(
      mergedApiModel,
      {
        jwtSecret : this.jwtSecret,
        db        : this.database
      }
    );

    this.server = app.listen(port);
  }

  close() {
    this.server.close();
  }
}

module.exports = API

const { createServer }                       = require('./server/server.js')
const { compileDataModel }                   = require('./dataModel/compiler.js');
const { compileApiModel }                    = require('./apiModel/compiler.js');
const { mergeModels }                        = require('./apiModel/merge')
const { hydrate }                            = require('./apiModel/hydrate.js');
const { createLibraryFromDataModel,
        createApiFromDataModel }             = require('./apiModel/datamodel/data.js');
const { createRealtimeApiFromDataModel,
        createRealtimeLibraryFromDataModel } = require('./apiModel/datamodel/dataRealtime.js');


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
    var mergedApiModel = {};

    if (Object.entries(mergedDataModel).length != 0) {
      const apiModelFromDataModel         = createApiFromDataModel(mergedDataModel);
      const realTimeApiModelFromDataModel = createRealtimeApiFromDataModel(mergedDataModel);

      const apiModel                 = mergeModels(apiModelFromDataModel, realTimeApiModelFromDataModel);
      const compiledApiModel         = compileApiModel(apiModel);
      const dataModelLibrary         = createLibraryFromDataModel(mergedDataModel);
      const realTimeDataModelLibrary = createRealtimeLibraryFromDataModel(mergedDataModel);
      const hydratedApiModel         = hydrate(compiledApiModel, {...dataModelLibrary, ...realTimeDataModelLibrary});

      if (hydratedApiModel.hasRealtime && (typeof this.database.observe != "function")) {
        console.warn('The database you are using can\'t use realTime');
        hydratedApiModel.hasRealtime = false;
      }
      mergedApiModel = [hydratedApiModel, ...this.apiModels].reduce(
        (reduced, model) => mergeModels(reduced, model), {}
      );
    }
    else {
      mergedApiModel = [...this.apiModels].reduce(
        (reduced, model) => mergeModels(reduced, model), {}
      );
    }

    /*
      Database
     */
     if (this.database) {
       await this.database.connect();
       await this.database.init(mergedDataModel);
     }

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

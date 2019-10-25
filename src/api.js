const { createServer }                       = require('./server/server.js')
const { compileApiModel }                    = require('./apimodel/helpers/compiler.js');
const { mergeModels }                        = require('./shared/merge.js')
const { hydrate }                            = require('./datamodel/helpers/hydrate.js');
const { compileDataModel }                   = require('./datamodel/helpers/compiler.js');
const { DataModel }                   = require('./datamodel/datamodel.js');

class API {
  constructor(dataModel)
  {
    this.dataModels = [];
    this.apiModels  = [];
    this.jwtSecret  = '--default-jwt-secret--';

    this.server;
    this.model;
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

    const dataModel = new DataModel(mergedDataModel);

    /*
      API model
    */
    var mergedApiModel = {};

    if (Object.entries(mergedDataModel).length != 0) {
      const opt = {};
      const hydratedApiModel         = dataModel.toApi(opt);

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

    mergedApiModel = compileApiModel(mergedApiModel);
    this.model = mergedApiModel;

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

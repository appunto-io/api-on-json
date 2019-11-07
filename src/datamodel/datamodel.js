const { compileDataModel }                   = require('./helpers/compiler.js');
const { hydrate }                            = require('./helpers/hydrate.js');
const { createApiFromDataModel,
        createLibraryFromDataModel }         = require('./helpers/data.js');
const { createRealtimeApiFromDataModel,
        createRealtimeLibraryFromDataModel } = require('./helpers/dataRealtime.js');
const { mergeModels }                        = require('../shared/merge.js')
const { ApiModel }                           = require('../apimodel/apimodel.js');

class DataModel {
  constructor(...dataModels)
  {
    this.models = [];
    dataModels.forEach(
      model => {
        if (model instanceof DataModel) {
          this.models = [...this.models, ...model.models];
        }
        else {
          this.models.push(compileDataModel(model))
        }
      }
    );
  }

  get() {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );
    return compileDataModel(merged);
  }

  addDataModel(...dataModels) {
    dataModels.forEach(
      model => {
        if (model instanceof DataModel) {
          this.models = [...this.models, ...model.models];
        }
        else {
          this.models.push(model)
        }
      }
    );
  }

  addCollection(collection, definition) {
    var newModel = {};
    newModel[collection] = definition;

    this.models.push(newModel);
  }

  addField(collection, field, definition) {
    var newModel = {};
    newModel[field] = definition;

    this.addCollection(collection, {schema: newModel});
  }

  removeColleciton(collection) {
    this.addCollection(collection, null)
  }

  removeField(collection, field) {
    this.addField(collection, field, null);
  }

  setOptions(collection, options) {
    this.addCollection(collection, options);
  }

  toApi(options) {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    if (options.realTime === false) {
      const apiModelFromDataModel = createApiFromDataModel(merged);
      const apiModel              = mergeModels(apiModelFromDataModel);
      const dataModelLibrary      = createLibraryFromDataModel(merged);

      const hydratedApiModel         = hydrate(apiModelFromDataModel, dataModelLibrary);

      return new ApiModel(hydratedApiModel);
    }
    else {
      const apiModelFromDataModel         = createApiFromDataModel(merged);
      const realTimeApiModelFromDataModel = createRealtimeApiFromDataModel(merged);

      const apiModel                 = mergeModels(apiModelFromDataModel, realTimeApiModelFromDataModel);
      const dataModelLibrary         = createLibraryFromDataModel(merged);
      const realTimeDataModelLibrary = createRealtimeLibraryFromDataModel(merged);
      const hydratedApiModel         = hydrate(apiModel, {...dataModelLibrary, ...realTimeDataModelLibrary});

      return new ApiModel(hydratedApiModel);
    }
  }
}

module.exports = { DataModel : DataModel }

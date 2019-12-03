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
          this.models.push(model)
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

  addModel(...dataModels) {
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

    return this;
  }

  addField(collection, field, definition) {
    var newModel = {};
    newModel[field] = definition;

    this.addCollection(collection, {schema: newModel});

    return this;
  }

  removeCollection(collection) {
    this.addCollection(collection, null);

    return this;
  }

  removeField(collection, field) {
    this.addField(collection, field, null);

    return this;
  }

  setOptions(collection, options) {
    this.addCollection(collection, {options});

    return this;
  }

  setType(collection, field, type) {
    this.addField(collection, field, {type: type});

    return this;
  }

  setRequired(collection, field, value) {
    this.addField(collection, field, {required: !!value});

    return this;
  }

  setUnique(collection, field, value) {
    this.addField(collection, field, {unique: !!value});

    return this;
  }

  toApi(options) {
    const merged = this.get();

    const apiModelFromDataModel = createApiFromDataModel(merged);
    const dataModelLibrary      = createLibraryFromDataModel(merged);
    let hydratedApiModel        = hydrate(apiModelFromDataModel, dataModelLibrary);

    if (options && options.realTime) {
      const realTimeApiModelFromDataModel = createRealtimeApiFromDataModel(merged, options.realTime);

      const apiModel                 = mergeModels(apiModelFromDataModel, realTimeApiModelFromDataModel);
      const dataModelLibrary         = createLibraryFromDataModel(merged);
      const realTimeDataModelLibrary = createRealtimeLibraryFromDataModel(merged);
      hydratedApiModel               = hydrate(apiModel, {...dataModelLibrary, ...realTimeDataModelLibrary});
    }

    return new ApiModel(hydratedApiModel);
  }
}

module.exports = {
  DataModel : DataModel,
  hydrate
}

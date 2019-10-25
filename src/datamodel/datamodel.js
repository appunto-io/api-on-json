const { compileDataModel }                   = require('./helpers/compiler.js');
const { hydrate }                            = require('./helpers/hydrate.js');
const { createApiFromDataModel,
        createLibraryFromDataModel }         = require('./helpers/data.js');
const { createRealtimeApiFromDataModel,
        createRealtimeLibraryFromDataModel } = require('./helpers/dataRealtime.js');
const { mergeModels }                        = require('../shared/merge.js')

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

  toApi(options) {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    const apiModelFromDataModel         = createApiFromDataModel(merged);
    const realTimeApiModelFromDataModel = createRealtimeApiFromDataModel(merged);

    const apiModel                 = mergeModels(apiModelFromDataModel, realTimeApiModelFromDataModel);
    const dataModelLibrary         = createLibraryFromDataModel(merged);
    const realTimeDataModelLibrary = createRealtimeLibraryFromDataModel(merged);
    const hydratedApiModel         = hydrate(apiModel, {...dataModelLibrary, ...realTimeDataModelLibrary});

    if (!options.realTime) {
      hydratedApiModel.hasRealtime = false;
    }

    return hydratedApiModel;
  }
}

module.exports = { DataModel : DataModel }

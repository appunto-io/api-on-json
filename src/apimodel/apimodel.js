const { compileApiModel }                    = require('./helpers/compiler.js');
const { mergeModels }                        = require('../shared/merge.js');
const { Server }                             = require('../server/server.js');

class ApiModel {
  constructor(...apiModels)
  {
    this.models = [];
    apiModels.forEach(
      model => {
        if (model instanceof ApiModel) {
          this.models = [...this.models, ...model.models];
        }
        else {
          this.models.push(compileApiModel(model));
        }
      }
    );
  }

  toServer(env) {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    return new Server(merged, env);
  }
}

module.exports = { ApiModel : ApiModel }

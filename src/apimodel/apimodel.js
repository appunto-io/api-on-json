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

  get() {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    return compileApiModel(merged);
  }

  addApiModel(...apiModels) {
    apiModels.forEach(
      model => {
        if (model instanceof ApiModel) {
          this.models = [...this.models, ...model.models];
        }
        else {
          this.models.push(model);
        }
      }
    );
  }

  addRoute(route, definition) {
    var newModel = {};
    var current  = newModel;

    if (route.includes('/')) {

      var paths = route.split('/');

      paths = paths.filter(value => value != '');

      for (let i = 0; i < paths.length; i++) {
        var path = '/' + paths[i];

        if (i + 1 === paths.length) {
          current[path] = definition;
        }
        else {
          current[path] = {};
        }

        current = current[path];
      }
    }
    else {
      newModel['/' + route] = definition;
    }

    this.models.push(newModel);
  }

  removeRoute(route) {
    this.addRoute(route, null);
  }

  addHandlers(route, handlers) {
    this.addRoute(route, handlers);
  }

  addFilters(route, filters) {
    this.addRoute(route, filters);
  }

  toServer(env) {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    const compiled = compileApiModel(merged);

    return new Server(compiled, env);
  }
}

module.exports = { ApiModel : ApiModel }

const { compileApiModel }                    = require('./helpers/compiler.js');
const { mergeModels }                        = require('../shared/merge.js');
const { Server }                             = require('../server/server.js');

class ApiModel {
  constructor(...apiModels) {
    this.models = [];

    this.addApiModel(...apiModels);
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
    let pathParts = route.split('/')
      .map(v => v.trim())
      .filter(v => v !== '');

    if (!pathParts.length) {return;}

    function iterate(pathParts, model) {
      const part    = pathParts.pop();
      const partDef = {[`/${part}`] : model};

      return pathParts.length ? iterate(pathParts, partDef) : partDef
    }

    const model = iterate(pathParts, definition);

    this.models.push(model);
  }

  removeRoute(route) {
    this.addRoute(route, null);
  }

  addHandler(route, handler) {
    this.addRoute(route, {handlers : [handler]});
  }

  addFilter(route, filter) {
    this.addRoute(route, {filters : [filter]});
  }

  setAuth(route, auth) {
    this.addRoute(route, {auth});
  }

  setRequiresAuth(route, value) {
    this.addRoute(route, {auth : {requireAuth : !!value}});
  }

  setRequiresRoles(route, roles) {
    roles = Array.isArray(roles) ? roles : [roles];
    // ...
  }
  // policies
  //

  toServer(env) {
    const compiled = this.get();

    if (compiled.hasRealtime && (env.db && typeof env.db.observe !== "function")) {
      console.warn('The database you are using can\'t use realTime');
      compiled.hasRealtime = false;
    }

    return new Server(compiled, env);
  }
}

module.exports = { ApiModel : ApiModel }

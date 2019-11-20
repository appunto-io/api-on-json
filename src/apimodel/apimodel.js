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

  addHandler(route, method, handler) {
    var obj = {};
    handler = Array.isArray(handler) ? handler : [handler];

    obj[method] = handler;

    this.addRoute(route, {handlers : obj});
  }

  addFilter(route, method, filter) {
    var obj = {};
    filter = Array.isArray(filter) ? filter : [filter];

    obj[method] = filter;

    this.addRoute(route, {filters : obj});
  }

  setAuth(route, auth) {
    this.addRoute(route, {auth});
  }

  setRequiresAuth(route, value) {
    this.addRoute(route, {auth : {requiresAuth : !!value}});
  }

  setRequiresRoles(route, roles) {
    if (roles) {
      roles = Array.isArray(roles) ? roles : [roles];
      this.addRoute(route, {auth : {requiresAuth: true, requiresRoles: roles}});
    }
  }

  addPolicies(route, policies) {
    if (policies) {
      policies = Array.isArray(policies) ? policies : [policies];
      this.addRoute(route, {auth: {policies}});
    }
  }

  addRealTimeHandler(route, realTimeHandlers) {
    if (realTimeHandlers) {
      this.addRoute(route, {realTime: realTimeHandlers});
    }
  }

  addConnectHandler(route, connect) {
    var obj = {};
    connect = Array.isArray(connect) ? connect : [connect];

    obj['connect'] = connect;

    this.addRoute(route, {realTime : obj});
  }

  addMessageHandler(route, message) {
    var obj = {};
    message = Array.isArray(message) ? message : [message];

    obj['message'] = message;

    this.addRoute(route, {realTime : obj});
  }

  addDisconnectHandler(route, disconnect) {
    var obj = {};
    disconnect = Array.isArray(disconnect) ? disconnect : [disconnect];

    obj['disconnect'] = disconnect;

    this.addRoute(route, {realTime : obj});
  }

  toServer(env) {
    const compiled = this.get();

    return new Server(compiled, env);
  }
}

module.exports = { ApiModel : ApiModel }

const { compileApiModel }                    = require('./helpers/compiler.js');
const { mergeModels }                        = require('../shared/merge.js');
const { Server }                             = require('../server/server.js');

class ApiModel {
  constructor(...apiModels) {
    this.models = [];
    this.middlewares = [];

    this.addModel(...apiModels);
  }

  get() {
    const merged = this.models.reduce(
      (reduced, model) => mergeModels(reduced, model), {}
    );

    return compileApiModel(merged);
  }

  addModel(...apiModels) {
    apiModels.forEach(
      model => {
        if (model.models && model.middlewares) {
          this.models = [...this.models, ...model.models];
          this.middlewares = [...this.middlewares , ...model.middlewares]
        }
        else {
          this.models.push(model);
        }
      }
    );

    return this;
  }

  addRoute(route, definition = {}) {
    if (route) {
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

    return this;
  }

  removeRoute(route) {
    if (route) {
      this.addRoute(route, null);
    }

    return this;
  }

  addHandler(route, method, handler) {
    if (route && method && handler) {
      var obj = {};
      handler = Array.isArray(handler) ? handler : [handler];

      obj[method] = handler;

      this.addRoute(route, {handlers : obj});
    }

    return this;
  }

  addFilter(route, method, filter) {
    if (method && filter) {
      var obj = {};
      filter = Array.isArray(filter) ? filter : [filter];

      obj[method] = filter;

      this.addRoute(route, {filters : obj});
    }

    return this;
  }

  setAuth(route, auth) {
    this.addRoute(route, {auth});

    return this;
  }

  setRequiresAuth(route, value) {
    this.addRoute(route, {auth : {requiresAuth : !!value}});

    return this;
  }

  setRequiresRoles(route, roles) {
    if (roles) {
      roles = Array.isArray(roles) ? roles : [roles];
      this.addRoute(route, {auth : {requiresAuth: true, requiresRoles: roles}});
    }

    return this;
  }

  addPolicies(route, policies) {
    if (policies) {
      policies = Array.isArray(policies) ? policies : [policies];
      this.addRoute(route, {auth: {policies}});
    }

    return this;
  }

  addRealTimeHandler(route, realTimeHandlers) {
    if (realTimeHandlers) {
      this.addRoute(route, {realTime: realTimeHandlers});
    }

    return this;
  }

  addConnectHandler(route, connect) {
    var obj = {};
    connect = Array.isArray(connect) ? connect : [connect];

    obj['connect'] = connect;

    this.addRoute(route, {realTime : obj});

    return this;
  }

  addMessageHandler(route, message) {
    var obj = {};
    message = Array.isArray(message) ? message : [message];

    obj['message'] = message;

    this.addRoute(route, {realTime : obj});

    return this;
  }

  addDisconnectHandler(route, disconnect) {
    var obj = {};
    disconnect = Array.isArray(disconnect) ? disconnect : [disconnect];

    obj['disconnect'] = disconnect;

    this.addRoute(route, {realTime : obj});

    return this;
  }

  addSecurity(name, options) {
    this.addModel({
      security: {
        [name]: options
      }
    });

    return this;
  }

  addMiddleware(middleware, route = '/') {
    this.middlewares.push({middleware, route});
  }

  applyMiddleware(app) {
    this.middlewares.forEach(({middleware, route}) => {
      app.use(route, middleware);
    });
  }

  toServer(env) {
    return new Server(this, env);
  }
}

module.exports = { ApiModel : ApiModel }

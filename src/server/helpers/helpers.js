const express               = require('express');
const helmet                = require('helmet');
const bodyParser            = require('body-parser');
const queryParser           = require('express-query-parser')
const jwt                   = require('jsonwebtoken');
const cors                  = require('cors');

const { getAllowedMethods } = require('./methods.js');
const { testRoles }         = require('../../shared/roles.js');
const realtimeHandlers      = require('../realtime.js');

function findCors(route, model) {
    if (route.includes('/')) {
      var current = model;
      var paths   = route.split('/');

      paths = paths.filter(value => value != '');

      for (let i = 0; i < paths.length; i++) {
        var path = '/' + paths[i];

        if (i + 1 === paths.length) {
          return current.cors;
        }

        current = current[path];
      }
    }
    else {
      return model['/' + route].cors;
    }
}

const httpToServerMethod = method => ({
  'GET'     : 'get',
  'HEAD'    : 'head',
  'OPTIONS' : 'options',
  'POST'    : 'post',
  'PUT'     : 'put',
  'PATCH'   : 'patch',
  'DELETE'  : 'delete'
}[method]);

const isReadMethod  = method => !!{'GET' : 1, 'HEAD' : 1, 'OPTIONS' : 1, 'realTime': 1}[method];
// const isWriteMethod = method => !!{'POST' : 1, 'PUT' : 1, 'PATCH' : 1, 'DELETE' : 1}[method];

/*
Creates a request handler that manage authentication and authorizations.
The returned handler is the first handler to be executed for each route.
 */
const createAuthHandler = (method, model, environment) => async(request, response, next) => {
  environment = environment || {};
  const {auth} = model;

  /*
  If the authorization requirements for this method are === false, then
  it means that this method is not allowed at all.
   */
  const methodAuth = auth[method];

  if (methodAuth === false) {
    const allowedMethods = getAllowedMethods(auth);

    await response.header('Allow', allowedMethods.join(','));
    await response.status(405).send('Method Not Allowed');
    return next(false);
  }

  /*
  Take JWT token, validate it and extract payload
   */
  const secret     = environment.jwtSecret || '-- Unknown token - verification side --';
  const authHeader = request.header('Authorization', '');
  const token      = authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] || '';
  let payload      = null;
  let accountId    = null;
  let roles        = [];
  let isAuthenticated;

  try {
    payload   = jwt.verify(token, secret);
    accountId = payload.accountId || null;
    roles     = payload.roles || [];
    isAuthenticated = true;
  }
  catch (error) {
    isAuthenticated = false;
  }

  /*
  If no authorization is required, then continue. Otherwise
  test authentication and roles
   */
  const { requiresAuth, requiresRoles } = methodAuth;

  if (requiresAuth !== false) {
    if (!isAuthenticated) {
      await response.status(401).send('Invalid token');
      return next(false);
    }

    if (!testRoles(requiresRoles || [], roles)) {
      await response.status(401).send('Missing required role');
      return next(false);
    }
  }

  /*
  Everthing went fine: we are either authenticated or the
  request does not need authentication. If authenticated, roles have
  been checked and are ok.
   */
  request.authorization = {
    token,
    payload,
    isAuthenticated,
    accountId,
    roles
  };

  return next();
};

/*
Retrieves the array of filter handlers defined in model for the
given method.
 */
const getFilters = (method, model) => {
  let filters = (model['filters'] || {})[method] || [];

  if (!Array.isArray(filters)) {filters = [filters];}

  filters = filters.filter(filters => typeof filters === 'function');

  return filters;
};

/*
Retrieves the array of request handlers defined in model for the
given method.
 */
const getHandlers = (method, model) => {
  let handlers = (model['handlers'] || {})[method] || [];

  if (!Array.isArray(handlers)) {handlers = [handlers];}

  handlers = handlers.filter(handlers => typeof handlers === 'function');

  return handlers;
};

/*
Creates a request handler for the current API endpoint
 */
const createHandlersChain = (method, model, environment) => {
  const filters  = getFilters(method, model);
  const handlers = getHandlers(method, model);

  const allHandlers = isReadMethod(method) ? [...handlers, ...filters] : [...filters, ...handlers];

  if (allHandlers.length === 0) {
    console.warn(
      `The length of handlers chain for method ${method} is zero. Did you mispelled function names in handlers library?
  - Model:
  ${JSON.stringify(model, null, ' ')}
  - Handlers:
  ${JSON.stringify((model['handlers'] || {})[method] || [], null, ' ')}
  - Filters:
  ${JSON.stringify((model['filters'] || {})[method] || [], null, ' ')}`
    );
  }

  const chain = allHandlers.reduceRight(
    (next, handler) => async (data, meta) => {
      const flow = {
        continue : data => next(data, meta),
        stop     : (status, data) => {
          meta.response.status  = status;
          meta.response.sendRaw = false;
          return data;
        }
      };

      try {
        return await handler(data, flow, meta);
      }
      catch (error) {
        console.error(
          `createHandlersChain(): The following exception occurred during execution of API handler: ${error}`
        );

        meta.response.status = 500;
        return undefined; // expected value at async arrow function
      }
    },
    data => data
  );

  return async (request, response, next) => {
    const req = {
      params : request.params,
      query  : request.query,
      body   : request.body,
      native : request
    };

    const res = {
      status  : 200,
      headers : {},
      sendRaw : false,
      native  : response
    };

    const data = await chain({}, {
      auth     : request.authorization,
      request  : req,
      response : res,
      environment
    });

    await response.set(res.headers);

    if (res.sendRaw) {
      await response.sendRaw(res.status, data);
    }
    else {
        await response.status(res.status).send(data);
    }

    return next();
  };
};

function logRequest(req, res, next) {
  const query       = req.query;
  const route       = req.url;
  const path        = req.url.split('?')[0];
  const method      = req.method;

  console.info(`Request: '${method} ${route}'\n`, {
    handler   : path,
    method,
    route,
    query     : query,
    remote    : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    status    : res.statusCode
  });
  next();
}

function logError(err, req, res, next) {
  logRequest(req, res);
  console.error(err);
  next();
}

const recurseModel = (path, model, environment, addRoute) => {
  /*
  If handlers is defined in model, then path is a valid API entry point.
  Adds each method defined in handlers as a new route.
   */
  Object.keys(model['handlers'] || {}).forEach(method => {
    const corsHandler   = cors(model.cors);
    const authorization = createAuthHandler(method, model, environment);
    const handler       = createHandlersChain(method, model, environment);

    addRoute(path || '/', method, [corsHandler, authorization, handler]);
  });


  /*
  Looks for subpaths in model and dive into its model
   */
  Object.entries(model).forEach(([element, subModel]) => {
    if (element.startsWith('/')) {
      recurseModel(path + element, subModel, environment, addRoute);
    }
  });
};

const createServer = (model, environment) => {
  if (!model || !model.isApiModel) {
    console.warn(
      'createServer(): "model" parameter does not seem to be a valid API model. ' +
      'Did you forget to compile the model with compileApiModel() from @appunto/apimodel-on-json?'
    );
  }

  /*
  Dictionary of routes
   */
  const routes = {};
  const addRoute = (path, method, callbacks) => {
    if (!routes[path]) {routes[path] = {};}
    routes[path][method] = callbacks;
  };

  /*
  Goes through model to define express handlers for each route.
   */
  recurseModel('', model, environment, addRoute);


  /*
  Create server with callbacks
   */
  var app = express();

  /*
  Setting up Helmet for HTTP security
  */
  if (model.security) {
    Object.entries(model.security).forEach(
      ([name, options]) => {
        if( helmet[name] ) {
           app.use(helmet[name](options));
        }
      }
    );
  }

  /*
  Setting up parsing middleware for request and response
  */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(queryParser({ parseNull: true, parseBoolean: true }));

  /*
  Catch all errors and log them
  */
  app.use(logRequest);

  /*
  Log requests
  */
  app.use(logError);


  /*
  Deploy routes to server
   */
  Object.entries(routes).forEach(([route, methods]) => {
    Object.entries(methods).forEach(([method, callbacks]) => {
      const serverMethod = httpToServerMethod(method);

      if (!serverMethod) {
        console.warn(`createServer(): Unknown method '${method}', route '${method} ${route}' discarded`);

        return;
      }

      console.info(`createServer(): Adding route '${method} ${route}'`);
      app[serverMethod](route, cors(findCors(route, model)), callbacks);
    });
  });

  /*
    Handle real-time
  */
  var http = require('http').Server(app)
  if (model.hasRealtime) {
    realtimeHandlers(model, http, environment);
  }

  return http;
};

module.exports = {
  createServer,
  createAuthHandler
};

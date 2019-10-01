const restify = require('restify');
const jwt     = require('jsonwebtoken');
const { getAllowedMethods, testRoles } = require('../apiModel/index.node.js');

const httpToServerMethod = method => ({
  'GET'     : 'get',
  'HEAD'    : 'head',
  'OPTIONS' : 'opts',
  'POST'    : 'post',
  'PUT'     : 'put',
  'PATCH'   : 'patch',
  'DELETE'  : 'del'
}[method]);

const isReadMethod  = method => !!{'GET' : 1, 'HEAD' : 1, 'OPTIONS' : 1}[method];
// const isWriteMethod = method => !!{'POST' : 1, 'PUT' : 1, 'PATCH' : 1, 'DELETE' : 1}[method];

/*
Creates a request handler that manage authentication and authorizations.
The returned handler is the first handler to be executed for each route.
 */
const createAuthHandler = (method, model, environment) => (request, response, next) => {
  environment = environment || {};
  const {auth} = model;

  /*
  If the authorization requirements for this method are === false, then
  it means that this method is not allowed at all.
   */
  const methodAuth = auth[method];

  if (methodAuth === false) {
    const allowedMethods = getAllowedMethods(auth);

    response.header('Allow', allowedMethods.join(','));
    response.send(405, 'Method Not Allowed');
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
  If no authorization is required, then just continue. Otherwise
  test authentication and roles
   */
  const { requiresAuth, requiresRoles } = methodAuth;

  if (requiresAuth !== false) {
    if (!isAuthenticated) {
      response.send(401, 'Invalid token');
      return next(false);
    }

    if (!testRoles(requiresRoles || [], roles)) {
      response.send(401, 'Missing required role');
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
Adds response header to handler CORS.
 */
const CORSHandler = (request, response, next) => {
  response.header('Access-Control-Allow-Origin',   '*');
  response.header('Access-Control-Allow-Headers',  'Authorization,Content-Type');
  response.header('Access-Control-Expose-Headers', 'X-Total-Count');
  response.header('Access-Control-Allow-Methods',  'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');

  return next();
};

const justSend200 = (request, response, next) => {
  response.send(200);

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

    response.set(res.headers);

    if (res.sendRaw) {
      response.sendRaw(res.status, data);
    }
    else {
      response.send(res.status, data);
    }

    return next();
  };
};

/*
Query parser used when default query plugin is not called because no route
is found
 */
const parseQuery = (query = '') => {
  const params = query.split('&')
    .map((param = '') => param.split('='))
    .filter((assignement = []) => assignement.length >= 2);

  return params.reduce(
    (params, [key, value]) => {
      params[key] = value;
      return params;
    }, {}
  );
};

/*
Logs request informations
 */
const logHandler = (request, response, routeObj, error) => {
  const route  = request.getPath();
  const infos  = request.getRoute();
  const query  = request.getQuery();
  const path   = !!infos && infos.path;
  const method = !!infos && infos.method;
  const agent  = request.userAgent();

  console.info(`Request: '${method} ${route}${query ? '?' + query : ''}'`, {
    handler   : path,
    method,
    route,
    query     : typeof request.query === 'function' ? parseQuery(query) : request.query,
    userAgent : agent,
    remote    : request.headers['x-forwarded-for'] || request.connection.remoteAddress,
    status    : response.statusCode,
    error     : response.statusCode >= 500 ? error : (!!error && (error.message || error))
  });
};

/*
Log all errors
 */
const errorLogHandlers = (request, response, error, callback) => {
  logHandler(request, response, {}, error);

  return callback();
};

const unhandledExceptionsLogHandler = (request, response, route, err) => {
  response.send(err);
};



const recurseModel = (path, model, environment, addRoute) => {
  /*
  If handlers is defined in model, then path is a valid API entry point.
  Adds each method defined in handlers as a new route.
   */
  Object.keys(model['handlers'] || {}).forEach(method => {
    const authorization = createAuthHandler(method, model, environment);
    const handler       = createHandlersChain(method, model, environment);

    addRoute(path || '/', method, [CORSHandler, authorization, handler]);
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
  Goes through model to define restify handlers for each route.
   */
  recurseModel('', model, environment, addRoute);

  /*
  If not user defined, add handlers for OPTIONS method to allow CORS.
   */
  Object.values(routes).forEach(methods => {
    methods['OPTIONS'] = methods['OPTIONS'] || [CORSHandler, justSend200];
  });

  /*
  Create server with callbacks
   */
  const server = restify.createServer({handleUncaughtExceptions : true});

  // parse body content
  server.use(restify.plugins.bodyParser());
  // parse query
  server.use(restify.plugins.queryParser());
  // catch all errors and log them
  server.on('restifyError', errorLogHandlers);
  server.on('uncaughtException', unhandledExceptionsLogHandler);
  // log requests
  server.on('after', logHandler);


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

      server[serverMethod](route, callbacks);
    });
  });

  const originalListen = server.listen.bind(server);
  server.listen = (...args) => {
    console.info(`Server listening to: ${args[0]}`, {port : args[0]});

    originalListen(...args);
  };

  return server;
};

module.exports = {
  createServer
};

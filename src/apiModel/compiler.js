const { keysMap, onUndefined } = require('./helpers');
const { createAuthHandler }    = require('../server/server.js');

/*
Methods list
 */
const methods      = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE', 'realTime'];
const readMethods  = ['GET', 'HEAD', 'OPTIONS', 'realTime'];
const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const defaultRequirements = {requiresAuth : true, requiresRoles : false, policies : [createAuthHandler]};
const defaultAuth         = keysMap(methods, () => defaultRequirements);
const defaultCorsOptions  = {
  origin               : "*",
  methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue    : false,
  optionsSuccessStatus : 204
}

var isRealtime = false;

const compileRequestRequirements = (requirements) => {
  if (requirements === false) {
    return false;
  }
  else if (requirements === true) {
    return {requiresAuth : false, requiresRoles : false, policies : [createAuthHandler]};
  }
  else if (typeof requirements === 'object') {
    var policies = [createAuthHandler];

    if (requirements.policies) {
      policies = [createAuthHandler, ...requirements.policies];
    }

    return {
      requiresAuth  : onUndefined(requirements.requiresAuth, true),
      requiresRoles : onUndefined(requirements.requiresRoles, false),
      policies
    };
  }

  /*
  Block the request if the requirements specification is not valid.
  This is counterintuitive but allows faster bug detection
   */
  return false;
};

/*
Compiles collection or field requirements
 */
const compileAuthRequirements = (model, defaultAuth, realTime) => {
  model = model || {};

  model['realTime'] = realTime ? true : false;

  /*
  Use defaultAuth as default access rules
   */
  const compiled = Object.assign({}, defaultAuth);

  /*
  Apply common rules to all request methods if at least one of the
  requiresAuth or requiersRoles specifications are available.
   */
  if (model.requiresAuth !== undefined || model.requiresRoles !== undefined || model.policies !== undefined) {
    const commonRequirements = compileRequestRequirements(model);

    methods.forEach(method => {compiled[method] = commonRequirements;});
  }

  /*
  Apply different rules for read requests if specified
   */
  if (model.read !== undefined) {
    const readRequirements  = compileRequestRequirements(model.read);

    readMethods.forEach(method => {compiled[method] = readRequirements;});
  }

  /*
  Apply different rules for write requests if specified
   */
  if (model.write !== undefined) {
    const writeRequirements = compileRequestRequirements(model.write);

    writeMethods.forEach(method => {compiled[method] = writeRequirements;});
  }

  /*
  Apply different rules for each requests if specified
   */
  methods.forEach(method => {
    if (model[method] !== undefined) {
      compiled[method] = compileRequestRequirements(model[method]);
    }
  });


  compiled['realTime'] = defaultRequirements;

  if (compiled['realTime']) {
    isRealtime = true;
  }

  return compiled;
};

/*
Expands read and write handlers assignements
 */
const compileHandlersList = (model) => {
  model = model || {};
  const {read, write} = model;
  const compiled = {};

  /*
  Assign handlers to all read methods.
   */
  if (read !== undefined) {
    const handlers = Array.isArray(read) ? read : [read];

    readMethods.forEach(method => {compiled[method] = handlers;});
  }

  /*
  Assign handlers to all read methods.
   */
  if (write !== undefined) {
    const handlers = Array.isArray(write) ? write : [write];

    writeMethods.forEach(method => {compiled[method] = handlers;});
  }

  /*
  Assign any other handler
   */
  methods.forEach(method => {
    if (model[method] !== undefined) {
      const handlers = model[method];

      compiled[method] = Array.isArray(handlers) ? handlers : [handlers];
    }
  });

  return compiled;
};

function compileRealTime(model) {
  if (model) {
    var result = {};

    result['connect']    = model['connect'] || [];
    result['message']    = model['message'] || [];
    result['disconnect'] = model['disconnect'] || [];

    return result;
  }

  return false;
}

function compileCors(model, defaultCors) {
  if (model === false) {
    return false;
  }
  if (model && defaultCors) {
    var options = {
      origin               : model.origin ? model.origin : defaultCors.origin,
      methods              : model.methods ? model.methods : defaultCors.methods,
      preflightContinue    : model.preflightContinue ? model.preflightContinue : defaultCors.preflightContinue,
      optionsSuccessStatus : model.optionsSuccessStatus ? model.optionsSuccessStatus : defaultCors.optionsSuccessStatus,
    }

    return options;
  }
  return defaultCors;
}


/*
Compile API endpoints recursively
 */
const compileEndpointModel = (model, parent) => {
  model = model || {};
  const parentAuth = parent && parent.auth || defaultAuth;
  const realTime   = compileRealTime(model.realTime);
  const auth       = compileAuthRequirements(model.auth || {}, parentAuth, realTime);
  const fields     = {};
  var defaultCors  = defaultCorsOptions;


  if (model.cors != undefined) {
    defaultCors = compileCors(model.cors, defaultCors);
  }
  else if (parent) {
    defaultCors = compileCors(parent.cors, defaultCors);
  }

  Object.entries(model.fields || {}).forEach(([field, fieldModel]) => {
    fields[field] = {
      auth : compileAuthRequirements(fieldModel.auth || {}, auth, realTime)
    };
  });

  const compiled = {
    handlers : compileHandlersList(model.handlers),
    filters  : compileHandlersList(model.filters),
    realTime,
    cors     : compileCors(model.cors, defaultCors),
    auth,
    fields
  };

  /*
  Looks for subpaths in model and dive into its model
   */
  Object.entries(model).forEach(([element, subModel]) => {
    if (element.startsWith('/')) {
      compiled[element] = compileEndpointModel(subModel, compiled);
    }
  });

  return compiled;
};


/*
Compile the entire api model
 */
const compileApiModel = apiModel => ({
  isApiModel  : true,
  ...compileEndpointModel(apiModel, null),
  hasRealtime : isRealtime
});

module.exports = {
  methods,
  readMethods,
  writeMethods,
  compileRequestRequirements,
  compileAuthRequirements,
  compileHandlersList,
  compileRealTime,
  compileCors,
  compileEndpointModel,
  compileApiModel
}

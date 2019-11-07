const { keysMap, onUndefined } = require('./helpers');
const { createAuthHandler }    = require('../../server/helpers/helpers.js');

/*
Methods list
 */
const methods      = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE', 'realTime'];
const readMethods  = ['GET', 'HEAD', 'OPTIONS', 'realTime'];
const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const defaultRequirements = {requiresAuth : true, requiresRoles : false, policies : [createAuthHandler]};
const defaultAuth         = keysMap(methods, () => defaultRequirements);
const defaultCors = {
  origin               : "*",
  methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue    : false,
  optionsSuccessStatus : 204
}

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
      policies = requirements.policies;
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
const compileAuthRequirements = (model, defaultAuth) => {
  model = model || {};

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

function compileRealTime(model = {}) {
  return {
    'connect'    : model['connect'] || [],
    'message'    : model['message'] || [],
    'disconnect' : model['disconnect'] || []
  };
}

function compileCors(model = {}, parentCors = {} ) {
  if ( model === false ) {
    // Disable cors by using 'cors' package options
    model = { origin : false };
  }
  else if ( model === true ){
    // Allow default cors options
    model = defaultCors;
  }

  return Object.assign({}, defaultCors, parentCors, model);
}


/*
Compile API endpoints recursively
 */
const compileEndpointModel = (model, parent) => {
  model = model || {};

  const parentAuth = parent && parent.auth || defaultAuth;
  const auth       = compileAuthRequirements(model.auth || {}, parentAuth);

  const parentCors = parent && parent.cors || defaultCors;
  const cors       = compileCors(model.cors || {}, parentCors);

  const fields     = {};

  Object.entries(model.fields || {}).forEach(([field, fieldModel]) => {
    fields[field] = {
      auth : compileAuthRequirements(fieldModel.auth || {}, auth)
    };
  });

  const compiled = {
    handlers : compileHandlersList(model.handlers),
    filters  : compileHandlersList(model.filters),
    realTime : compileRealTime(model.realTime),
    cors,
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

function isRealTime(model) {
  const realTime = model.realTime;
  const fields   = Object.entries(model);

  if ((model['auth']['realTime'].requiresAuth === true) && realTime && (realTime['connect'].length > 0 || realTime['disconnect'].length > 0 || realTime['message'].length > 0)) {
    return true;
  }

  for (let index = 0; index < fields.length; index++) {
    const [element, subModel] = fields[index];
    if (element.startsWith('/')) {
      if (isRealTime(subModel) === true) {
        return true;
      }
    }
  }
  
  return false;
}


/*
Compile the entire api model
 */
const compileApiModel = apiModel => {
  const compiledModel = compileEndpointModel(apiModel, null);

  return {
    isApiModel  : true,
    hasRealtime : isRealTime(compiledModel),
    ...compiledModel,
  };
};

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

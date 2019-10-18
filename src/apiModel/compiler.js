const { keysMap, onUndefined } = require('./helpers');

/*
Methods list
 */
const methods      = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE', 'realTime'];
const readMethods  = ['GET', 'HEAD', 'OPTIONS'];
const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const defaultRequirements = {requiresAuth : true, requiresRoles : false};
const defaultAuth         = keysMap(methods, () => defaultRequirements);

var isRealtime = false;

const compileRequestRequirements = (requirements) => {
  if (requirements === false) {
    return false;
  }
  else if (requirements === true) {
    return {requiresAuth : false, requiresRoles : false};
  }
  else if (typeof requirements === 'object') {
    return {
      requiresAuth  : onUndefined(requirements.requiresAuth, true),
      requiresRoles : onUndefined(requirements.requiresRoles, false)
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
  if (model.requiresAuth !== undefined || model.requiresRoles !== undefined) {
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


/*
Compile API endpoints recursively
 */
const compileEndpointModel = (model, parent) => {
  model = model || {};
  const parentAuth = parent && parent.auth || defaultAuth;
  const realTime   = compileRealTime(model.realTime);
  const auth       = compileAuthRequirements(model.auth || {}, parentAuth, realTime);
  const fields     = {};

  Object.entries(model.fields || {}).forEach(([field, fieldModel]) => {
    fields[field] = {
      auth : compileAuthRequirements(fieldModel.auth || {}, auth, realTime)
    };
  });

  const compiled = {
    handlers : compileHandlersList(model.handlers),
    filters  : compileHandlersList(model.filters),
    realTime,
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
  compileEndpointModel,
  compileApiModel
}

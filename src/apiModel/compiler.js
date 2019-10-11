const { keysMap, onUndefined } = require('./helpers');

/*
Methods list
 */
const methods      = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'];
const readMethods  = ['GET', 'HEAD', 'OPTIONS'];
const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

const defaultRequirements = {requiresAuth : true, requiresRoles : false};
const defaultAuth         = keysMap(methods, () => defaultRequirements);

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


/*
Compile API endpoints recursively
 */
const compileEndpointModel = (model, parent) => {
  model = model || {};
  const parentAuth = parent && parent.auth || defaultAuth;
  const auth       = compileAuthRequirements(model.auth || {}, parentAuth);
  const fields     = {};

  Object.entries(model.fields || {}).forEach(([field, fieldModel]) => {
    fields[field] = {
      auth : compileAuthRequirements(fieldModel.auth || {}, auth)
    };
  });

  const compiled = {
    handlers : compileHandlersList(model.handlers),
    filters  : compileHandlersList(model.filters),
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
  isApiModel : true,
  isRealtime : true,
  ...compileEndpointModel(apiModel, null)
});

module.exports = {
  methods,
  readMethods,
  writeMethods,
  compileRequestRequirements,
  compileAuthRequirements,
  compileHandlersList,
  compileEndpointModel,
  compileApiModel
}

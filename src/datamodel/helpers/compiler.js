const {
  isString,
  isBoolean,
  validProperties,
  isNestedArray,
  isNestedObject,
  isTypeDeclaration,
  isTypeName
} = require('./helpers.js');


/**
 * @param {Mixed} field  - JSON object describing a collection field
 * @param {String} [typeKey='type'] - Key used to discriminate between neted object and
 * extended field type definition
 * @return {Object} - Compiled type declaration
 * @description Verifies that the JSON object provided in the argument `field` is a
 * valid type declaration. This function guaranties that the fields
 * definition are in a valid format. If the format is not recognised
 * a "Mixed" type definition is returned `{[typeKey] : "Mixed"}`.
 *
 * The second argument `typeKey` is the key used to discriminate
 * between nested object and extended type definition. It defaults
 * to `"type"`
 *
 * Valid type declaration are as follows:
 *
 * * One of the following string literals "String", "Number", "Date", "Boolean",
 *   "Mixed", "Id". These are converted into: `{[typeKey] : <StringLiteral>}`
 *
 * * An extended type declaration composed by an object with the key
 *   defined in `typeKey`. This allows the definition of type properties
 *   as follows `{type:"String", index:true, <otherprop>:false}`.
 *   Valid properties are:
 *
 *    * For all types:
 *       * `"required" : <boolean>`
 *       * `"default"  : <same type as defined field type>`
 *       * `"index"    : <boolean>`
 *       * `"unique"   : <boolean>`
 *       * `"sparse"   : <boolean>`
 *
 *    * For "String":
 *       * `"lowercase" : <boolean>`
 *       * `"uppercase" : <boolean>`
 *       * `"trim"      : <boolean>`
 *       * `"match"     : <string>`
 *       * `"minlength" : <number>`
 *       * `"maxlength" : <number>`
 *
 *    * For "Id" :
 *       * `"collection" : <string>`
 *
 *    * For "Date":
 *    Valid date string are the string "now" and all values that does
 *    not convert to NaN when passed as a parameter to Date.parse().
 *       * `"min" : <date string>`
 *       * `"max" : <date string>`
 *
 *    * For "Number":
 *       * `"min" : <number>`
 *       * `"max" : <number>`
 *
 *    * No particular properties are available for "Boolean" and "Mixed"
 *
 * * A nested object definition. This is an object that does not contain
 *   the key specified in `typeKey`.
 *   If the object is empty `{}`, then `{[typeKey] : "Mixed"}` is returned
 *
 * * A nested array in the form `[<Literal>]` or `[{type:<Literal>,<options>}]`.
 *   If the array has more than one element, only first one is taken. If the
 *   array has zero elements, then `[{[typeKey] : "Mixed"}]` is returned.
 */
function compileTypeDeclaration(field, typeKey = 'type') {
  let typeDeclaration = null;

  if (typeof field === 'string') {
    if (!isTypeName(field)) {
      console.warn(`Unknown field type ${field}, replaced by "Mixed".`);
      field = 'Mixed';
    }

    typeDeclaration = {[typeKey] : field};
  }
  else if (isTypeDeclaration(field, typeKey)) {
    let type = field[typeKey];

    typeDeclaration = compileTypeDeclaration(type, typeKey);
    type = typeDeclaration[typeKey];

    Object.entries(field).forEach(entry => {
      const property = entry[0];
      const value    = entry[1];

      if (property === typeKey) {return;}

      const validator = validProperties[type][property] || validProperties['common'][property];

      if (validator) {
        if (validator(value, type)) {
          typeDeclaration[property] = value;
        }
        else {
          console.warn(`Ignored invalid value "${value}" for property "${property}".`);
        }
      }
      else {
        console.warn(`Ignored unknown property "${property}".`);
      }
    });
  }
  else if (isNestedArray(field)) {
    if (field.length > 1) {
      console.warn('Array type has more than one child. Indexes > 0 ignored.');
    }

    const subType  = field.length === 0 ? 'Mixed' : field[0];

    typeDeclaration = [compileTypeDeclaration(subType, typeKey)];
  }
  else if (isNestedObject(field, typeKey)) {
    typeDeclaration = {};

    let fieldsCounter = 0;

    Object.entries(field).forEach(entry => {
      const subField = entry[0];
      const subType  = entry[1];

      typeDeclaration[subField] = compileTypeDeclaration(subType, typeKey);

      fieldsCounter++;
    });

    if (fieldsCounter === 0) {
      console.warn('Empty nested object. Used "Mixed"');
      typeDeclaration = compileTypeDeclaration('Mixed', typeKey);
    }
  }
  else {
    console.warn('Unable to compile field definition. "Mixed" used instead');
    typeDeclaration = compileTypeDeclaration('Mixed', typeKey);
  }

  return typeDeclaration;
}


/**
 * Compile a collection schema.
 * @param  {Object} schema   - Collection schema
 * @param  {String} typeKey  - Key used to discriminate between type and nested object definition
 * @return {Object}          - Compiled collection schema
 */
function compileSchemaDeclaration(schema, typeKey) {
  const compiledSchema = {};

  Object.entries(schema || {}).forEach(entry => {
    const fieldName = entry[0];
    const fieldType = entry[1];

    compiledSchema[fieldName] = compileTypeDeclaration(fieldType, typeKey);
  });

  return compiledSchema;
}

/**
 * Compile collection options.
 *
 * Currently only `timestamps`, `typeKey` and `searchableFields` are available.
 *
 * @param  {Object} options - Options declaration object
 * @return {Object}         - Parsed options declaration object
 */
function compileOptionsDeclaration(options) {
  let {timestamps, typeKey, searchableFields} = options;

  searchableFields = Array.isArray(searchableFields) ? searchableFields : [];

  /*
  Compile timestamps option
   */
  if (isBoolean(timestamps)) {
    // OK. Do nothing
  }
  else if (typeof timestamps === 'object' && (timestamps['createdAt'] || timestamps['updatedAt'])) {
    timestamps = {
      'createdAt' : timestamps['createdAt'] || 'createdAt',
      'updatedAt' : timestamps['updatedAt'] || 'updatedAt'
    };
  }
  else {
    timestamps = true;
  }

  /*
  Compile typeKey option
   */
  typeKey = typeKey && isString(typeKey) ? typeKey : 'type';

  return {
    timestamps,
    typeKey,
    searchableFields
  };
}


/**
 * Parses the JSON definition of a collection, handles possible declaration
 * errors and build a consistent collection declaration object.
 *
 * A collection declaration is an object composed of two fields: `options`
 * and `schema`.
 *
 * @param  {Object} declaration - JSON collection declaration
 * @return {Object}             - Parsed collection declaration
 */
function compileCollection(declaration) {
  const options = compileOptionsDeclaration(declaration.options || {});
  const schema  = compileSchemaDeclaration(declaration.schema || {}, options.typeKey);

  return {
    options,
    schema
  };
}


/**
 * Parses JSON data model object and verifies that the declaration is valid.
 * @param  {Object} declaration - JSON data model
 * @return {Object}             - Valid data model object
 */
function compileDataModel(declaration) {
  const models = {};

  Object.entries(declaration).forEach(entry => {
    const name       = entry[0];
    const collection = entry[1];

    models[name] = compileCollection(collection);
  });

  return models;
}


module.exports = {
  compileDataModel,
  compileTypeDeclaration,
  compileSchemaDeclaration,
  compileOptionsDeclaration,
  compileCollection
}

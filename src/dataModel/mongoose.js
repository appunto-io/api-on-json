const { _ } = require('lodash');
const { isNestedObject, isNestedArray } = require('./helpers');


const convertDate = (declaration, typeKey) => {
  const converted = {...declaration};

  if (converted['default'] && converted['default'] === 'now') {
    converted['default'] = Date.now;
  }

  return converted;
};

const convertId = (declaration, typeKey) => {
  /* eslint no-unused-vars: 0 */
  const { collection, ...rest } = declaration;

  return {
    ...rest,
    [typeKey] : 'String'
  };
};

const convertToSelf = (declaration) => declaration;

const converters = {
  'String'  : convertToSelf,
  'Number'  : convertToSelf,
  'Date'    : convertDate,
  'Boolean' : convertToSelf,
  'Id'      : convertId,
  'Mixed'   : convertToSelf
};


/*
Converts dataModel properties to mongoose properties.
 */
function dataModelSchemaToMongooseSchema(schema, options) {
  const { typeKey } = options;

  return _.mapValues(schema, (value, key) => {
    let wrapWithArray = val => val;

    if (isNestedArray(value)) {
      wrapWithArray = val => [val];
      value = value[0];
    }

    if (isNestedObject(value, typeKey)) {
      return wrapWithArray(dataModelSchemaToMongooseSchema(value, options));
    }

    const converter = converters[value[typeKey]];

    return wrapWithArray(converter(value, typeKey));
  });
}


/**
 * Converts a JSON data model declaration to a map
 * of Mongoose models.
 *
 * @param  {Object} model - Data model declaration
 * @param  {Object} mongoose - mongoose instance
 * @return {Object}       - Map of mongoose models
 */
function dataModelToMongoose(model, mongoose) {
  const Schema = mongoose.Schema;
  const models = {};

  Object.entries(model).forEach(entry => {
    const name       = entry[0];
    const definition = entry[1];

    const schemaObject  = definition.schema || {};
    const schemaOptions = definition.options || {};

    const mongooseSchema = dataModelSchemaToMongooseSchema(schemaObject, schemaOptions);

    const schema = new Schema(mongooseSchema, {
      collection : name,
      ...schemaOptions
    });

    models[name] = mongoose.model(name, schema);
  });

  return models;
}

module.exports = {
  dataModelSchemaToMongooseSchema,
  dataModelToMongoose
};

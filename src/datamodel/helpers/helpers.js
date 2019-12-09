const lodashIsString      = require('lodash.isstring');
const lodashIsNumber      = require('lodash.isnumber');
const lodashIsBoolean     = require('lodash.isboolean');
const lodashIsPlainObject = require('lodash.isplainobject');

const isString  = (value) => lodashIsString(value);
const isNumber  = (value) => lodashIsNumber(value);
const isDate    = (value) => value === 'now' || !isNaN(Date.parse(value));
const isBoolean = (value) => lodashIsBoolean(value);
const isId      = (value) => lodashIsString(value);

const isDefaultValue = (value, type) => {
  return ({
    'String'  : isString,
    'Number'  : isNumber,
    'Date'    : isDate,
    'Boolean' : isBoolean,
    'Id'      : isId
  }[type] || (()=>true))(value);
};

const typeConstants = ['String', 'Number', 'Date', 'Boolean', 'Mixed', 'Id'];

const validProperties = {
  'common' : {
    'required' : isBoolean,
    'default'  : isDefaultValue,
    'index'    : isBoolean,
    'unique'   : isBoolean,
    'sparse'   : isBoolean
  },
  'Id' : {
    'collection' : isString
  },
  'String' : {
    'lowercase' : isBoolean,
    'uppercase' : isBoolean,
    'trim'      : isBoolean,
    'match'     : isString,
    'minlength' : isNumber,
    'maxlength' : isNumber
  },
  'Number' : {
    'min' : isNumber,
    'max' : isNumber
  },
  'Date' : {
    'min' : isDate,
    'max' : isDate
  },
  'Boolean' : {},
  'Mixed'   : {}
};

const isNestedArray     = (field)                   => Array.isArray(field);
const isNestedObject    = (field, typeKey = 'type') => lodashIsPlainObject(field) && !field[typeKey];
const isTypeDeclaration = (field, typeKey = 'type') => lodashIsPlainObject(field) && !!field[typeKey];
const isTypeName        = (field)                   => lodashIsString(field) && typeConstants.indexOf(field) !== -1;

module.exports = {
  isString,
  isNumber,
  isDate,
  isBoolean,
  isId,
  isDefaultValue,
  typeConstants,
  validProperties,
  isNestedArray,
  isNestedObject,
  isTypeDeclaration,
  isTypeName
}

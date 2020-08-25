const mongoose                       = require('mongoose');
const get                            = require('lodash.get');
const set                            = require('lodash.set');
const { dataModelToMongoose }        = require('./mongoHelpers.js');

/*
Changes _id to id and removes __v from retrieved documents
 */
const _convertDocumentToObject = (document) =>
  document.toObject({
    transform : (doc, ret) => {
      Reflect.deleteProperty(ret, '__v');
      const { _id, ...sanitized } = ret;

      sanitized.id = _id;

      return sanitized;
    }
  });

const _convertAPIFieldToMongo = field => {
  switch (field) {
    case 'id':
      return '_id';
    default:
      return field;
  }
};


class Mongo {
  constructor(url, options) {
    this.url      = url;
    this.options  = { ...options, useNewUrlParser : true, useUnifiedTopology : true, useFindAndModify : false};
    this.database = null;
    this.models   = null;
  }

  async connect() {
    return mongoose.connect(this.url, this.options)
      .then(database => {
        this.database = database;

        return this;
      });
  }

  async init(dataModel) {
    if (!this.database) {
      console.error("Trying to call Mongo.init() without connection: did you forget to call Mongo.connect()?");
      return;
    }
    this.models = dataModelToMongoose(dataModel.get(), this.database);
  }

  async getModel(collection) {
    if(!this.database) {
      const message = `You are not connected to a mongodb server. Please verify that you called connect() and be sure to wait promise resolution.`;

      console.error(message);
      throw new Error(message);
    }

    var Model = this.models ? this.models[collection] : this.database.model(collection);

    if(!Model) {
      const message = `Collection ${collection} is not defined in the database`;

      console.error(message);
      throw new Error(message);
    }

    return Model;
  }

  /*------------------------------------------------------------
    CRUD
  */

  async create(collection, data = {}) {
    const Model = await this.getModel(collection);

    const document = new Model();

    Model.schema.eachPath(field => {
      const value = get(data, field);
      if (typeof(value) !== 'undefined') {
        document.set(field, value);
      }
    });

    const saved = await document.save();

    return _convertDocumentToObject(saved);
  }

  async remove(collection, id) {
    const Model = await this.getModel(collection);

    const document = await Model.findByIdAndDelete(id);

    if (!document)
      return null;

    return _convertDocumentToObject(document);
  }

  async readOne(collection, id) {
    const Model = await this.getModel(collection);

    const document = await Model.findById(id);

    if (!document) {
      return null;
    }

    return _convertDocumentToObject(document);
  }

  async readMany(collection, query = {}) {
    const Model = await this.getModel(collection);

    /* eslint no-unused-vars: 0 */
    let { page, pageSize, sort, order, cursor, q, f, ...restOfQuery } = query;

    page       = page * 1     || 0;
    pageSize   = pageSize * 1 || 30;
    sort       = Array.isArray(sort) ? sort : _convertAPIFieldToMongo(sort) || null;
    order      = (order + '').toLowerCase() === 'desc' ? '-1' : '1';
    const comp =  order === '1' ? '$gt' : '$lt';

    f = f || [];
    f = Array.isArray(f) ? f : [f];

    const delimiter = ';';

    let mongoQuery = {};

    if (cursor) {
      if (cursor.includes(delimiter)) {
        const [ fieldSort_encoded, nextSort_encoded, nextId ] = cursor.split(delimiter);

        const fieldSort = decodeURIComponent(fieldSort_encoded);
        const nextSort  = decodeURIComponent(nextSort_encoded);

        mongoQuery = {
          ...mongoQuery,
          $or: [
            {
              [fieldSort]: { [comp] : nextSort }
            },
            {
              [fieldSort]: nextSort,
              _id: { [comp] : nextId }
            }
          ]
        };
      }
      else {
        mongoQuery = {
          ...mongoQuery,
          _id: { [comp] : cursor}
        };
      }
    }
    else {
      Object.entries(restOfQuery).forEach(([field, values]) => {
          let mongoValue = decodeURIComponent(values);

          if(typeof values === 'string') {
            const valuesArray = values.split(',').map(val => decodeURIComponent(val));

            if(valuesArray.length > 1) {
              mongoValue = {'$in' : valuesArray};
            }
          }

          mongoQuery[_convertAPIFieldToMongo(field)] = mongoValue;
      });
    }

    if (q) {
      const searchArray = [];
      Object.entries(Model.schema.obj).forEach(([fieldName, fieldDef]) => {
        if (fieldDef.type === 'String') {
            searchArray.push({[fieldName]: {$regex: `.*${q}.*`, $options: 'i'}});
          }
      });
      mongoQuery = {...mongoQuery, $or: searchArray};
    }

    if (f) {
      const comparators = ['gt', 'ge', 'lt', 'le'];
      const filterQuery = {};

      f.forEach(elem => {
        let [fieldName, comparator, val, ...restOfFilter] = elem.split(delimiter);

        if (fieldName in Model.schema.obj) {
          if (!filterQuery[fieldName]) {
            filterQuery[fieldName] = {};
          }
          if (comparators.includes(comparator) && val) {
            if (comparator === 'ge') {
              comparator = 'gte';
            }
            if (comparator === 'le') {
              comparator = 'lte'
            }
            comparator = '$' + comparator;
            filterQuery[fieldName][comparator] = val;
          }
        }
      });

      mongoQuery = {...mongoQuery, ...filterQuery};
    }

    /*
      If sorting in the db the secondary sorting is always id_
    */
    var sortingBy = [];
    if (Array.isArray(sort)) {
      for (let i = 0; i < sort.length; i = i + 1) {
        var [ elem_sort, elem_order ] = sort[i].split(',');
        elem_order = (elem_order + '').toLowerCase() === 'desc' ? 'desc' : 'asc';
        Model.schema.eachPath(field => {
          if (elem_sort === field) {
            sortingBy.push([elem_sort, elem_order]);
          }
        });
      }
    }
    else if((sort + '').includes(',')) {
      var [ elem_sort, elem_order ] = sort.split(',');
      elem_order = (elem_order + '').toLowerCase() === 'desc' ? 'desc' : 'asc';
      sortingBy.push([elem_sort, elem_order]);
    }
    else {
      sortingBy.push([sort, order]);
    }

    const documents = await Model.find(mongoQuery)
      .sort(sortingBy)
      .skip(page * pageSize)
      .limit(pageSize);

    const results = documents.map(document => _convertDocumentToObject(document));
    const count = await Model.countDocuments();
    var last = results.length > 0 ? results[results.length - 1].id : '';

    if (sort) {
      const data       = results.length > 0 ? results[results.length - 1][sort] : '';
      let encoded_data = encodeURIComponent(data);

      let encoded_field = encodeURIComponent(sort);

      last = encoded_field + delimiter + encoded_data + delimiter + last;
    }

    return {
      documents: results,
      count: count,
      cursor: last
    };
  }

  async update(collection, id, data) {
    const Model = await this.getModel(collection);

    const document = {};

    Model.schema.eachPath(field => {
      const value = get(data, field);
      if (typeof(value) !== 'undefined') {
        set(document, field, value);
      }
    });

    await new Model(document).validate();
    const saved = await Model.findByIdAndUpdate(id, document, {
      new                 : true,
      upsert              : true,
      runValidators       : true,
      setDefaultsOnInsert : true
    });

    return _convertDocumentToObject(saved);
  }

  async patch(collection, id, data) {
    const Model = await this.getModel(collection);

    const document = {};

    Model.schema.eachPath(field => {
      const value = get(data, field);
      if (typeof(value) !== 'undefined') {
        set(document, field, value);
      }
    });

    const saved = await Model.findByIdAndUpdate(id, document, {
      new           : true,
      upsert        : false,
      runValidators : true
    });

    if (!saved) {
      return null;
    }

    return _convertDocumentToObject(saved);
  }

  async observe() {
    console.warn('The database you are using can\'t use realTime');
    return this;
  }
}

module.exports = { Mongo : Mongo}

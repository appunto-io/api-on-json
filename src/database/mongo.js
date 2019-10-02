const mongoose                       = require('mongoose');
const { dataModelToMongoose }        = require('../dataModel/mongoose.js');


/*
Changes _id to id and removes __v from retrieved documents
 */
const _convertDocumentToObject = (document) =>
  document.toObject({
    transform : (doc, ret, options) => {
      const { _id, __v, ...sanitized } = ret;

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
    this.options  = { ...options, useNewUrlParser : true};
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
    const mongooseModels = dataModelToMongoose(dataModel, this.database);
    this.models = mongooseModels;
  }

  async _getModel(collection) {
    if(!this.database) {
      const message = `You are not connected to a mongodb server. Please verify that you called connect() and be sure to wait promise resolution.`;

      console.error(message);
      throw new Error(message);
    }

    const Model = this.models[collection];

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
    const Model = await this._getModel(collection);

    const document = new Model();

    Model.schema.eachPath(field => {
      if (field in data) {
        document.set(field, data[field]);
      }
    });

    const saved = await document.save();

    return _convertDocumentToObject(saved);
  }

  async remove(collection, id) {
    const Model = await this._getModel(collection);

    const document = await Model.findByIdAndDelete(id);

    if (!document)
      return null;

    return _convertDocumentToObject(document);
  }

  async readOne(collection, id) {
    const Model = await this._getModel(collection);

    const document = await Model.findById(id);

    if (!document) {
      return null;
    }

    return _convertDocumentToObject(document);
  }

  async readMany(collection, query = {}, options = {}) {
    const Model = await this._getModel(collection);
    let { page, pageSize, sort, order, cursor, ...restOfQuery } = query;

    page       = page * 1     || 0;
    pageSize   = pageSize * 1 || 30;
    sort       = Array.isArray(sort) ? sort : _convertAPIFieldToMongo(sort) || null;
    order      = (order + '').toLowerCase() === 'desc' ? '-1' : '1';
    const comp =  order === '1' ? '$gt' : '$lt';

    const delimiter = ';';

    let mongoQuery = {};

    if (cursor) {
      if (cursor.includes(delimiter)) {
        const [ fieldSort_encoded, nextSort_encoded, nextId ] = cursor.split(delimiter);

        const fieldSort = decodeURIComponent(fieldSort_encoded);
        const nextSort  = decodeURIComponent(nextSort_encoded);

        mongoQuery = {
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
          _id: { [comp] : cursor}
        };
      }
    }
    else {
      Object.entries(restOfQuery).forEach(([field, values]) => {
          const valuesArray = values.split(',').map(val => decodeURIComponent(val));
          const mongoValue  = valuesArray.length > 1 ?
            {'$in' : valuesArray} :
            decodeURIComponent(values);
            mongoQuery[_convertAPIFieldToMongo(field)] = mongoValue;
      });
    }

    /*
      If sorting in the db the secondary sorting is always id_
    */
    var sortingBy = [];

    if (Array.isArray(sort)) {
      for (let i = 0; i < sort.length; i++) {
        var [ elem_sort, elem_order ] = sort[i].split(',');
        elem_order = (elem_order + '').toLowerCase() === 'desc' ? 'desc' : 'asc';
        if (Model[elem_sort]) {
          sortingBy.push([elem_sort, elem_order]);
        }
      }
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
    const Model = await this._getModel(collection);

    const document = {};

    Model.schema.eachPath(field => {
      if (field in data) {
        document[field] = data[field];
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
    const Model = await this._getModel(collection);

    const document = {};

    Model.schema.eachPath(field => {
      if (field in data) {
        document[field] = data[field];
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
}

module.exports = Mongo

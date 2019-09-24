const mongoose                       = require('mongoose');
const { dataModelToMongoose }        = require('../dataModel/index.node.js');
const { createLibraryFromDataModel } = require('../apiModel/index.node.js');

class Mongo {
  constructor(url, options) {
    this.url      = url;
    this.options  = { ...options, useNewUrlParser : true};
    this.database = mongoose;
  }

  async connect() {
    return this.database
      .connect(this.url, this.options)
      .then(() => { return this; });
  }

  async init(dataModel) {
    const dbModel = dataModelToMongoose(dataModel, this.database);
    return createLibraryFromDataModel(dbModel, this);
  }

  /*------------------------------------------------------------
    CRUD
  */

  async create(collection, data = {}) {

    if(!this.database) {
      console.error(`You are not connected to a mongodb server. Please verify that you called connect() and be sure to wait promise resolution.`)
      return false;
    }

    const Model = this.database.model(collection);

    if(!Model) {
      const message = `Collection ${collection} is not defined in the database`;

      console.error(message);
      throw new Error(message);
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    return Promise.all(data.map(function(item) {
      const new_elem = new Model();
      Model.schema.eachPath(field => {
        if (field in item) {
          new_elem.set(field, item[field]);
        }
      });
      new_elem.save();
    }));
  }
}

module.exports = Mongo

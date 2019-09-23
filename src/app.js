const { API, DB } = require('./index.js');


const mongoose                                  = require('mongoose');
const { createServer }                          = require('./backend/index.js')
const { dataModelToMongoose, compileDataModel } = require('./dataModel/index.node.js');
const {
        createLibraryFromDataModel,
        createApiFromDataModel,
        compileApiModel,
        mergeModels,
        hydrate }                               = require('./apiModel/index.node.js');


function sendToConsole(data, flow, meta) {
  console.log(JSON.stringify(data, null, 1));

  return flow.continue(data);
}

function removeID(data, flow, meta) {
  const filtered = {
    ...data,
    data :
      data.data.map(item => {
        const {id, ...rest} = item;
        return rest;
      })
  };

  return flow.continue(filtered);
}

const apiModel2_1 = {
  '/users' : {
    'filters' : {
      'GET' : [sendToConsole]
    }
  }
}

const apiModel2_2 = {
  '/users' : {
    'filters' : {
      'GET' : removeID
    }
  }
}

const apiModel2_3 = {
  '/users' : {
    'filters' : {
      'GET' : sendToConsole
    }
  }
}

const options = { useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false};
mongoose.connect("mongodb://localhost:27017/database", options);

const api = new API();
api
  .addApiModel(apiModel2_1)
  .addApiModel(apiModel2_2)
  .addApiModel(apiModel2_3)
  .createApi(mongoose)
  .listen(3000);

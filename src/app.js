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



const dataModel1 = {
    'users': {
        schema: {
            'name' : {type : 'String', 'default' : 'Jean'},
            'surname' : {type: 'String', 'default' : 'Dupont'},
            'job' : {type : 'String', 'default' : 'None'},
            'role' : {type : 'String', 'required' : true}
        }
    }
};

const dataModel2 = {
    'cars': {
        schema: {
            'brand' : {type : 'String', 'required' : true},
            'model' : {type : 'String', 'default' : 'None'}
        }
    }
};

const dataModel3 = {
    'users': {
        schema: {
            // 'identity': {
              'name' : {type : 'String', 'default' : 'Jean'},
              'surname' : {type: 'String', 'default' : 'Dupont'},
            // },
            'job' : {type : 'String', 'default' : 'None'},
            'role' : {type : 'String', 'required' : true},
        }
    }
};

const dataModel4 = {
    'moto': {
        schema: {
            'brand' : {type : 'String', 'required' : true},
            'model' : {type : 'String', 'default' : 'None'}
        }
    }
};


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


const compiledDataModel = compileDataModel(dataModel4);
const library = createLibraryFromDataModel(dataModelToMongoose(compiledDataModel, mongoose));
const apiModel = compileApiModel(createApiFromDataModel(compiledDataModel));
const api_moto = hydrate(apiModel, library);

const options = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};
mongoose.connect("mongodb://localhost:27017/database", options);

const api = new API(dataModel2);
api
  // .addDataModel(dataModel2)
  // .addDataModel(dataModel3)
  // .addApiModel(api_moto)
  .addApiModel(apiModel2_1)
  .addApiModel(apiModel2_2)
  .addApiModel(apiModel2_3)
  .listen(3000, mongoose);

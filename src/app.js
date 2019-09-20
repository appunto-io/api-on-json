const { API, DB } = require('./index.js');

const dataModel1 = {
    'users': {
        schema: {
            'identity': {
              'name' : {type : 'String', 'default' : 'Jean'},
              'surname' : {type: 'String', 'default' : 'Dupont'},
              'age' : {type: 'Number'}
            },
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
            'identity': {
              'name' : {type : 'String', 'default' : 'Jean'},
              'surname' : {type: 'String', 'default' : 'Dupont'}
            },
            'job' : {type : 'String', 'default' : 'None'},
            'role' : {type : 'String', 'required' : true},
        }
    }
};

const options = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

const db = new DB("mongo", "mongodb://localhost:27017/database", options);
const api = new API(dataModel1, db);
api
  .addDataModel(dataModel2)
  .addDataModel(dataModel3)
  .listen(3000);

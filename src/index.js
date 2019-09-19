const mongoose = require('mongoose');
const { apiFromJson } = require('./api.js');
const { createServer } = require('./backend/index.js');

dataModel = {
    'users': {
        schema: {
            'identity': {
              'name' : {type : 'String', 'default' : 'Jean'},
              'surname' : {type: 'String', 'default' : 'Dupont'},
              'age' : {type: 'Number'}
            },
            'job' : {type : 'String', 'default' : 'None'},
            'role' : {type : 'String', 'required' : true},
        }
    }
};

const options = { useNewUrlParser : true , useUnifiedTopology: true, useFindAndModify: false};
mongoose.connect("mongodb://localhost:27017/database", options);

var db = mongoose.connection;

if (!db)
{
    console.log('Unable to connect to the Mongo Database');
}
else
{
    console.log('Congrats we are connected!');
}

const api = apiFromJson(dataModel, mongoose);
const server = createServer(api);
server.listen(3000);

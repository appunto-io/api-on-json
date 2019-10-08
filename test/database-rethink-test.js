const { Rethink } = require('../src/database/database.js');

require('dotenv').config({path: __dirname + '/.env'});

const databaseGenericTestSuite = require('./database-generic-test.js');
const chai                     = require('chai');
const expect                   = chai.expect;


/**********************************************
  Testsuite
*/

const carModel = {
  'Car': {
    schema: {
      'brand' : {type : 'String', 'required' : true},
      'model' : {type: 'String', 'default' : 'Default Model'},
      'serial': {type: 'String', 'index' : true, 'unique': true}
    },
    options: {}
  }
};

describe('rethink database class test suite', async function() {
  var id;

  const hostname = process.env.HOST;
  const port = process.env.PORT;

  var db = new Rethink(hostname, port, "unitary");
  before(async() => {
    await db.connect();
    await db.init(carModel);
  });

  after(async () => {
    db.database.getPoolMaster().drain();
  });


  describe('generic tests', async function() {
    await databaseGenericTestSuite(db);
  });
});

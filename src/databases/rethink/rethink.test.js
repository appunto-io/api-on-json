const { Rethink } = require('./rethink.js');

const databaseGenericTestSuite = require('../database-generic.test.js');
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

  var db = new Rethink("localhost", "28015", "unitary");
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

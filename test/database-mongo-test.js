const mongoose              = require('mongoose');
const { Mongo } = require('../src/database/database.js');
const { MongoMemoryServer } = require('mongodb-memory-server');

const chai   = require('chai');
const expect = chai.expect;

/**********************************************
  Testsuite
*/

const carSchema = new mongoose.Schema({
  'brand' : {type : 'String', 'required' : true},
  'model' : {type: 'String', 'default' : 'Default Model'},
  'serial': {type: 'String', 'unique': true}
});

/**********************************************
Initialization of an in-memory MongoDB server
that backs the API to be tested
*/
describe('mongo database class test suite', async function() {
  var id;
  let db;
  let mongoServer;

  const options = { useNewUrlParser : true ,
                    useUnifiedTopology: true,
                    useFindAndModify: false};
  before((done) => {
    mongoServer = new MongoMemoryServer();
    mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      db = new Mongo(mongoUri, options);
      return db.connect();
    })
    .then(async() => {
      db.database.model('cars', carSchema);
      done()
    });
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Empty database', async function() {
    it('Should return an empty list', async function() {
      const result = await db.readMany('cars');

      expect(result).to.be.an('object');
      expect(result).to.not.be.empty;
      expect(result.documents).to.be.an('array');
      expect(result.count).to.be.equal(0);
    });
  });

  /********
  CREATE
  */
  describe('Create elements', async function() {
    it('Should add one element to the database', async function() {
      const result = await db.create('cars', {
        brand : 'Tesla',
        model : 'Model S',
        serial : 'AAAAA',
      });

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('AAAAA');
      id = result.id;
    });

    it('Should use defaults on missing fields', async function() {
      const result = await db.create('cars', {brand: 'Audi', serial: 'B'});
      expect(result.brand).to.be.equal('Audi');
      expect(result.model).to.be.equal('Default Model');
      expect(result.serial).to.be.equal('B');
    });

    it('Should ignore unknown fields', async function() {
      const result = await db.create('cars', {brand: 'Alpha Romeo', price: '112$', serial: 'C'});

      expect(result.brand).to.be.equal('Alpha Romeo');
      expect(result.serial).to.be.equal('C');
      expect(result.price).to.be.undefined;
    });

    it('Should fail when required fields are missing', async function() {
      try {
        const result = await db.create('cars', {model: 'A1', serial: 'BBBBB'});
      }
      catch (error) {
        expect(error).to.not.be.null;
      }
    });

    it('Should fail on duplicated unique field', async function() {
      try {
        const result = await post('cars', {serial: 'AAAAA'});
      }
      catch (error) {
        expect(error).to.not.be.null;
      }
    });
  });

  /********
  READ
  */

  describe('Retrieve elements', async function() {
    it('Should retrieve one element by id', async function() {
      const result = await db.readOne('cars', id);

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('AAAAA');
    });
  });
});

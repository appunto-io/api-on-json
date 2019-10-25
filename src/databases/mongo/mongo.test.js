const mongoose                 = require('mongoose');
const { Mongo }                = require('./mongo.js');
const { MongoMemoryServer }    = require('mongodb-memory-server');
const databaseGenericTestSuite = require('../database-generic.test.js');

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
    .then(async(mongoUri) => {
      db = new Mongo(mongoUri, options);
      return await db.connect();
    })
    .then(async() => {
      await db.database.model('Car', carSchema);
      done()
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });


  describe('Generic tests', async function() {
    it('Should run the generic testsuite', async function() {

      const result = await db.readMany('Car');

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
      const result = await db.create('Car', {
        brand : 'Tesla',
        model : 'Model S',
        serial : 'A',
      });

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('A');
      id = result.id;
    });

    it('Should use defaults on missing fields', async function() {
      const result = await db.create('Car', {brand: 'Audi', serial: 'B'});
      expect(result.brand).to.be.equal('Audi');
      expect(result.model).to.be.equal('Default Model');
      expect(result.serial).to.be.equal('B');
    });

    it('Should ignore unknown fields', async function() {
      const result = await db.create('Car', {brand: 'Alpha Romeo', price: '112$', serial: 'C'});

      expect(result.brand).to.be.equal('Alpha Romeo');
      expect(result.serial).to.be.equal('C');
      expect(result.price).to.be.undefined;
    });

    it('Should fail when required fields are missing', async function() {
      try {
        const result = await db.create('Car', {model: 'A1', serial: 'BBBBB'});
      }
      catch (error) {
        expect(error).to.not.be.null;
      }
    });

    it('Should fail on duplicated unique field', async function() {
      try {
        const result = await post('Car', {serial: 'A'});
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
      const result = await db.readOne('Car', id);

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('A');
    });

    it('Should retrieve all elements', async function() {
      const result = await db.readMany('Car');

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(3);

      expect(result.documents).to.be.an('array');
      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Audi');
      expect(result.documents[2].brand).to.be.equal('Alpha Romeo');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Default Model');
      expect(result.documents[2].model).to.be.equal('Default Model');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('B');
      expect(result.documents[2].serial).to.be.equal('C');

      expect(result.cursor).to.be.equal(result.documents[result.documents.length - 1].id);
    });

    /*******
    QUERY
    */
    it('Should handle pagination', async function() {
      await db.create('Car', {brand: 'Renault', model: 'Megane', serial: 'D'});
      await db.create('Car', {brand: 'Peugeot', model: '208', serial: 'E'});
      await db.create('Car', {brand: 'Mercedes', model: 'AMG', serial: 'F'});
      await db.create('Car', {brand: 'Ford', model: 'Anglia', serial: 'G'});

      let page = 0,
      pageSize = 2;

      const result = await db.readMany('Car', {pageSize, page});

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');
      expect(result.documents.length).to.be.equal(pageSize);

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.undefined;

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Audi');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Default Model');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('B');

      page = 2;
      const result2 = await db.readMany('Car', {pageSize, page});

      expect(result2).to.be.an('object');
      expect(result2.count).to.be.equal(7);

      expect(result2.documents).to.be.an('array');
      expect(result2.documents.length).to.be.equal(pageSize);

      expect(result2.documents[0]).to.be.an('object');
      expect(result2.documents[1]).to.be.an('object');
      expect(result2.documents[2]).to.be.undefined;

      expect(result2.documents[0].brand).to.be.equal('Peugeot');
      expect(result2.documents[1].brand).to.be.equal('Mercedes');

      expect(result2.documents[0].model).to.be.equal('208');
      expect(result2.documents[1].model).to.be.equal('AMG');

      expect(result2.documents[0].serial).to.be.equal('E');
      expect(result2.documents[1].serial).to.be.equal('F');
    });



    it('Should get the element according to their name', async function() {
      const result = await db.readMany('Car', { sort: 'brand' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Alpha Romeo');
      expect(result.documents[1].brand).to.be.equal('Audi');
      expect(result.documents[2].brand).to.be.equal('Ford');
      expect(result.documents[3].brand).to.be.equal('Mercedes');

      expect(result.documents[0].model).to.be.equal('Default Model');
      expect(result.documents[1].model).to.be.equal('Default Model');
      expect(result.documents[2].model).to.be.equal('Anglia');
      expect(result.documents[3].model).to.be.equal('AMG');

      expect(result.documents[0].serial).to.be.equal('C');
      expect(result.documents[1].serial).to.be.equal('B');
      expect(result.documents[2].serial).to.be.equal('G');
      expect(result.documents[3].serial).to.be.equal('F');
    });

    it('Should get the element in descandant order', async function() {
      const result = await db.readMany('Car', { sort: 'brand', order: 'desc' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Renault');
      expect(result.documents[2].brand).to.be.equal('Peugeot');
      expect(result.documents[3].brand).to.be.equal('Mercedes');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Megane');
      expect(result.documents[2].model).to.be.equal('208');
      expect(result.documents[3].model).to.be.equal('AMG');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('D');
      expect(result.documents[2].serial).to.be.equal('E');
      expect(result.documents[3].serial).to.be.equal('F');
    });

    it('Should get the element with highest value1 but lower value2', async function() {
      const value1 = 'model,desc';
      const value2 = 'brand,asc';

      const result = await db.readMany('Car', { sort: [value1, value2] });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Renault');
      expect(result.documents[2].brand).to.be.equal('Alpha Romeo');
      expect(result.documents[3].brand).to.be.equal('Audi');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Megane');
      expect(result.documents[2].model).to.be.equal('Default Model');
      expect(result.documents[3].model).to.be.equal('Default Model');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('D');
      expect(result.documents[2].serial).to.be.equal('C');
      expect(result.documents[3].serial).to.be.equal('B');
    });

    /******
    CURSOR
    */
    it('Should get the elements after the cursor', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const cursor = documents[2].id.toString();

      const result = await db.readMany('Car', { cursor });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');
      expect(result.documents.length).to.be.equal(documents.length - 3);

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal(documents[3].brand);
      expect(result.documents[1].brand).to.be.equal(documents[4].brand);

      expect(result.documents[0].model).to.be.equal(documents[3].model);
      expect(result.documents[1].model).to.be.equal(documents[4].model);

      expect(result.documents[0].serial).to.be.equal(documents[3].serial);
      expect(result.documents[1].serial).to.be.equal(documents[4].serial);
    });

    it('Should get a response with an empty data', async function() {
      const response  = await db.readMany('Car');
      let last_id = response.cursor.toString();

      const result = await db.readMany('Car', { cursor: last_id });

      expect(result).to.be.an('object');
      expect(result).to.not.be.empty;
      expect(result.documents).to.be.an('array');
      expect(result.documents).to.be.empty;
      expect(result.count).to.be.equal(7);
    });

    it('Should get the element in orderby name and in descandant order starting after cursor', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const cursor = 'brand' + ';' + documents[4].brand + ';' + documents[4].id;
      const result = await db.readMany('Car', { cursor, sort: 'brand', order: 'desc' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Mercedes');
      expect(result.documents[1].brand).to.be.equal('Ford');
      expect(result.documents[2].brand).to.be.equal('Audi');
      expect(result.documents[3].brand).to.be.equal('Alpha Romeo');

      expect(result.documents[0].model).to.be.equal('AMG');
      expect(result.documents[1].model).to.be.equal('Anglia');
      expect(result.documents[2].model).to.be.equal('Default Model');
      expect(result.documents[3].model).to.be.equal('Default Model');

      expect(result.documents[0].serial).to.be.equal('F');
      expect(result.documents[1].serial).to.be.equal('G');
      expect(result.documents[2].serial).to.be.equal('B');
      expect(result.documents[3].serial).to.be.equal('C');
    });
  });

  /********
  UPDATE
  */
  describe('Update elements', async function() {
    it('Should update the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const result = await db.update('Car', documents[2].id, {brand: 'Daccia', model: 'Sandero', serial:'Z'});

      expect(result.brand).to.be.equal('Daccia');
      expect(result.model).to.be.equal('Sandero');
      expect(result.serial).to.be.equal('Z');
      expect(result.id.toString()).to.be.equal(documents[2].id.toString());
    });

    it('Should only change one field of the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const result = await db.patch('Car', documents[2].id, { brand: 'Dacia'} );

      expect(result.brand).to.be.equal('Dacia');
      expect(result.model).to.be.equal('Sandero');
      expect(result.serial).to.be.equal('Z');
      expect(result.id.toString()).to.be.equal(documents[2].id.toString());
    });

    it('Should fail when required fields are missing', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      try {
        const result = await db.update('Car', documents[2].id, {model: 'Romero'});
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });

    it('Should fail on duplicated unique field', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      try {
        const result = await db.update('Car', documents[2].id, {serial: 'A'});
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });
  });

  /********
  DELETE
  */
  describe('Delete elements', async function() {
    it('Should delete the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const result = await db.remove('Car', documents[1].id);

      expect(result.brand).to.be.equal(documents[1].brand);
      expect(result.model).to.be.equal(documents[1].model);
      expect(result.serial).to.be.equal(documents[1].serial);
      expect(result.id.toString()).to.be.equal(documents[1].id.toString());

      try {
        await db.readOne('Car', documents[1].id);
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });
  });
});

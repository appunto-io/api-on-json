const mongoose              = require('mongoose');
const assert                = require('assert');
const chai                  = require('chai');
const chaiHTTP              = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { API }               = require('../src/index.js');
const { Mongo }             = require('../src/database/database.js');

const expect = chai.expect;
chai.use(chaiHTTP);


/**********************************************
  Initialization of an in-memory MongoDB server
  that backs the API to be tested
*/
let mongoServer;
let db;
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
    .then(() => done());
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// TBD
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1Yv6_KkkdfizAkirOLkPh_xnFGu8B_003xZvu_YxgFY';


/**********************************************
  Generic HTTP requests based on chai HTTP
*/
async function get(collection) {
  return chai.request('http://localhost:3000')
    .get(`/${collection}`)
    .set('Authorization', token);
}

async function getId(collection, id) {
  return chai.request('http://localhost:3000')
    .get(`/${collection}/` + id)
    .set('Authorization', token);
}

async function post(collection, data) {
  return chai.request('http://localhost:3000')
    .post(`/${collection}`)
    .set('Authorization', token)
    .send(data);
}

async function put(collection, id, data) {
  return chai.request('http://localhost:3000')
    .put(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function erase(collection, id) {
  return chai.request('http://localhost:3000')
    .delete(`/${collection}/` + id)
    .set('Authorization', token);
}


/**********************************************
  Testsuite
*/

const dataModelCar = {
    'cars': {
        schema: {
            'brand' : {type : 'String', 'required' : true},
            'model' : {type: 'String', 'default' : 'Default Model'},
            'speed' : {type: 'Number', 'min': 0, 'max': 300},
            'serie': {type: 'String', 'unique': true}
        }
    }
};

describe('api-on-json test suite', async function() {
  var id;
  before(async function() {
    this.api = new API(dataModelCar);
    await this.api.setDatabase(db);
    await this.api.listen(3000);
  });

  after(async function() {
    await this.api.close();
  });

  describe('Adding an element', async function() {
    it('Should return an empty list', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(0);
    });

    it('Should add the element to the database', async function() {
      const response = await post('cars', {brand: 'Tesla', serie: 'AAABABAABABA'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Default Model');
      expect(response.body.serie).to.be.equal('AAABABAABABA');

      id = response.body.id;
    });

    it('Should verify if the element has been added', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(1);
      expect(response.body.data[0].brand).to.be.equal('Tesla');
      expect(response.body.data[0].model).to.be.equal('Default Model');
      expect(response.body.data[0].serie).to.be.equal('AAABABAABABA');
    });
  });

  describe('Add multiple elements', async function() {
    it('Should add 3 elements and verify if all went well', async function() {
      const response = await post('cars', {brand: 'Renault', model: 'Megane', serie: 'XXXXX'});
      await post('cars', {brand: 'Audi', model: 'A1', serie: 'RTRTTRTRRRTTR'});
      await post('cars', {brand: 'Ford', model: 'Focus', serie: 'OPOPPPOOOO'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Renault');
      expect(response.body.model).to.be.equal('Megane');
    });
    it('ItemCount should be equal to 4', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(4);
    });
  });

  describe('Update the element at id', async function() {
    it('Should change the element at id', async function() {
      const response = await put('cars', id, { brand: 'Tesla', model: 'Model E' });

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Model E');
    });

    it('Should verify that the element has changed', async function() {
      const response = await getId('cars', id);

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Model E');
    });
  });

  describe('Delete the element at id', async function() {
    it('Should delete the element at id', async function() {
      const response = await erase('cars', id);

      expect(response).to.have.status(200);
    });

    it('Should verify that the element has been deleted', async function() {
      const response = await getId('cars', id);

      expect(response).to.have.status(404);
      expect(response.body.message).to.not.be.null;
      expect(response.body.name).to.not.be.null;
    });

    it('Should verify that the ItemCount has been changed accordingly', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(3);
    });
  });

  describe('Add an element in the database omitting a required field', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await post('cars', {model: 'Megane', serie: 'JJEJEKKEJJEJ'});

      expect(response).to.have.status(400);
      expect(response.body.message).to.include('required');
    });
  });

  describe('Add an element in the database with an already used unique field', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await post('cars', {brand: 'Dacia', model: 'Sandero', serie: 'XXXXX'});

      expect(response).to.have.status(400);
      expect(response.body.errmsg).to.include('duplicate key error');
    });
  });
});

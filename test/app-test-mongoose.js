const mongoose              = require('mongoose');
const assert                = require('assert');
const chai                  = require('chai');
const chaiHTTP              = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { API } = require('../src/index.js');

const expect = chai.expect;
chai.use(chaiHTTP);


/**********************************************
  Initialization of an in-memory MongoDB server
  that backs the API to be tested
*/
let mongoServer;

const options = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

before((done) => {
  mongoServer = new MongoMemoryServer();
  mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      return mongoose.connect(mongoUri, options, err => {
        if (err) done(err);
      });
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
            'model' : {type: 'String', 'default' : 'Default Model'}
        }
    }
};

describe('api-on-json test suite', async function() {
  var id;
  before(async function() {
    this.id = 1;
    this.api = new API(dataModelCar);
    this.api.createApi(mongoose);
    await this.api.listen(3000);
  });

  after(async function() {
    await this.api.close();
  });

  describe('Read in an empty database', async function() {
    it('Should return a 200 status code, and have an JSON body with informations', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(0);
    });
  });

  describe('Create with no data in body', async function() {
    it('Should return a 500 status code, with nothing', async function() {
      const response = await post('cars');

      expect(response).to.have.status(500);
    });
  });

  describe('Add a first element in the database', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await post('cars', {brand: 'Tesla'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Default Model');

      id = response.body.id;
    });
  });

  describe('Read in the database', async function() {
    it('Should return a 200 status code, and have an JSON body with an itemCount to 1', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(1);
    });
  });

  describe('Add a second element in the database', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await post('cars', {brand: 'Renault', model: 'Megane'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Renault');
      expect(response.body.model).to.be.equal('Megane');
    });
  });

  describe('Add a third element in the database', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await post('cars', {brand: 'Audi', model: 'A1'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Audi');
      expect(response.body.model).to.be.equal('A1');
    });
  });

  describe('Read in the database', async function() {
    it('Should return a 200 status code, and have an JSON body with an itemCount to 3', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(3);
    });
  });

  describe('Update the element at id', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await put('cars', id, { brand: 'Tesla', model: 'Model E' });

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Model E');
    });
  });

  describe('Read the element at id', async function() {
    it('Should return a 200 status code, with a JSON body', async function() {
      const response = await getId('cars', id);

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Model E');
    });
  });

  describe('Delete the element at id', async function() {
    it('Should return a 200 status code and a deletion confirmation', async function() {
      const response = await erase('cars', id);

      expect(response).to.have.status(200);
    });
  });

  describe('Read the element at id that has been deleted', async function() {
    it('Should return a 404 status code, with a JSON body', async function() {
      const response = await getId('cars', id);

      expect(response).to.have.status(404);
      expect(response.body.message).to.not.be.null;
      expect(response.body.name).to.not.be.null;
    });
  });

  describe('Read in the database after a delete', async function() {
    it('Should return a 200 status code, and have an JSON body with an itemCount to 2', async function() {
      const response = await get('cars');

      expect(response).to.have.status(200);
      expect(response.body.pagination.itemsCount).to.be.equal(2);
    });
  });
});

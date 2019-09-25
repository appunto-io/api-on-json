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

async function query(collection, query) {
  const queryString = Object.entries(query).map(
      ([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    ).join('&');

  return chai.request(`http://localhost:3000?${queryString}`)
    .get(`/${collection}`)
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

async function patch(collection, id, data) {
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

const dataModels = {
  'cars': {
    schema: {
      'brand' : {type : 'String', 'required' : true},
      'model' : {type: 'String', 'default' : 'Default Model'},
      'serial': {type: 'String', 'unique': true}
    }
  },
  'fruits' : {
    options : {
      timestamps : {
        createdAt : 'creationDate',
        updatedAt : 'modificationDate'
      }
    },
    schema : {
      name : 'String'
    }
  },
  'users' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : {type: 'String', 'unique': true}
    }
  },
  'flowers' : {
    schema : {
      name : 'String',
      age_in_days: 'Number'
    }
  }
};

describe('api-on-json test suite', async function() {
  var id;
  before(async function() {
    this.api = new API(dataModels);
    await this.api.setDatabase(db);
    await this.api.listen(3000);
  });

  after(async function() {
    await this.api.close();
  });

  describe('Empty database', async function() {
    it('Should return an empty list', async function() {
      const response = await get('cars');

      const { data, pagination } = response.body;

      expect(response).to.have.status(200);
      expect(data).to.be.an('array');
      expect(data).to.be.empty;
      expect(pagination.itemsCount).to.be.equal(0);
    });
  });


  /********
  CREATE
  */
  describe('Create elements', async function() {
    it('Should add one element to the database', async function() {
      const response = await post('cars', {
        brand : 'Tesla',
        model : 'Model S',
        serial : 'AAAAA',
      });

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Tesla');
      expect(response.body.model).to.be.equal('Model S');
      expect(response.body.serial).to.be.equal('AAAAA');
      expect(response.body.createdAt).to.be.a('string');
      expect(response.body.updatedAt).to.be.a('string');
    });

    it('Should use defaults on missing fields', async function() {
      const response = await post('cars', {brand: 'Audi'});

      expect(response).to.have.status(200);
      expect(response.body.brand).to.be.equal('Audi');
      expect(response.body.model).to.be.equal('Default Model');
      expect(response.body.serial).to.be.undefined;
      expect(response.body.createdAt).to.be.a('string');
      expect(response.body.updatedAt).to.be.a('string');
    });

    it('Should be possible to change default timestamp names', async function() {
      const response = await post('fruits', {name : 'Apple'});

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Apple');
      expect(response.body.id).to.be.a('string');
      expect(response.body.createdAt).to.be.undefined;
      expect(response.body.updatedAt).to.be.undefined;
      expect(response.body.creationDate).to.be.a('string');
      expect(response.body.modificationDate).to.be.a('string');
    });

    it('Should be possible to avoid default timestamps', async function() {
      const response = await post('users', {name : 'Mario'});

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Mario');
      expect(response.body.id).to.be.a('string');
      expect(response.body.createdAt).to.be.undefined;
      expect(response.body.updatedAt).to.be.undefined;
    });

    it('Should ignore unknown fields', async function() {
      const response = await post('users', {name: 'Luigi', job: 'plomber'});

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Luigi');
      expect(response.body.job).to.be.undefined;
      expect(response.body.id).to.be.a('string');
      expect(response.body.createdAt).to.be.undefined;
      expect(response.body.updatedAt).to.be.undefined;
    });

    it('Should fail when required fields are missing', async function() {
      const response = await post('cars', {model: 'A1', serial: 'BBBBB'});

      expect(response).to.have.status(400);
    });

    it('Should fail on duplicated unique field', async function() {
      const response = await post('users', {name: 'Mario'});

      expect(response).to.have.status(400);
    });
  });


  /********
  READ
  */
  let createdDocuments;
  describe('Retrieve elements', async function() {
    const flowerNames = ['Daisy', 'Rose', 'Lily', 'Tulip', 'Orchid', 'Carnation', 'Hyacinth', 'Chrysanthemum'];

    before(async function() {
      const responses = await Promise.all(flowerNames.map(name => post('flowers', {name})));
      createdDocuments = responses.map(({body}) => body);
    });

    it('Should retrieve one element by id', async function() {
      const response = await getId('flowers', createdDocuments[0].id);

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Daisy');
      expect(response.body.id).to.be.a('string');
      expect(response.body.createdAt).to.be.a('string');
      expect(response.body.updatedAt).to.be.a('string');
    });

    it('Should retrieve all elements', async function() {
      const response = await get('flowers');

      expect(response).to.have.status(200);
      expect(response.body.data[0].name).to.be.oneOf(flowerNames);
      expect(response.body.data[1].name).to.be.oneOf(flowerNames);
      expect(response.body.data[2].name).to.be.oneOf(flowerNames);
      expect(response.body.data[3].name).to.be.oneOf(flowerNames);
      expect(response.body.data[4].name).to.be.oneOf(flowerNames);
      expect(response.body.data[5].name).to.be.oneOf(flowerNames);
      expect(response.body.data[6].name).to.be.oneOf(flowerNames);
      expect(response.body.data[7].name).to.be.oneOf(flowerNames);
      expect(response.body.pagination.itemsCount).to.be.equal(8);
    });

    it('Should handle pagination', async function() {
      await query('flowers', {pageSize : 2, page : 1})
    });
  });


  /********
  UPDATE
  */
  describe('Update elements', async function() {
    it('Should update the element at id', async function() {
      const response = await put('flowers', createdDocuments[0].id, { name: 'Sunflower', age_in_days: 24} );

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Sunflower');
      expect(response.body.age_in_days).to.be.equal(24);
      expect(response.body.id).to.be.a('string');
      expect(response.body.id).to.be.equal(createdDocuments[0].id);
      expect(response.body.createdAt).to.be.a('string');
      expect(response.body.updatedAt).to.be.a('string');
    });

    it('Should only change one field of the element at id', async function() {
      const response = await patch('flowers', createdDocuments[0].id, { name: 'Daisy'} );

      expect(response).to.have.status(200);
      expect(response.body.name).to.be.equal('Daisy');
      expect(response.body.age_in_days).to.be.equal(24);
      expect(response.body.id).to.be.a('string');
      expect(response.body.id).to.be.equal(createdDocuments[0].id);
      expect(response.body.createdAt).to.be.a('string');
      expect(response.body.updatedAt).to.be.a('string');
    });
  });


  /********
  DELETE
  */
  describe('Delete elements', async function() {
    it('Should delete the element at id', async function() {
      const response = await erase('flowers', createdDocuments[0].id);

      expect(response).to.have.status(200);

      const response2 = await getId('flowers', createdDocuments[0].id);

      expect(response2).to.have.status(404);
    });
  });
});


/*
  GET /collection
  ---
  {
    data : [Object],
    pagination : {
      page : Number,
      pageSize : Number,
      itemCounts : Number
    }
  }

  GET /collection/:id
  ---
  Object

  GET /collection?query
  ---
  {
    data : [Object],
    pagination : {
      page : Number,
      pageSize : Number,
      itemCounts : Number
    }
  }

  POST /collection
  Object
  Object // created object

  PUT /collection/:id
  Object
  Object // created object

  PATCH /collection/:id
  Object // fields to be modified
  Object // updated object

  DELETE /collection/:id
  ---
  Object // deleted object


  -----------------------

  GET /collection/:id1/:id2/:id3

*/

const mongoose              = require('mongoose');
const chai                  = require('chai');
const chaiHTTP              = require('chai-http');
const jwt                   = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Mongo, Rethink }    = require('./databases/databases.js');

const { DataModel }         = require('./index.js');


const expect = chai.expect;
chai.use(chaiHTTP);


// TBD
const jwtSecret = "--default-jwt-secret--";

const token = 'Bearer ' + jwt.sign({ role: 'admin' }, jwtSecret);

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
  return chai.request('http://localhost:3000')
    .get(`/${collection}`)
    .query(query)
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
    .patch(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function erase(collection, id) {
  return chai.request('http://localhost:3000')
    .delete(`/${collection}/` + id)
    .set('Authorization', token);
}

async function options(collection) {
  return chai.request('http://localhost:3000')
    .options(`/${collection}`)
    .set('Authorization', token);
}


/**********************************************
  Testsuite
*/

async function databaseTestSuite() {
  describe('generic api-on-json test suite', async function() {
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
        const response = await post('cars', {brand: 'Audi', serial: 'ZZZZZ'});

        expect(response).to.have.status(200);
        expect(response.body.brand).to.be.equal('Audi');
        expect(response.body.model).to.be.equal('Default Model');
        expect(response.body.serial).to.be.equal('ZZZZZ');
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

      it('Should fail when required fields are missing', async function() {
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
    const flowerNames = ['Daisy', 'Rose', 'Lily', 'Tulip', 'Tulip', 'Orchid', 'Carnation', 'Hyacinth', 'Chrysanthemum'];
    const ages        = [ 20,       21,     21,      21,      50,      25,        18,          23,           30];
    const serials     = [ 'A',      'B',    'C',    'D',     'E',     'F',       'G',         'H',          'I'];

    describe('Retrieve elements', async function() {
      before(async function() {
        const responses = [];

        for (let index = 0; index < flowerNames.length; index++) {
          responses[index] = await post('flowers', {name: flowerNames[index], age_in_days: ages[index], serial: serials[index]});
        }

        createdDocuments = responses.map(({body}) => body);
        createdDocuments.sort((a, b) => (a.id > b.id) ? 1 : -1);
      });

      it('Should retrieve one element by id', async function() {
        const response = await getId('flowers', createdDocuments[0].id);

        expect(response).to.have.status(200);
        expect(response.body.name).to.be.equal(createdDocuments[0].name);
        expect(response.body.id).to.be.a('string');
        expect(response.body.createdAt).to.be.a('string');
        expect(response.body.updatedAt).to.be.a('string');
      });

      it('Should retrieve all elements', async function() {
        const response = await get('flowers');

        expect(response).to.have.status(200);

        for(let index = 0; index < createdDocuments.length; index++) {
          expect(response.body.data).to.deep.include(createdDocuments[index]);
        }

        expect(response.body.pagination.itemsCount).to.be.equal(createdDocuments.length);
      });


      /*******
      QUERY
      */
      it('Should handle pagination', async function() {
        let page = 0,
        pageSize = 2;

        const response = await query('flowers', {pageSize, page});

        expect(response).to.have.status(200);

        for (let i = page * pageSize; i < page * pageSize + pageSize; i++) {
          expect(response.body.data[i - page * pageSize]).to.deep.equal(createdDocuments[i]);
        }

        expect(response.body.data.length).to.be.equal(pageSize);

        page = 3;
        const response2 = await query('flowers', {pageSize, page});

        expect(response2).to.have.status(200);

        for (let i = page * pageSize; i < page * pageSize + pageSize; i++) {
          expect(response2.body.data[i - page * pageSize]).to.deep.equal(createdDocuments[i]);
        }

        expect(response2.body.data.length).to.be.equal(pageSize);
      });

      it('Should get the elements after the cursor', async function() {
        let cursor = createdDocuments[3].id;

        const response = await query('flowers', { cursor });

        expect(response).to.have.status(200);
        expect(response.body.data[0].name).to.be.equal(createdDocuments[4].name);
        expect(response.body.data[1].name).to.be.equal(createdDocuments[5].name);
      });

      it('Should get a response with an empty data', async function() {
        let last_id = createdDocuments[createdDocuments.length - 1].id;

        const response = await query('flowers', { cursor: last_id });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data).to.be.empty;
      });

      it('Should get the element according to their name', async function() {
        const response = await query('flowers', { sort: 'name' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data[0].name).to.be.equal('Carnation');
        expect(response.body.data[1].name).to.be.equal('Chrysanthemum');
        expect(response.body.data[2].name).to.be.equal('Daisy');
      });

      it('Should get the element in descandant order', async function() {
        const response = await query('flowers', { sort: 'name', order: 'desc' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data[0].name).to.be.equal('Tulip');
        expect(response.body.data[1].name).to.be.equal('Tulip');
        expect(response.body.data[2].name).to.be.equal('Rose');
      });

      it('Should get the element with highest value1 but lower value2', async function() {
        const value1 = 'name,desc';
        const value2 = 'age_in_days,asc';

        const response = await query('flowers', { sort: [value1, value2] });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data[0].name).to.be.equal('Tulip');
        expect(response.body.data[1].name).to.be.equal('Tulip');
        expect(response.body.data[0].age_in_days).to.be.equal(21);
        expect(response.body.data[1].age_in_days).to.be.equal(50);
      });


      /******
      CURSOR
      */
      it('Should get an empty data because no more elements after cursor', async function() {
        const get_response = await get('flowers');
        const last         = get_response.body.pagination.cursor;

        const response = await query('flowers', { cursor: last });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data).to.be.empty;
      });

      it('Should get all elements after cursor', async function() {
        const cursor = 'name;' + createdDocuments[4].name + ';' + createdDocuments[4].id;

        const response = await query('flowers', { cursor, order: 'desc' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.map(({id}) => id)).not.to.deep.equal([createdDocuments[4].id, createdDocuments[3].id]);
      });

      it('Should get the element in orderby name and in descandant order starting after cursor', async function() {
        const cursor = 'name;' + createdDocuments[1].name + ';' + createdDocuments[1].id;
        const response = await query('flowers', { cursor, sort: 'name', order: 'desc' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        if (response.body.data[0]) {
          expect(response.body.data[0].name < createdDocuments[1].name).to.be.true;
        }

        if (response.body.data[1]) {
          expect(response.body.data[1].name < response.body.data[0].name).to.be.true;
        }
      });
    });

    /********
    UPDATE
    */
    describe('Update elements', async function() {
      it('Should update the element at id', async function() {
        const response = await put('flowers', createdDocuments[0].id, {name: 'Sunflower', age_in_days: 24, serial: 'K'});

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

      it('Should fail when required fields are missing', async function() {
        const response = await put('flowers', createdDocuments[0].id, {age_in_days: 3});

        expect(response).to.have.status(400);
      });

      it('Should fail on duplicated unique field', async function() {
        const response = await put('flowers', createdDocuments[1].id, {name: 'Sunflower', serial: createdDocuments[2].serial});

        expect(response).to.have.status(400);
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

    /********
    OPTIONS
    */
    describe('OPTIONS request', async function() {
      it('default cors', async function() {
        const response = await options('flowers');

        expect(response).to.have.status(204);
        expect(response.headers['access-control-allow-origin']).to.be.equal('*');
        expect(response.headers['access-control-allow-methods']).to.be.equal('GET, HEAD, PUT, PATCH, POST, DELETE');
      });
    });

    describe('OPTIONS request', async function() {
      it('custom cors', async function() {
        const response = await options('users');

        expect(response).to.have.status(204);
        expect(response.headers['access-control-allow-origin']).to.be.equal('*');
        expect(response.headers['access-control-allow-methods']).to.be.equal('GET, HEAD, PUT, PATCH, POST, DELETE');
      });
    });
  });
}


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
      name : {type: 'String', 'required': true},
      age_in_days: 'Number',
      serial : {type: 'String', 'unique': true}
    }
  }
};

describe('api-on-json test suite', async function() {

  /**********************************************
  Initialization of an in-memory MongoDB server
  that backs the API to be tested
  */
  describe('api-on-json test suite mongoose', async function() {
    let db;
    let mongoServer;

    const options = { useNewUrlParser : true,
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
        const dataModel = new DataModel(dataModels);

        await db.connect();
        await db.init(dataModel.get());

        const opt = {
          realTime: false
        };

        const apiModel  = dataModel.toApi(opt);

        const env = {
          db,
          jwtSecret
        }

        this.server  = apiModel.toServer(env);
        await this.server.listen(3000);
        done()});
    });
    after(async () => {
      await this.server.close();
      await mongoose.disconnect();
      await mongoServer.stop();
    });

    databaseTestSuite();
  });

  describe('api-on-json test suite rethinkdb', async function() {
    let db = new Rethink("localhost", "28015", "db");

    const opt = {
      realTime: false
    };

    before(async() => {
      const dataModel = new DataModel(dataModels);

      await db.connect();
      await db.init(dataModel.get());
      const apiModel = dataModel.toApi(opt);

      const env = {
        db,
        jwtSecret
      }

      this.server2 = apiModel.toServer(env);
      await this.server2.listen(3000);

    });

    after(async () => {
      await this.server2.close();
    });

    databaseTestSuite();
  });
});

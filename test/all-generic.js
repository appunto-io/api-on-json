const chai                  = require('chai');
const chaiHTTP              = require('chai-http');
const jwt                   = require('jsonwebtoken');

const expect = chai.expect;
chai.use(chaiHTTP);


const jwtSecret = "--default-jwt-secret--";

const token = 'Bearer ' + jwt.sign({ roles: ['admin'] }, jwtSecret);

/**********************************************
  Generic HTTP requests based on chai HTTP
*/
async function get(collection) {
  return chai.request('http://localhost:3003')
    .get(`/${collection}`)
    .set('Authorization', token);
}

async function getId(collection, id) {
  return chai.request('http://localhost:3003')
    .get(`/${collection}/` + id)
    .set('Authorization', token);
}

async function query(collection, query) {
  return chai.request('http://localhost:3003')
    .get(`/${collection}`)
    .query(query)
    .set('Authorization', token);
}

async function post(collection, data) {
  return chai.request('http://localhost:3003')
    .post(`/${collection}`)
    .set('Authorization', token)
    .send(data);
}

async function put(collection, id, data) {
  return chai.request('http://localhost:3003')
    .put(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function patch(collection, id, data) {
  return chai.request('http://localhost:3003')
    .patch(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function erase(collection, id) {
  return chai.request('http://localhost:3003')
    .delete(`/${collection}/` + id)
    .set('Authorization', token);
}

async function options(collection) {
  return chai.request('http://localhost:3003')
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

      it('Should be able to create nested fields', async function() {
        const response = await post('nested', {
          level1 : {
            level1Value : 'val1',
            level2 : {
              level2Value : 'val2'
            }
          }
        });

        expect(response).to.have.status(200);
        expect(response.body.level1.level1Value).to.be.equal('val1');
        expect(response.body.level1.level2.level2Value).to.be.equal('val2');
      });
    });


    /********
    READ
    */
    let createdDocuments;
    const flowerNames  = ['Daisy', 'Rose', 'Lily', 'Tulip', 'Tulip', 'Orchid', 'Carnation', 'Hyacinth', 'Chrysanthemum'];
    const ages         = [ 20,       21,     21,      21,      50,      25,        18,          23,           30];
    const serials      = [ 'A',      'B',    'C',    'D',     'E',     'F',       'G',         'H',          'I'];
    const booleanValue = [ true,     false,  true,   false,   true,    false,     true,         false,       true];

    describe('Retrieve elements', async function() {
      before(async function() {
        const responses = [];

        for (let index = 0; index < flowerNames.length; index++) {
          responses[index] = await post('flowers', {name: flowerNames[index], age_in_days: ages[index], serial: serials[index], boolean_value : booleanValue[index]});
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

      it('Should be able to retireve nested fields', async function() {
        let response = await post('nested', {
          level1 : {
            level1Value : 'val1a',
            level2 : {
              level2Value : 'val2a'
            }
          }
        });

        expect(response).to.have.status(200);

        response = await getId('nested', response.body.id);

        expect(response).to.have.status(200);
        expect(response.body.level1.level1Value).to.be.equal('val1a');
        expect(response.body.level1.level2.level2Value).to.be.equal('val2a');
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

      it('Should get the element in descending order', async function() {
        const response = await query('flowers', { sort: 'name', order: 'desc' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data[0].name).to.be.equal('Tulip');
        expect(response.body.data[1].name).to.be.equal('Tulip');
        expect(response.body.data[2].name).to.be.equal('Rose');
      });

      it('Should sort element with syntax array event if only one sort value is specified', async function() {
        const value1 = 'age_in_days,asc';

        const response = await query('flowers', { sort: value1 });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data[0].name).to.be.equal('Carnation');
        expect(response.body.data[1].name).to.be.equal('Daisy');
        expect(response.body.data[0].age_in_days).to.be.equal(18);
        expect(response.body.data[1].age_in_days).to.be.equal(20);
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

      it('Should filter elements by field', async function() {
        const response = await query('flowers', { name: 'Tulip' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.equal(2);
        expect(response.body.data[0].name).to.be.equal('Tulip');
        expect(response.body.data[1].name).to.be.equal('Tulip');
      });

      it('Should filter elements by fields, values specified in an array', async function() {
        const response = await query('flowers', { name: 'Tulip,Lily' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.equal(3);
        expect(response.body.data[0].name).to.be.equal('Lily');
        expect(response.body.data[1].name).to.be.equal('Tulip');
        expect(response.body.data[2].name).to.be.equal('Tulip');
      });

      it('Should filter elements by fields, numbers', async function() {
        const response = await query('flowers', { age_in_days: 21 });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.equal(3);
        expect(response.body.data[0].name).to.be.equal('Rose');
        expect(response.body.data[1].name).to.be.equal('Lily');
        expect(response.body.data[2].name).to.be.equal('Tulip');
      });

      it('Should filter elements by fields, many numbers', async function() {
        const response = await query('flowers', { age_in_days: '20,21' });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.equal(4);
        expect(response.body.data[0].name).to.be.equal('Daisy');
        expect(response.body.data[1].name).to.be.equal('Rose');
        expect(response.body.data[2].name).to.be.equal('Lily');
        expect(response.body.data[3].name).to.be.equal('Tulip');
      });

      it('Should filter elements by fields, boolean', async function() {
        const response = await query('flowers', { boolean_value: true });

        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.equal(5);
        expect(response.body.data[0].name).to.be.equal('Daisy');
        expect(response.body.data[1].name).to.be.equal('Lily');
        expect(response.body.data[2].name).to.be.equal('Tulip');
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
          expect(response.body.data[0].name <= createdDocuments[1].name).to.be.true;
        }

        if (response.body.data[1]) {
          expect(response.body.data[1].name <= response.body.data[0].name).to.be.true;
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

      it('Should handle null values (bug: null converted to "0")', async function() {
        const response = await patch('flowers', createdDocuments[4].id, { age_in_days: null} );

        expect(response.body.age_in_days).to.be.null;
      });

      it('Should be able to update nested fields', async function() {
        let response = await post('nested', {
          level1 : {
            level1Value : 'val1b',
            level2 : {
              level2Value : 'val2b'
            }
          }
        });

        expect(response).to.have.status(200);

        response = await patch('nested', response.body.id, {level1 : {level2 : { level2Value : 'modified' }}});

        expect(response).to.have.status(200);
        expect(response.body.level1.level2.level2Value).to.be.equal('modified');
      });


      it('Should be able to replace document with nested fields', async function() {
        let response = await post('nested', {
          level1 : {
            level1Value : 'val1b',
            level2 : {
              level2Value : 'val2b'
            }
          }
        });

        expect(response).to.have.status(200);

        const body = response.body;
        body.level1.level2.level2Value = 'modifiedagain';

        response = await put('nested', response.body.id, body);

        expect(response).to.have.status(200);
        expect(response.body.level1.level2.level2Value).to.be.equal('modifiedagain');
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



    /********
    TYPES
    */
    describe('Types options', async function() {
      it('should test min and max and pass', async function() {
        const response = await post('types', {number: 6});

        expect(response).to.have.status(200);
        expect(response.body.number).to.be.equal(6);
      });

      it('should test min and max and fail', async function() {
        const response = await post('types', {number: 10});

        expect(response).to.have.status(400);
      });

      it('should test lowercase and pass', async function() {
        const response = await post('types', {lower: 'LoWer'});

        expect(response).to.have.status(200);
        expect(response.body.lower).to.be.equal('lower');
      });

      it('should test uppercase and pass', async function() {
        const response = await post('types', {upper: 'uppEr'});

        expect(response).to.have.status(200);
        expect(response.body.upper).to.be.equal('UPPER');
      });

      it('should test trim and pass', async function() {
        const response = await post('types', {trim: '     Please need a trim     '});

        expect(response).to.have.status(200);
        expect(response.body.trim).to.be.equal('Please need a trim');
      });

      it('should test match and pass', async function() {
        const response = await post('types', {email: 'good.email@hotmail.com'});

        expect(response).to.have.status(200);
        expect(response.body.email).to.be.equal('good.email@hotmail.com');
      });

      it('should test minlength and maxlength and pass', async function() {
        const response = await post('types', {minmax: 'abcd'});

        expect(response).to.have.status(200);
        expect(response.body.minmax).to.be.equal('abcd');
      });

      it('should test minlength and maxlength and fail', async function() {
        const response = await post('types', {minmax: 'abcdefghijklmno'});

        expect(response).to.have.status(400);
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
      serial : {type: 'String', 'unique': true},
      boolean_value : {type : 'Boolean'},
    }
  },
  'types' : {
    schema: {
      number : {type: 'Number', 'min': 0, 'max': 9},
      lower  : {type: 'String', 'lowercase': true},
      upper  : {type: 'String', 'uppercase': true},
      trim   : {type: 'String', 'trim': true},
      email  : {type: 'String', 'match': [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']},
      minmax : {type: 'String', 'minlength': 3, 'maxlength': 5}
    }
  },
  'nested' : {
    schema : {
      level1 : {
        level1Value : {type : 'String'},
        level2 : {
          level2Value : {type : 'String'},
        }
      }
    }
  }
};

module.exports = {
  databaseTestSuite,
  dataModels,
  jwtSecret
}
